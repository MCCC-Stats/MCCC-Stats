
/* ==========================================
   MCCC STATS — RECORDS & MILESTONES
   ========================================== */

(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const events = typeof MCCC_EVENTS !== "undefined" ? MCCC_EVENTS : [];
  const games = typeof MCCC_GAMES !== "undefined" ? MCCC_GAMES : [];
  const data = typeof MCCC_DATA !== "undefined" ? MCCC_DATA : null;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  const escapeHTML = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  const format = value =>
    Number(value).toLocaleString("en-IE", {
      maximumFractionDigits: 2
    });

  const playerURL = name =>
    `player.html?name=${encodeURIComponent(name.toLowerCase())}`;

  const eventURL = event =>
    `event.html?id=${encodeURIComponent(event.id)}`;

  /* ==========================================
     PLAYER HEADS
     ========================================== */

  const specialHeads = new Set([
    "creep1et",
    "sacred_bean",
    "wailed_burrito61",
    "froopyloopidy",
    "awsomeants"
  ]);

  function playerImage(name) {
    const username = encodeURIComponent(name.toLowerCase());
    const size = specialHeads.has(name.toLowerCase()) ? 64 : 32;

    return `
      <img
        src="https://mc-heads.net/avatar/${username}/${size}"
        alt=""
        loading="lazy"
        onerror="
          if (!this.dataset.fallback) {
            this.dataset.fallback = '1';
            this.src = 'https://minotar.net/avatar/${username}/64';
          } else if (this.dataset.fallback === '1') {
            this.dataset.fallback = '2';
            this.src = 'https://mc-heads.net/avatar/Steve/64';
          } else {
            this.onerror = null;
            this.style.visibility = 'hidden';
          }
        "
      >
    `;
  }

  function playerView(name) {
    return `
      <span class="records-holder">
        ${playerImage(name)}
        <a href="${playerURL(name)}">${escapeHTML(name)}</a>
      </span>
    `;
  }

  /* ==========================================
     TEAM ICONS
     ========================================== */

  const teamColours = [
    "red", "orange", "yellow", "lime", "green",
    "cyan", "aqua", "blue", "purple", "pink"
  ];

  function teamColour(team) {
    const id = String(team.id || "").toLowerCase();
    const name = String(team.name || "").toLowerCase();

    return teamColours.find(colour =>
      id === colour ||
      id.startsWith(colour + "_") ||
      id.startsWith(colour + "-") ||
      name.startsWith(colour + " ")
    ) || null;
  }

  function teamIcon(team, event) {
    if (team.icon) return team.icon;

    const colour = teamColour(team);
    if (!colour) return null;

    const theme = String(
      event?.theme || event?.name || ""
    ).toLowerCase();

    if (theme.includes("christmas")) {
      return `assets/teams/christmas/${colour}.webp`;
    }

    if (theme.includes("halloween")) {
      return `assets/teams/halloween/${colour}.webp`;
    }

    return `assets/teams/${colour}.webp`;
  }

  function teamImage(team, event) {
    const icon = teamIcon(team, event);
    if (!icon) return "";

    const fallback = `assets/teams/${teamColour(team) || "red"}.webp`;

    return `
      <img
        src="${escapeHTML(icon)}"
        alt=""
        loading="lazy"
        onerror="this.onerror=null;this.src='${fallback}'"
      >
    `;
  }

  function teamView(entry) {
    return `
      <span class="records-holder team">
        ${teamImage(entry.team, entry.event)}
        <strong>${escapeHTML(entry.team.name)}</strong>
      </span>
    `;
  }

  function identity(entry, type) {
    return type === "team"
      ? teamView(entry)
      : playerView(entry.name);
  }

  function eventView(event) {
    return `<a href="${eventURL(event)}">${escapeHTML(event.name)}</a>`;
  }

  /* ==========================================
     FILTERING
     ========================================== */

  function selectedEvents() {
    const season = $("records-season").value;
    const count = $("records-team-count").value;
    const noncanon = $("records-noncanon").checked;

    return events.filter(event =>
      (season === "all" || String(event.season) === season) &&
      (count === "all" || String(event.teams?.length) === count) &&
      (noncanon || !event.noncanon)
    );
  }

  /* ==========================================
     PARTICIPATION AND SCORING
     ========================================== */

  function playedGame(event, name, index) {
    const scores = event.scores?.[name];

    return Array.isArray(scores) &&
      Number.isFinite(scores[index]) &&
      event.participation?.[name]?.[index] !== false;
  }

  function playedAllGames(event, name) {
    return Array.isArray(event.games) &&
      event.games.length > 0 &&
      event.games.every((_, i) => playedGame(event, name, i));
  }

  function playerTotal(event, name) {
    return event.games.reduce(
      (sum, _, i) =>
        sum + (playedGame(event, name, i) ? event.scores[name][i] : 0),
      0
    );
  }

  function teamGameTotal(event, team, index) {
    const playerPoints = team.players.reduce(
      (sum, name) =>
        sum + (playedGame(event, name, index)
          ? event.scores[name][index]
          : 0),
      0
    );

    return playerPoints +
      (Number(event.ghostScores?.[team.id]?.[index]) || 0);
  }

  function teamTotal(event, team, multiplied) {
    if (multiplied && typeof data?.getTeamTotal === "function") {
      return data.getTeamTotal(event, team, true);
    }

    return event.games.reduce((sum, _, i) =>
      sum +
      teamGameTotal(event, team, i) *
      (multiplied ? (event.multipliers?.[i] ?? 1) : 1),
    0);
  }

  /* ==========================================
     CAREER STREAKS
     ========================================== */

  // Consecutive appearances, not consecutive events.
  // Skipping an event does not break a streak.

  function calculateStreaks(appearances, condition) {
    const result = [];
    let current = [];

    function finish() {
      if (!current.length) return;

      result.push({
        name: current[0].name,
        value: current.length,
        startEvent: current[0].event,
        endEvent: current[current.length - 1].event
      });

      current = [];
    }

    for (const appearance of appearances) {
      if (condition(appearance)) {
        current.push(appearance);
      } else {
        finish();
      }
    }

    finish();
    return result;
  }

  function allStreaks(appearancesByPlayer, condition) {
    const result = [];

    for (const appearances of appearancesByPlayer.values()) {
      result.push(...calculateStreaks(appearances, condition));
    }

    return result;
  }

  /* ==========================================
     CALCULATE RECORDS
     ========================================== */

  function calculate(selected) {
    const individualScores = [];
    const individualLeads = [];

    const teamScores = [];
    const unmultipliedTeamScores = [];
    const teamLeads = [];
    const missedDodgebolt = [];
    const reachedDodgebolt = [];

    const gamePlayers = [];
    const gameTeams = [];

    const careers = new Map();
    const appearancesByPlayer = new Map();

    function getCareer(name) {
      const key = name.toLowerCase();

      if (!careers.has(key)) {
        careers.set(key, {
          name,
          appearances: 0,
          wins: 0,
          finals: 0,
          coins: 0,
          gameFirsts: 0
        });
      }

      return careers.get(key);
    }

    const chronological = [...selected].sort(
      (a, b) => Number(a.id) - Number(b.id)
    );

    for (const event of chronological) {
      const eventGames = event.games || [];
      const eventTeams = event.teams || [];
      const scores = event.scores || {};
      const standings = [];

      /* INDIVIDUAL SCORES AND APPEARANCES */

      for (const [name, values] of Object.entries(scores)) {
        if (!Array.isArray(values)) continue;

        const indices = eventGames
          .map((_, i) => i)
          .filter(i => playedGame(event, name, i));

        if (!indices.length) continue;

        const career = getCareer(name);
        career.appearances++;

        const key = name.toLowerCase();

        if (!appearancesByPlayer.has(key)) {
          appearancesByPlayer.set(key, []);
        }

        const playerTeam = eventTeams.find(team =>
          team.players.some(player =>
            player.toLowerCase() === key
          )
        );

        const finalists = event.dodgebolt?.finalists || [];
        const winner = event.dodgebolt?.winner;

        const reached = !!playerTeam &&
          finalists.includes(playerTeam.id);

        const won = !!playerTeam &&
          winner === playerTeam.id;

        appearancesByPlayer.get(key).push({
          name,
          event,
          reached,
          won
        });

        if (reached) career.finals++;
        if (won) career.wins++;

        for (const i of indices) {
          gamePlayers.push({
            name,
            event,
            gameId: eventGames[i],
            value: values[i]
          });
        }

        // Partial participants can hold game records,
        // but not full-event individual records.
        if (!playedAllGames(event, name)) continue;

        const total = playerTotal(event, name);

        const entry = {
          name,
          event,
          value: total
        };

        individualScores.push(entry);
        standings.push(entry);
        career.coins += total;
      }

      /* LARGEST INDIVIDUAL LEAD OVER SECOND */

      const rankedPlayers = [...standings].sort(
        (a, b) => b.value - a.value
      );

      if (rankedPlayers.length >= 2) {
        const first = rankedPlayers[0].value;
        const second = rankedPlayers[1].value;
        const margin = first - second;

        for (const entry of rankedPlayers) {
          if (Math.abs(entry.value - first) < 0.000001) {
            individualLeads.push({
              name: entry.name,
              event,
              value: margin
            });
          }
        }
      }

      /* TEAM SCORES */

      const eventTeamResults = [];

      for (const team of eventTeams) {
        const multiplied = teamTotal(event, team, true);
        const unmultiplied = teamTotal(event, team, false);

        if (Number.isFinite(multiplied)) {
          const entry = {
            team,
            event,
            value: multiplied
          };

          teamScores.push(entry);
          eventTeamResults.push(entry);

          if (Array.isArray(event.dodgebolt?.finalists)) {
            const finalists = event.dodgebolt.finalists;

            if (finalists.includes(team.id)) {
              reachedDodgebolt.push(entry);
            } else {
              missedDodgebolt.push(entry);
            }
          }
        }

        if (Number.isFinite(unmultiplied)) {
          unmultipliedTeamScores.push({
            team,
            event,
            value: unmultiplied
          });
        }

        for (let i = 0; i < eventGames.length; i++) {
          gameTeams.push({
            team,
            event,
            gameId: eventGames[i],
            value: teamGameTotal(event, team, i)
          });
        }
      }

      /* LARGEST TEAM LEAD */

      eventTeamResults.sort(
        (a, b) => b.value - a.value
      );

      if (eventTeamResults.length >= 2) {
        const first = eventTeamResults[0].value;
        const second = eventTeamResults[1].value;
        const margin = first - second;

        for (const entry of eventTeamResults) {
          if (Math.abs(entry.value - first) < 0.000001) {
            teamLeads.push({
              team: entry.team,
              event,
              value: margin
            });
          }
        }
      }

      /* INDIVIDUAL GAME FIRST PLACES */

      for (const gameId of new Set(eventGames)) {
        const results = gamePlayers.filter(entry =>
          entry.event === event &&
          entry.gameId === gameId
        );

        if (!results.length) continue;

        const highest = Math.max(
          ...results.map(entry => entry.value)
        );

        for (const entry of results) {
          if (Math.abs(entry.value - highest) < 0.000001) {
            getCareer(entry.name).gameFirsts++;
          }
        }
      }
    }

    /* STREAKS — CONSECUTIVE APPEARANCES */

    const winStreaks = allStreaks(
      appearancesByPlayer,
      appearance => appearance.won
    );

    const dodgeboltStreaks = allStreaks(
      appearancesByPlayer,
      appearance => appearance.reached
    );

    const missedStreaks = allStreaks(
      appearancesByPlayer,
      appearance => !appearance.reached
    );

    return {
      individualScores,
      individualLeads,
      teamScores,
      unmultipliedTeamScores,
      teamLeads,
      missedDodgebolt,
      reachedDodgebolt,
      gamePlayers,
      gameTeams,
      careers: [...careers.values()],
      winStreaks,
      dodgeboltStreaks,
      missedStreaks
    };
  }

  /* ==========================================
     RECORD SELECTION
     ========================================== */

  function recordHolders(items, field, lowest = false) {
    const valid = items.filter(item =>
      Number.isFinite(item[field])
    );

    if (!valid.length) return [];

    const target = lowest
      ? Math.min(...valid.map(item => item[field]))
      : Math.max(...valid.map(item => item[field]));

    return valid.filter(item =>
      Math.abs(item[field] - target) < 0.000001
    );
  }

  // Keep repeated records from different events.
  function uniqueHolders(entries, type) {
    const seen = new Set();

    return entries.filter(entry => {
      let key;

      if (type === "team") {
        key = `${entry.event?.id}/${entry.team?.id}`;
      } else if (entry.startEvent) {
        key = `${entry.name.toLowerCase()}/${entry.startEvent.id}/${entry.endEvent.id}`;
      } else if (entry.event) {
        key = `${entry.name.toLowerCase()}/${entry.event.id}`;
      } else {
        key = entry.name.toLowerCase();
      }

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /* ==========================================
     STREAK EVENT RANGES
     ========================================== */

  function streakRange(entry) {
    if (!entry.startEvent || !entry.endEvent) return "";

    const start = entry.startEvent;
    const end = entry.endEvent;

    if (String(start.id) === String(end.id)) {
      return `
        <span class="records-streak-range">
          ${eventView(start)}
        </span>
      `;
    }

    return `
      <span class="records-streak-range">
        ${eventView(start)}
        <span class="records-streak-arrow">→</span>
        ${eventView(end)}
      </span>
    `;
  }

  /* ==========================================
     RECORD TABLES
     ========================================== */

  function tableRow(label, entries, field, type = "player") {
    if (!entries.length) return "";

    const holders = uniqueHolders(entries, type);
    const first = holders[0];

    const holderContent = holders.map(entry => `
      <div class="records-direct-holder">
        ${identity(entry, type)}

        ${entry.startEvent
          ? streakRange(entry)
          : holders.length > 1 && entry.event
            ? `<small>${eventView(entry.event)}</small>`
            : ""}
      </div>
    `).join("");

    let eventContent;

    if (first.startEvent) {
      eventContent = holders.length === 1
        ? streakRange(first)
        : `${holders.length} streaks`;
    } else if (holders.length > 1) {
      eventContent = `${holders.length} record occurrences`;
    } else if (first.event) {
      eventContent = eventView(first.event);
    } else {
      eventContent = "Career record";
    }

    return `
      <div class="records-record">
        <div class="records-record-label">
          ${escapeHTML(label)}
        </div>

        <div class="records-record-value">
          ${format(first[field])}
        </div>

        <div class="records-holder-cell records-direct-holders">
          ${holderContent}
        </div>

        <div class="records-event">
          ${eventContent}
        </div>
      </div>
    `;
  }

  function table(rows) {
    return `
      <div class="records-table-head">
        <span>Record</span>
        <span>Value</span>
        <span>Holder</span>
        <span>Event</span>
      </div>

      ${rows || `
        <div class="records-empty">
          No qualifying records available.
        </div>
      `}
    `;
  }

  /* ==========================================
     HALL OF FAME
     ========================================== */

  function highlight(label, entries, field, type = "player") {
    if (!entries.length) {
      return `
        <div class="records-highlight">
          <span class="records-highlight-label">
            ${escapeHTML(label)}
          </span>
          <strong class="records-highlight-value">—</strong>
        </div>
      `;
    }

    const holders = uniqueHolders(entries, type);
    const first = holders[0];

    return `
      <div class="records-highlight">
        <span class="records-highlight-label">
          ${escapeHTML(label)}
        </span>

        <strong class="records-highlight-value">
          ${format(first[field])}
        </strong>

        <div class="records-highlight-holders">
          ${holders.map(entry => `
            <div class="records-highlight-identity">
              ${type === "team"
                ? teamImage(entry.team, entry.event)
                : playerImage(entry.name)}

              ${type === "team"
                ? `<strong class="records-highlight-name">
                     ${escapeHTML(entry.team.name)}
                   </strong>`
                : `<a
                     class="records-highlight-name"
                     href="${playerURL(entry.name)}"
                   >
                     ${escapeHTML(entry.name)}
                   </a>`}

              <small>
                ${entry.event
                  ? eventView(entry.event)
                  : "Career record"}
              </small>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  /* ==========================================
     ENTRANCE ANIMATIONS
     ========================================== */

  function animateEntrance(container) {
    if (reduceMotion.matches) return;

    const highlights = [
      ...container.querySelectorAll(".records-highlight")
    ];

    const rows = [
      ...container.querySelectorAll(".records-record")
    ].filter(row => !row.closest(".records-game-body"));

    const gameCards = [
      ...container.querySelectorAll(".records-game")
    ];

    function animateElements(elements, distance, duration, stagger) {
      elements.forEach((element, index) => {
        element.animate(
          [
            {
              opacity: 0,
              transform: `translateY(${distance}px)`
            },
            {
              opacity: 1,
              transform: "translateY(0)"
            }
          ],
          {
            duration,
            delay: Math.min(index * stagger, 300),
            easing: EASE,
            fill: "backwards"
          }
        );
      });
    }

    animateElements(highlights, 12, 400, 50);
    animateElements(rows, 8, 320, 30);
    animateElements(gameCards, 8, 350, 40);
  }

  /* ==========================================
     RENDER
     ========================================== */

  function render() {
    const selected = selectedEvents();

    $("records-status").textContent =
      `${selected.length} events included · ` +
      `Streaks count consecutive appearances, not consecutive events.`;

    const container = $("records-content");
    container.hidden = !selected.length;

    if (!selected.length) return;

    const records = calculate(selected);

    const highestIndividual = recordHolders(
      records.individualScores, "value"
    );

    const highestTeam = recordHolders(
      records.teamScores, "value"
    );

    const highestUnmultipliedTeam = recordHolders(
      records.unmultipliedTeamScores, "value"
    );

    const mostWins = recordHolders(
      records.careers, "wins"
    );

    /* HALL OF FAME */

    $("records-highlights").innerHTML = [
      highlight(
        "Highest Event Score",
        highestIndividual,
        "value"
      ),
      highlight(
        "Most Dodgebolt Wins",
        mostWins,
        "wins"
      ),
      highlight(
        "Highest Unmultiplied Team Score",
        highestUnmultipliedTeam,
        "value",
        "team"
      ),
      highlight(
        "Highest Multiplied Team Score",
        highestTeam,
        "value",
        "team"
      )
    ].join("");

    /* INDIVIDUAL RECORDS */

    $("records-individual").innerHTML = table([
      tableRow(
        "Highest Individual Event Score",
        highestIndividual,
        "value"
      ),
      tableRow(
        "Most Career Coins",
        recordHolders(records.careers, "coins"),
        "coins"
      ),
      tableRow(
        "Largest Individual Lead Over 2nd",
        recordHolders(records.individualLeads, "value"),
        "value"
      )
    ].join(""));

    /* TEAM RECORDS */

    $("records-teams").innerHTML = table([
      tableRow(
        "Highest Multiplied Team Score",
        highestTeam,
        "value",
        "team"
      ),
      tableRow(
        "Highest Unmultiplied Team Score",
        highestUnmultipliedTeam,
        "value",
        "team"
      ),
      tableRow(
        "Largest Lead Over 2nd",
        recordHolders(records.teamLeads, "value"),
        "value",
        "team"
      ),
      tableRow(
        "Highest-Scoring Team to Miss Dodgebolt",
        recordHolders(records.missedDodgebolt, "value"),
        "value",
        "team"
      ),
      tableRow(
        "Lowest-Scoring Team to Reach Dodgebolt",
        recordHolders(records.reachedDodgebolt, "value", true),
        "value",
        "team"
      )
    ].join(""));

    /* GAME RECORDS */

    $("records-games").innerHTML = games.map((game, index) => {
      const individual = recordHolders(
        records.gamePlayers.filter(entry =>
          entry.gameId === game.id
        ),
        "value"
      );

      const team = recordHolders(
        records.gameTeams.filter(entry =>
          entry.gameId === game.id
        ),
        "value"
      );

      const best = individual[0];
      const icon = game.icon || `assets/games/${game.id}.webp`;

      const summary = !best
        ? "No scores available"
        : `Individual record: ${format(best.value)} — ${
            uniqueHolders(individual, "player")
              .map(entry => escapeHTML(entry.name))
              .join(", ")
          }`;

      return `
        <section class="records-game">
          <button
            type="button"
            class="records-game-summary"
            aria-expanded="false"
            aria-controls="records-game-${index}"
          >
            <img
              src="${escapeHTML(icon)}"
              alt=""
              onerror="this.style.display='none'"
            >

            <span class="records-game-info">
              <strong>${escapeHTML(game.name)}</strong>
              <small>${summary}</small>
            </span>

            <span class="records-game-arrow">›</span>
          </button>

          <div
            id="records-game-${index}"
            class="records-game-body"
            hidden
          >
            ${table(
              tableRow(
                "Highest Individual Game Score",
                individual,
                "value"
              ) +
              tableRow(
                "Highest Unmultiplied Team Game Score",
                team,
                "value",
                "team"
              )
            )}
          </div>
        </section>
      `;
    }).join("");

    /* CAREER MILESTONES */

    $("records-milestones").innerHTML = table([
      tableRow(
        "Most Event Appearances",
        recordHolders(records.careers, "appearances"),
        "appearances"
      ),
      tableRow(
        "Most Dodgebolt Wins",
        mostWins,
        "wins"
      ),
      tableRow(
        "Most Dodgebolt Appearances",
        recordHolders(records.careers, "finals"),
        "finals"
      ),
      tableRow(
        "Most Individual Game 1st Places",
        recordHolders(records.careers, "gameFirsts"),
        "gameFirsts"
      ),
      tableRow(
        "Most Consecutive Dodgebolt Wins",
        recordHolders(records.winStreaks, "value"),
        "value"
      ),
      tableRow(
        "Most Consecutive Dodgebolt Appearances",
        recordHolders(records.dodgeboltStreaks, "value"),
        "value"
      ),
      tableRow(
        "Most Consecutive Appearances Without Dodgebolt",
        recordHolders(records.missedStreaks, "value"),
        "value"
      )
    ].join(""));

    animateEntrance(container);
  }

  /* ==========================================
     SMOOTH GAME EXPANSION
     ========================================== */

  const gameAnimations = new WeakMap();

  function toggleGame(button) {
    const panel = $(button.getAttribute("aria-controls"));
    if (!panel) return;

    const opening =
      button.getAttribute("aria-expanded") !== "true";

    const previous = gameAnimations.get(panel);

    // Capture the current visible height before cancelling
    // an existing animation, so rapid clicks stay smooth.
    const currentHeight = panel.hidden
      ? 0
      : panel.getBoundingClientRect().height;

    if (previous) {
      previous.cancel();
      gameAnimations.delete(panel);
    }

    button.setAttribute("aria-expanded", String(opening));

    if (reduceMotion.matches) {
      panel.hidden = !opening;
      panel.style.height = "";
      panel.style.opacity = "";
      panel.style.overflow = "";
      return;
    }

    panel.style.overflow = "hidden";

    if (opening) {
      // Establish a real zero-height layout BEFORE
      // revealing the contents.
      panel.style.height = `${currentHeight}px`;
      panel.style.opacity = currentHeight > 0 ? "1" : "0";
      panel.hidden = false;

      // scrollHeight measures the contents even while
      // the element is constrained to zero height.
      const targetHeight = panel.scrollHeight;

      const animation = panel.animate(
        [
          {
            height: `${currentHeight}px`,
            opacity: currentHeight > 0 ? 1 : 0
          },
          {
            height: `${targetHeight}px`,
            opacity: 1
          }
        ],
        {
          duration: 350,
          easing: EASE,
          fill: "forwards"
        }
      );

      gameAnimations.set(panel, animation);

      animation.onfinish = () => {
        if (gameAnimations.get(panel) !== animation) return;

        // Keep the panel at its expanded height after
        // removing the animation's temporary styles.
        panel.style.height = "auto";
        panel.style.opacity = "1";
        panel.style.overflow = "";

        animation.cancel();
        gameAnimations.delete(panel);
      };

    } else {
      panel.style.height = `${currentHeight}px`;
      panel.style.opacity = "1";

      const animation = panel.animate(
        [
          {
            height: `${currentHeight}px`,
            opacity: 1
          },
          {
            height: "0px",
            opacity: 0
          }
        ],
        {
          duration: 280,
          easing: EASE,
          fill: "forwards"
        }
      );

      gameAnimations.set(panel, animation);

      animation.onfinish = () => {
        if (gameAnimations.get(panel) !== animation) return;

        // Hide only AFTER the height reaches zero.
        panel.hidden = true;
        panel.style.height = "";
        panel.style.opacity = "";
        panel.style.overflow = "";

        animation.cancel();
        gameAnimations.delete(panel);
      };
    }
  }

  document.addEventListener("click", event => {
    const button = event.target.closest(".records-game-summary");
    if (!button) return;

    toggleGame(button);
  });

  /* ==========================================
     FILTERS
     ========================================== */

  [
    "records-season",
    "records-team-count",
    "records-noncanon"
  ].forEach(id => {
    $(id).addEventListener("change", render);
  });

  /* ==========================================
     INITIAL RENDER
     ========================================== */

  render();

})();
