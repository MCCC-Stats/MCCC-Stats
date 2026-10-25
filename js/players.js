
/* MCCC Stats — Players directory */
document.addEventListener("DOMContentLoaded", () => {
  const events = window.MCCC_EVENTS || [];
  const games = window.MCCC_GAMES || [];
  const $ = id => document.getElementById(id);
  const tbody = $("players-body");
  const PAGE_SIZE = 25;
  const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let page = 0;
  let sortKey = "average";
  let sortDirection = "desc";
  let currentRows = new Map();

  const normalizeName = name => String(name).trim().toLowerCase();
  const formatNumber = value => Number(value).toLocaleString("en-IE", { maximumFractionDigits: 2 });
  const average = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const isCanon = event => event.noncanon !== true && event.canon !== false;
  const gameId = game => typeof game === "string" ? game : game.id;
  const getSeason = event => event.season != null ? Number(event.season) : Number(event.id) <= 10 ? 1 : 2;
  const defaultDirection = key => key === "placement" || key === "alphabetical" ? "asc" : "desc";

  function getPlayerScores(event, name) {
    const key = Object.keys(event.scores || {}).find(key => normalizeName(key) === normalizeName(name));
    return key ? event.scores[key] : null;
  }

  function playedFullEvent(event, name) {
    const participation = Object.entries(event.participation || {})
      .find(([key]) => normalizeName(key) === normalizeName(name))?.[1];
    if (!participation) return true;
    return participation.length === (event.games || []).length && participation.every(Boolean);
  }

  function getEventPlayers(event) {
    const names = new Map();
    (event.teams || []).forEach(team => (team.players || []).forEach(name => names.set(normalizeName(name), name)));
    return [...names.values()];
  }

  // Canon-only five-team baseline. Five-team events always retain their raw scores.
  const totals = new Map();
  const factors = new Map();
  events.filter(event => isCanon(event) && Array.isArray(event.teams) && Array.isArray(event.games))
    .forEach(event => {
      event.games.forEach((game, index) => {
        const key = `${event.teams.length}:${gameId(game)}`;
        if (!totals.has(key)) totals.set(key, { sum: 0, count: 0 });
        const entry = totals.get(key);
        Object.entries(event.scores || {}).forEach(([name, scores]) => {
          if (!playedFullEvent(event, name)) return;
          const score = scores?.[index];
          if (typeof score !== "number" || !Number.isFinite(score)) return;
          entry.sum += score;
          entry.count++;
        });
      });
    });

  games.forEach(game => {
    const baseline = totals.get(`5:${game.id}`);
    if (!baseline?.count || baseline.sum <= 0) return;
    [4, 5, 6].forEach(teamCount => {
      const entry = totals.get(`${teamCount}:${game.id}`);
      if (!entry?.count || entry.sum <= 0) return;
      const factor = game.id === "hole_in_the_wall" ? 1 :
        (baseline.sum / baseline.count) / (entry.sum / entry.count);
      factors.set(`${teamCount}:${game.id}`, factor);
    });
  });

  function getPlayerTotal(event, name, mode) {
    const scores = getPlayerScores(event, name);
    if (!Array.isArray(scores)) return null;
    return (event.games || []).reduce((sum, game, index) => {
      const score = Number(scores[index]) || 0;
      const teamCount = event.teams?.length;
      const factor = mode === "normalized" && teamCount !== 5
        ? (factors.get(`${teamCount}:${gameId(game)}`) ?? 1) : 1;
      return sum + score * factor;
    }, 0);
  }

  function getEventRanks(event) {
    const standings = getEventPlayers(event).map(name => ({
      name: normalizeName(name),
      coins: (getPlayerScores(event, name) || []).reduce((sum, score) => sum + (Number(score) || 0), 0)
    }));
    return new Map(standings.map(player => [player.name,
      1 + standings.filter(other => other.coins > player.coins).length]));
  }
  const eventRanks = new Map(events.map(event => [event, getEventRanks(event)]));

  function computeLeaderboard() {
    const season = $("players-season").value;
    const mode = $("players-scores").value;
    const includeNoncanon = $("players-noncanon").checked;
    const includeIncomplete = $("players-incomplete").checked;
    const minimum = Number($("players-minimum").value);
    const query = normalizeName($("players-search").value);
    const players = new Map();

    events.filter(event => (includeNoncanon || isCanon(event)) &&
      (season === "all" || getSeason(event) === Number(season)))
      .forEach(event => {
        getEventPlayers(event).forEach(name => {
          if (!includeIncomplete && !playedFullEvent(event, name)) return;
          const score = getPlayerTotal(event, name, mode);
          if (score === null) return;
          const key = normalizeName(name);
          if (!players.has(key)) players.set(key, { name, scores: [], bestEvents: [], placements: [] });
          const player = players.get(key);
          player.scores.push(score);
          player.bestEvents.push({ event: event.name || `MCCC ${event.id}`, score });
          const rank = eventRanks.get(event)?.get(key);
          if (rank != null) player.placements.push(rank);
        });
      });

    const leaderboard = [...players.values()]
      .filter(player => player.scores.length >= minimum && normalizeName(player.name).includes(query))
      .map(player => {
        const best = player.bestEvents.reduce((winner, current) =>
          !winner || current.score > winner.score ? current : winner, null);
        return {
          name: player.name, events: player.scores.length,
          average: average(player.scores), best: best?.score ?? 0,
          bestEvent: best?.event ?? "",
          placement: player.placements.length ? average(player.placements) : null
        };
      });

    leaderboard.sort((a, b) => {
      const alpha = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      if (sortKey === "alphabetical") return sortDirection === "asc" ? alpha : -alpha;
      const av = a[sortKey] ?? (sortDirection === "asc" ? Infinity : -Infinity);
      const bv = b[sortKey] ?? (sortDirection === "asc" ? Infinity : -Infinity);
      const diff = sortDirection === "asc" ? av - bv : bv - av;
      return diff || alpha;
    });
    return leaderboard;
  }

  function createPlayerHead(name) {
    const image = document.createElement("img");
    const username = normalizeName(name);
    const large = ["creep1et", "sacred_bean", "wailed_burrito61", "froopyloopidy", "fennecfox1247"].includes(username);
    image.src = `https://mc-heads.net/avatar/${encodeURIComponent(username)}/${large ? 64 : 32}`;
    image.alt = "";
    image.loading = "lazy";
    image.onerror = () => {
      if (!image.dataset.fallback) {
        image.dataset.fallback = "1";
        image.src = `https://minotar.net/avatar/${encodeURIComponent(name)}/64`;
      } else image.style.visibility = "hidden";
    };
    return image;
  }

  function makeRow(player, rank) {
    const row = document.createElement("tr");
    row.dataset.player = normalizeName(player.name);
    const addCell = value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
      return cell;
    };
    addCell(rank);
    const playerCell = addCell("");
    const link = document.createElement("a");
    link.href = `player.html?name=${encodeURIComponent(player.name)}`;
    const name = document.createElement("span");
    name.textContent = player.name;
    link.append(createPlayerHead(player.name), name);
    playerCell.appendChild(link);

    const averageCell = addCell(formatNumber(player.average));
    const coin = document.createElement("img");
    coin.src = "assets/coin.webp";
    coin.alt = "";
    coin.className = "players-coin-icon";
    averageCell.appendChild(coin);
    addCell(player.events);

    const bestCell = addCell("");
    bestCell.className = "players-best-cell";
    const wrapper = document.createElement("div");
    wrapper.className = "players-best-wrapper";
    const score = document.createElement("span");
    score.className = "players-best-score";
    score.textContent = formatNumber(player.best);
    const event = document.createElement("span");
    event.className = "players-best-event";
    event.textContent = player.bestEvent;
    wrapper.append(score, event);
    bestCell.appendChild(wrapper);
    addCell(player.placement == null ? "—" : player.placement.toFixed(1));
    return row;
  }

  function updateSortHeadings() {
    document.querySelectorAll(".players-sort-heading").forEach(button => {
      const active = button.dataset.sort === sortKey;
      button.classList.toggle("is-active", active);
      button.querySelector(".players-sort-arrow").textContent = active
        ? (sortDirection === "asc" ? "↑" : "↓") : "";
      button.closest("th").setAttribute("aria-sort", !active ? "none" :
        sortDirection === "asc" ? "ascending" : "descending");
    });
    $("players-sort").value = sortKey;
  }

  // FLIP: measure existing rows, update immediately, then animate from old positions.
  function render(animation = "filter") {
    const oldPositions = new Map();
    if (animation === "sort" && !reduceMotion.matches) {
      tbody.querySelectorAll("tr[data-player]").forEach(row => {
        oldPositions.set(row.dataset.player, row.getBoundingClientRect());
      });
    }

    const leaderboard = computeLeaderboard();
    const totalPages = Math.max(1, Math.ceil(leaderboard.length / PAGE_SIZE));
    page = Math.min(page, totalPages - 1);
    const visible = leaderboard.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const fragment = document.createDocumentFragment();
    const newRows = new Map();

    visible.forEach((player, index) => {
      const row = makeRow(player, page * PAGE_SIZE + index + 1);
      newRows.set(normalizeName(player.name), row);
      fragment.appendChild(row);
    });
    if (!visible.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.className = "players-empty";
      cell.textContent = "No players match the selected filters.";
      row.appendChild(cell);
      fragment.appendChild(row);
    }
    tbody.replaceChildren(fragment);
    currentRows = newRows;

    $("players-count").textContent = `${leaderboard.length} Players`;
    $("players-page-label").textContent = `${page + 1} / ${totalPages}`;
    $("players-prev").disabled = page === 0;
    $("players-next").disabled = page >= totalPages - 1;
    updateSortHeadings();

    if (reduceMotion.matches) return;
    if (animation === "sort" && oldPositions.size) {
      newRows.forEach((row, key) => {
        const previous = oldPositions.get(key);
        if (!previous) {
          row.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: EASE });
          return;
        }
        const delta = previous.top - row.getBoundingClientRect().top;
        if (Math.abs(delta) > 0.5) {
          row.animate([
            { transform: `translateY(${delta}px)` },
            { transform: "translateY(0)" }
          ], { duration: 450, easing: EASE });
        }
      });
    } else if (animation !== "none") {
      tbody.animate([
        { opacity: 0.55, transform: "translateY(5px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 300, easing: EASE });
    }
  }

  document.querySelectorAll(".players-sort-heading").forEach(button => {
    button.addEventListener("click", () => {
      const next = button.dataset.sort;
      if (next === sortKey) sortDirection = sortDirection === "asc" ? "desc" : "asc";
      else { sortKey = next; sortDirection = defaultDirection(next); }
      page = 0;
      render("sort");
    });
  });

  $("players-sort").addEventListener("change", () => {
    sortKey = $("players-sort").value;
    sortDirection = defaultDirection(sortKey);
    page = 0;
    render("sort");
  });
  
["players-season", "players-minimum", "players-scores", "players-noncanon", "players-incomplete"].forEach(id => {
    $(id).addEventListener("change", () => {
        page = 0;
        render("filter");
    });
});

  $("players-search").addEventListener("input", () => { page = 0; render("filter"); });
  $("players-prev").addEventListener("click", () => {
    if (page > 0) { page--; render("page"); }
  });
  $("players-next").addEventListener("click", () => { page++; render("page"); });
  render("none");
});
