
/* ==========================================
   MCCC STATS - PLAYER COMPARISON
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const events = window.MCCC_EVENTS || [];
  const games = window.MCCC_GAMES || [];
  const $ = id => document.getElementById(id);

  const PLACEHOLDER_SKIN =
  "https://mc-heads.net/body/weeakneSSS/180";

  const names = [
    ...new Map(
      events
        .flatMap(e =>
          (e.teams || []).flatMap(t => t.players || [])
        )
        .map(name => [name.toLowerCase(), name])
    ).values()
  ].sort((a, b) => a.localeCompare(b));

  const params = new URLSearchParams(location.search);

  $("compare-player-a").value =
    params.get("a") || params.get("player1") || "";

  $("compare-player-b").value =
    params.get("b") || params.get("player2") || "";

  // ------------------------------------------
  // HELPERS
  // ------------------------------------------

  const lookup = name => {
  const query = String(name || "").trim().toLowerCase();

  if (!query) return null;

  const fromNames = names.find(
    player => player.toLowerCase() === query
  );

  if (fromNames) return fromNames;

  // Also check score records in case a player is missing
  // from the team roster.
  for (const event of events) {
    const scoreName = Object.keys(event.scores || {})
      .find(player => player.toLowerCase() === query);

    if (scoreName) return scoreName;
  }

  return null;
};

  const isCanon = event =>
    event.noncanon !== true && event.canon !== false;

  const getSeason = event =>
    Number(
      event.season ??
      (Number(event.id) <= 10 ? 1 : 2)
    );

  const getMembers = event =>
    (event.teams || []).flatMap(
      team => team.players || []
    );

  const getGameId = game =>
    typeof game === "string" ? game : game.id;

  const average = values =>
    values.length
      ? values.reduce((sum, value) => sum + value, 0) /
        values.length
      : null;

  const formatNumber = value =>
    value == null
      ? "—"
      : Math.round(value).toLocaleString("en-IE");

  function create(tag, className = "", text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  function getTeam(event, name) {
    return (event.teams || []).find(team =>
      (team.players || []).some(
        player =>
          player.toLowerCase() === name.toLowerCase()
      )
    );
  }

  function getScores(event, name) {
    const key = Object.keys(event.scores || {}).find(
      player =>
        player.toLowerCase() === name.toLowerCase()
    );

    return key ? event.scores[key] : null;
  }

  function playedFullEvent(event, name) {
    const key = Object.keys(
      event.participation || {}
    ).find(
      player =>
        player.toLowerCase() === name.toLowerCase()
    );

    const participation = key
      ? event.participation[key]
      : null;

    return !participation || (
      participation.length ===
        (event.games || []).length &&
      participation.every(Boolean)
    );
  }

  function getRawGameScore(event, name, id) {
    const index = (event.games || []).findIndex(
      game => getGameId(game) === id
    );

    const scores = getScores(event, name);

    if (
      index < 0 ||
      !Array.isArray(scores) ||
      scores[index] === null ||
      scores[index] === undefined ||
      scores[index] === ""
    ) {
      return null;
    }

    const value = Number(scores[index]);

    return Number.isFinite(value)
      ? value
      : null;
  }

  // ------------------------------------------
  // NORMALISATION
  // ------------------------------------------

  const normalizationTotals = new Map();
  const normalizationFactors = new Map();

  events
    .filter(event =>
      isCanon(event) &&
      Array.isArray(event.teams) &&
      Array.isArray(event.games)
    )
    .forEach(event => {
      const teamCount = event.teams.length;

      event.games.forEach((game, index) => {
        const id = getGameId(game);
        const key = `${teamCount}:${id}`;

        if (!normalizationTotals.has(key)) {
          normalizationTotals.set(key, {
            sum: 0,
            count: 0
          });
        }

        Object.entries(
          event.scores || {}
        ).forEach(([name, scores]) => {
          if (!playedFullEvent(event, name)) {
            return;
          }

          const score = scores?.[index];

          if (
            typeof score !== "number" ||
            !Number.isFinite(score)
          ) {
            return;
          }

          const entry = normalizationTotals.get(key);

          entry.sum += score;
          entry.count++;
        });
      });
    });

  games.forEach(game => {
    const baseline = normalizationTotals.get(
      `5:${game.id}`
    );

    if (
      !baseline?.count ||
      baseline.sum <= 0
    ) {
      return;
    }

    const baselineAverage =
      baseline.sum / baseline.count;

    [4, 5, 6].forEach(teamCount => {
      const entry = normalizationTotals.get(
        `${teamCount}:${game.id}`
      );

      if (
        !entry?.count ||
        entry.sum <= 0
      ) {
        return;
      }

      const factor =
        game.id === "hole_in_the_wall"
          ? 1
          : baselineAverage /
            (entry.sum / entry.count);

      normalizationFactors.set(
        `${teamCount}:${game.id}`,
        factor
      );
    });
  });

  function adjustScore(score, event, id) {
    if (score === null) {
      return null;
    }

    if ($("compare-mode").value !== "normalized") {
      return score;
    }

    const factor = normalizationFactors.get(
      `${event.teams?.length}:${id}`
    ) ?? 1;

    return score * factor;
  }

  function getGameScore(event, name, id) {
    return adjustScore(
      getRawGameScore(event, name, id),
      event,
      id
    );
  }

  function getTotal(event, name) {
    return (event.games || []).reduce(
      (total, game) => {
        return total + (
          getGameScore(
            event,
            name,
            getGameId(game)
          ) ?? 0
        );
      },
      0
    );
  }

  // ------------------------------------------
  // PLACEMENTS
  // Always use original raw event scores.
  // ------------------------------------------

  function getRank(event, name, id = null) {
    const standings = getMembers(event)
      .map(player => {
        const score = id === null
          ? (getScores(event, player) || []).reduce(
              (sum, value) =>
                sum + (Number(value) || 0),
              0
            )
          : getRawGameScore(
              event,
              player,
              id
            );

        return {
          name: player,
          score
        };
      })
      .filter(entry =>
        id === null || entry.score !== null
      );

    const target = standings.find(
      entry =>
        entry.name.toLowerCase() ===
        name.toLowerCase()
    );

    if (!target) {
      return null;
    }

    return standings.filter(
      entry => entry.score > target.score
    ).length + 1;
  }

  // ------------------------------------------
  // FILTERS AND APPEARANCES
  // ------------------------------------------

  function getFilteredEvents() {
  const selected = $("compare-season").value;
  const includeNoncanon = $("compare-noncanon").checked;

  return events.filter(event => {
    if (!includeNoncanon && !isCanon(event)) {
      return false;
    }

    if (selected === "1" || selected === "2") {
      return getSeason(event) === Number(selected);
    }

    return true;
  });
}

  function getAppearances(filteredEvents, name) {
  const selected = $("compare-season").value;

  let appearances = filteredEvents
    .filter(event =>
      getTeam(event, name) &&
      (
        $("compare-incomplete").checked ||
        playedFullEvent(event, name)
      )
    )
    .map(event => {
      const team = getTeam(event, name);

      return {
        event,
        coins: getTotal(event, name),
        rank: getRank(event, name),
        win: event.dodgebolt?.winner === team.id,
        dodgebolt:
          (event.dodgebolt?.finalists || []).includes(team.id)
      };
    });

  // Most recent appearances first
  appearances.sort(
    (a, b) => Number(b.event.id) - Number(a.event.id)
  );

  // Apply the appearance limit separately for each player
  if (selected.startsWith("last")) {
    const count = Number(selected.replace("last", ""));
    appearances = appearances.slice(0, count);
  }

  return appearances;
}

  function getEventStatistics(appearances) {
    const coins = appearances.map(
      entry => entry.coins
    );

    const ranks = appearances
      .map(entry => entry.rank)
      .filter(rank => rank !== null);

    return {
      coins: average(coins),
      rank: average(ranks),
      events: appearances.length,
      best: coins.length
        ? Math.max(...coins)
        : null,
      wins: appearances.filter(
        entry => entry.win
      ).length,
      dodgebolts: appearances.filter(
        entry => entry.dodgebolt
      ).length
    };
  }

  // ==========================================
  // EVENT STATISTICS - BAR DESIGN
  // ==========================================

  let compareBarsFrame = 0;
  function renderEventStatistics(
    nameA,
    nameB,
    a,
    b
  ) {
    $("compare-stat-name-a").textContent = nameA;
    $("compare-stat-name-b").textContent = nameB;

    const rows = [
      ["Average Coins", "coins", "percent", "coins"],
      ["Average Placement", "rank", "placement", "rank"],
      ["Events Played", "events", "events", "number"],
      ["Best Event", "best", "percent", "coins"],
      ["Event Wins", "wins", "wins", "number"],
      ["Dodgebolts", "dodgebolts", "dodgebolts", "number"]
    ];

    const container = $("compare-stats");
    cancelAnimationFrame(compareBarsFrame);
    container.replaceChildren();
    const pendingFills = [];

    function differenceText(
      valueA,
      valueB,
      differenceType
    ) {
      if (
        valueA == null ||
        valueB == null
      ) {
        return "Not enough data";
      }

      if (
        Math.abs(valueA - valueB) < 0.000001
      ) {
        return "Equal";
      }

      const higher = Math.max(valueA, valueB);
      const lower = Math.min(valueA, valueB);
      const difference = higher - lower;

      if (differenceType === "percent") {
        if (lower === 0) {
          return `+${formatNumber(difference)} coins`;
        }

        const percent =
          (difference / lower) * 100;

        return `+${percent.toFixed(1)}%`;
      }

      if (differenceType === "placement") {
        return `${difference.toFixed(1)} places higher`;
      }

      if (differenceType === "events") {
        return `+${formatNumber(difference)} events`;
      }

      if (differenceType === "wins") {
        return `+${formatNumber(difference)} wins`;
      }

      if (differenceType === "dodgebolts") {
        return `+${formatNumber(difference)} appearances`;
      }

      return "";
    }

    function displayValue(value, type) {
      if (value == null) {
        return "—";
      }

      if (type === "rank") {
        return value.toFixed(1);
      }

      return formatNumber(value);
    }

    function getBarWidths(
      valueA,
      valueB,
      lowerIsBetter
    ) {
      if (
        valueA == null ||
        valueB == null
      ) {
        return [0, 0];
      }

      if (
        valueA === 0 &&
        valueB === 0
      ) {
        return [0, 0];
      }

      if (lowerIsBetter) {
        if (
          valueA <= 0 ||
          valueB <= 0
        ) {
          return [0, 0];
        }

        const best = Math.min(
          valueA,
          valueB
        );

        return [
          (best / valueA) * 100,
          (best / valueB) * 100
        ];
      }

      const maximum = Math.max(
        valueA,
        valueB,
        0
      );

      if (maximum === 0) {
        return [0, 0];
      }

      return [
        Math.max(
          0,
          valueA / maximum * 100
        ),
        Math.max(
          0,
          valueB / maximum * 100
        )
      ];
    }

    rows.forEach(([
      label,
      key,
      differenceType,
      valueType
    ]) => {
      const valueA = a[key];
      const valueB = b[key];

      const lowerIsBetter =
        key === "rank";

      const leadsA =
        valueA != null &&
        valueB != null &&
        (
          lowerIsBetter
            ? valueA < valueB
            : valueA > valueB
        );

      const leadsB =
        valueA != null &&
        valueB != null &&
        (
          lowerIsBetter
            ? valueB < valueA
            : valueB > valueA
        );

      const [widthA, widthB] =
        getBarWidths(
          valueA,
          valueB,
          lowerIsBetter
        );

      const row = create(
        "div",
        "compare-stat"
      );

      const main = create(
        "div",
        "compare-stat-main"
      );

      function makeSide(
        value,
        width,
        side,
        isBehind
      ) {
        const element = create(
          "div",
          `compare-stat-side compare-stat-${side}` +
          (isBehind ? " is-behind" : "")
        );

        const number = create(
          "strong",
          "compare-stat-number",
          displayValue(value, valueType)
        );

        const track = create(
          "div",
          "compare-stat-track"
        );

        const fill = create(
          "div",
          "compare-stat-fill"
        );

        fill.style.width = "0%";
        pendingFills.push([fill, `${Math.max(0, Math.min(100, width))}%`]);

        track.append(fill);
        element.append(number, track);

        return element;
      }

      const center = create(
        "div",
        "compare-stat-center"
      );

      center.append(
        create(
          "span",
          "compare-stat-label",
          label
        )
      );

      const difference = create(
        "span",
        "compare-stat-difference " +
          (
            leadsA
              ? "lead-a"
              : leadsB
                ? "lead-b"
                : "is-tied"
          ),
        differenceText(
          valueA,
          valueB,
          differenceType
        )
      );

      if (leadsA) {
        difference.textContent =
          "◀ " + difference.textContent;
      } else if (leadsB) {
        difference.textContent += " ▶";
      }

      center.append(difference);

      main.append(
        makeSide(
          valueA,
          widthA,
          "left",
          leadsB
        ),
        center,
        makeSide(
          valueB,
          widthB,
          "right",
          leadsA
        )
      );

      row.append(main);
      container.append(row);
    });

    compareBarsFrame = requestAnimationFrame(() => {
      compareBarsFrame = requestAnimationFrame(() => {
        pendingFills.forEach(([fill, width]) => { fill.style.width = width; });
      });
    });
  }

  // ------------------------------------------
  // SHARED EVENT RESULTS
  // ------------------------------------------

  function renderSharedEvents(
    nameA,
    nameB,
    listA,
    listB
  ) {
    const mapA = new Map(
      listA.map(entry => [
        String(entry.event.id),
        entry
      ])
    );

    const shared = listB
      .filter(entry =>
        mapA.has(String(entry.event.id))
      )
      .map(entry => [
        mapA.get(String(entry.event.id)),
        entry
      ])
      .sort(
        (a, b) =>
          Number(b[0].event.id) -
          Number(a[0].event.id)
      );

    let higherA = 0;
    let higherB = 0;
    let tied = 0;

    shared.forEach(([a, b]) => {
      if (a.rank < b.rank) {
        higherA++;
      } else if (b.rank < a.rank) {
        higherB++;
      } else {
        tied++;
      }
    });

    const record = $("compare-record");
    record.replaceChildren();

    [
      [higherA, `${nameA} placed higher`, "left"],
      [tied, "Same placement", ""],
      [higherB, `${nameB} placed higher`, "right"]
    ].forEach(([value, label, className]) => {
      const item = create(
        "div",
        className
      );

      item.append(
        create(
          "strong",
          "",
          String(value)
        ),
        create(
          "span",
          "",
          label
        )
      );

      record.append(item);
    });

    const container = $("compare-shared");
    container.replaceChildren();

    if (shared.length) {
      const bar = create(
        "div",
        "compare-bar"
      );

      [higherA, tied, higherB].forEach(
        (value, index) => {
          const segment = create(
            "div",
            `compare-bar-part-${index}`
          );

          segment.style.width =
            `${value / shared.length * 100}%`;

          bar.append(segment);
        }
      );

      container.append(bar);
    }

    container.append(
      create(
        "p",
        "compare-muted",
        `${shared.length} shared event${
          shared.length === 1 ? "" : "s"
        }`
      )
    );

    const heading = create(
      "div",
      "compare-detail-heading"
    );

    heading.append(
      create("span", "", nameA),
      create("span", "", "EVENT"),
      create("span", "", nameB)
    );

    container.append(heading);

    shared.forEach(([a, b]) => {
      const row = create(
        "div",
        "compare-detail-row"
      );

      const leftLeads = a.rank < b.rank;
      const rightLeads = b.rank < a.rank;

      const left = create(
        "div",
        `compare-detail-player compare-detail-left ${
          leftLeads
            ? "compare-detail-leader"
            : ""
        }`
      );

      left.append(
        create(
          "strong",
          "",
          `#${a.rank ?? "—"}`
        ),
        create(
          "small",
          "",
          `${formatNumber(a.coins)} coins`
        )
      );

      if (leftLeads) {
        left.append(
          create(
            "span",
            "compare-detail-indicator",
            "▲ Higher placed"
          )
        );
      }

      const middle = create(
        "div",
        "compare-detail-middle"
      );

      const link = create(
        "a",
        "",
        a.event.name ||
          `MCCC ${a.event.id}`
      );

      link.href =
        `event.html?id=${
          encodeURIComponent(a.event.id)
        }`;

      middle.append(link);

      const right = create(
        "div",
        `compare-detail-player compare-detail-right ${
          rightLeads
            ? "compare-detail-leader"
            : ""
        }`
      );

      right.append(
        create(
          "strong",
          "",
          `#${b.rank ?? "—"}`
        ),
        create(
          "small",
          "",
          `${formatNumber(b.coins)} coins`
        )
      );

      if (rightLeads) {
        right.append(
          create(
            "span",
            "compare-detail-indicator",
            "▲ Higher placed"
          )
        );
      }

      row.append(
        left,
        middle,
        right
      );

      container.append(row);
    });
  }

  // ------------------------------------------
  // GAME STATISTICS
  // ------------------------------------------

  function getGamePercentile(
    event,
    name,
    id
  ) {
    const placement = getRank(
      event,
      name,
      id
    );

    const totalPlayers = getMembers(event)
      .filter(
        player =>
          getRawGameScore(
            event,
            player,
            id
          ) !== null
      ).length;

    if (
      placement === null ||
      totalPlayers === 0
    ) {
      return null;
    }

    if (totalPlayers === 1) {
      return 100;
    }

    return (
      (totalPlayers - placement) /
      (totalPlayers - 1)
    ) * 100;
  }

  function getGameStatistics(
    appearances,
    name
  ) {
    return games.map(game => {
      const scores = [];
      const percentiles = [];

      appearances.forEach(({ event }) => {
        const score = getGameScore(
          event,
          name,
          game.id
        );

        if (score === null) {
          return;
        }

        scores.push(score);

        const percentile =
          getGamePercentile(
            event,
            name,
            game.id
          );

        if (percentile !== null) {
          percentiles.push(percentile);
        }
      });

      return {
        game,
        averageCoins: average(scores),
        percentile: average(percentiles),
        played: scores.length
      };
    });
  }

  
  // Keep track of which game is expanded.
  let expandedCompareGame = null;

  function renderGameTable(nameA, nameB, a, b, appearancesA, appearancesB) {
    $("compare-game-head-a").textContent = nameA;
    $("compare-game-head-b").textContent = nameB;

    const body = $("compare-games");
    body.replaceChildren();

    // Only compare events included in BOTH players' current filters.
    const eventsB = new Map(
      appearancesB.map(entry => [String(entry.event.id), entry])
    );

    const sharedEvents = appearancesA
      .filter(entry => eventsB.has(String(entry.event.id)))
      .map(entry => entry.event)
      .sort((x, y) => Number(y.id) - Number(x.id));

    function makePlayerCell(data, leads, side) {
      const cell = create(
        "td",
        `compare-game-player ${side}${leads ? " compare-game-leader" : ""}`
      );

      const percentile = data.percentile == null
        ? "—"
        : `${data.percentile.toFixed(1)}%`;

      cell.append(
        create("strong", "", percentile),
        create("small", "", `${formatNumber(data.averageCoins)} avg. coins`),
        create("small", "", `${data.played} game${data.played === 1 ? "" : "s"} played`)
      );

      if (leads) {
        cell.append(
          create("span", "compare-game-indicator", "▲ Higher percentile")
        );
      }

      return cell;
    }

    function makeExpandedRow(gameId) {
      const row = create("tr", "compare-h2h-row");
      const cell = create("td", "compare-h2h-cell");
      cell.colSpan = 3;

      const results = sharedEvents
        .map(event => {
          const coinsA = getRawGameScore(event, nameA, gameId);
          const coinsB = getRawGameScore(event, nameB, gameId);

          // Both players must have played this particular game.
          if (coinsA === null || coinsB === null) return null;

          const rankA = getRank(event, nameA, gameId);
          const rankB = getRank(event, nameB, gameId);

          if (rankA === null || rankB === null) return null;

          return { event, coinsA, coinsB, rankA, rankB };
        })
        .filter(Boolean);

      const winsA = results.filter(r => r.rankA < r.rankB).length;
      const winsB = results.filter(r => r.rankB < r.rankA).length;
      const ties = results.filter(r => r.rankA === r.rankB).length;

      const panel = create("div", "compare-h2h-panel");
      panel.append(
        create("h3", "compare-h2h-heading", "Head-to-Head Record")
      );

      if (!results.length) {
        panel.append(
          create(
            "p",
            "compare-h2h-empty",
            "These players have no shared appearances in this game under the selected filters."
          )
        );
        cell.append(panel);
        row.append(cell);
        return row;
      }

      const summary = create("div", "compare-h2h-summary");

      [
        [winsA, `${nameA} wins`, "left"],
        [ties, "Ties", "tie"],
        [winsB, `${nameB} wins`, "right"]
      ].forEach(([value, label, side]) => {
        const item = create("div", `compare-h2h-summary-item ${side}`);
        item.append(
          create("strong", "", String(value)),
          create("span", "", label)
        );
        summary.append(item);
      });

      panel.append(summary);

      const bar = create("div", "compare-h2h-bar");
      [
        [winsA, "left"],
        [ties, "tie"],
        [winsB, "right"]
      ].forEach(([count, side]) => {
        const segment = create("div", `compare-h2h-bar-${side}`);
        segment.style.width = `${count / results.length * 100}%`;
        bar.append(segment);
      });

      panel.append(bar);

      panel.append(
        create(
          "p",
          "compare-h2h-caption",
          `${results.length} shared game${results.length === 1 ? "" : "s"} · Winners determined by individual game placement`
        )
      );

      const tableScroll = create("div", "compare-h2h-table-scroll");
      const table = create("table", "compare-h2h-table");
      const thead = create("thead");
      const headRow = create("tr");

      ["Event", nameA, nameB].forEach(label => {
        headRow.append(create("th", "", label));
      });

      thead.append(headRow);
      table.append(thead);

      const tbody = create("tbody");

      results.forEach(result => {
        const eventRow = create("tr");

        const eventCell = create("td");
        const eventLink = create(
          "a",
          "",
          result.event.name || `MCCC ${result.event.id}`
        );
        eventLink.href = `event.html?id=${encodeURIComponent(result.event.id)}`;
        eventCell.append(eventLink);
        eventRow.append(eventCell);

        [
          [result.rankA, result.coinsA, result.rankA < result.rankB, "left"],
          [result.rankB, result.coinsB, result.rankB < result.rankA, "right"]
        ].forEach(([rank, coins, winner, side]) => {
          const playerCell = create(
  "td",
  `compare-h2h-player ${side}${winner ? " is-winner" : ""}`
);

const resultBox = create(
  "div",
  `compare-h2h-result${winner ? " is-winner" : ""}`
);

resultBox.append(
  create("strong", "", `#${rank}`),
  create("small", "", `${formatNumber(coins)} coins`)
);

if (winner) {
  resultBox.append(
    create("span", "compare-h2h-winner-label", "WINNER")
  );
}

playerCell.append(resultBox);

          eventRow.append(playerCell);
        });

        tbody.append(eventRow);
      });

      table.append(tbody);
      tableScroll.append(table);
      panel.append(tableScroll);

      cell.append(panel);
      row.append(cell);
      return row;
    }

    a.forEach((gameA, index) => {
      const gameB = b[index];
      const gameId = gameA.game.id;
      const isExpanded = expandedCompareGame === gameId;

      const leftLeads =
        gameA.percentile !== null &&
        gameB.percentile !== null &&
        gameA.percentile > gameB.percentile;

      const rightLeads =
        gameA.percentile !== null &&
        gameB.percentile !== null &&
        gameB.percentile > gameA.percentile;

      const row = create(
        "tr",
        `compare-game-expandable${isExpanded ? " is-expanded" : ""}`
      );

      const gameCell = create("td", "compare-game-title");

      if (gameA.game.icon) {
        const icon = create("img");
        icon.src = gameA.game.icon;
        icon.alt = "";
        gameCell.append(icon);
      }

      gameCell.append(
        document.createTextNode(gameA.game.name)
      );

      const chevron = create(
  "span",
  "compare-game-chevron",
  "›"
);
      gameCell.append(chevron);

      row.append(
        gameCell,
        makePlayerCell(gameA, leftLeads, "left"),
        makePlayerCell(gameB, rightLeads, "right")
      );

      row.tabIndex = 0;
      row.setAttribute("role", "button");
      row.setAttribute("aria-expanded", String(isExpanded));
      row.setAttribute(
        "aria-label",
        `${isExpanded ? "Collapse" : "Expand"} ${gameA.game.name} head-to-head results`
      );

      function toggleGame() {
        expandedCompareGame = isExpanded ? null : gameId;

        renderGameTable(
          nameA, nameB, a, b, appearancesA, appearancesB
        );

        // Restore keyboard focus after the table is rebuilt.
        const updatedRow = [...body.querySelectorAll(".compare-game-expandable")]
          .find(element =>
            element.getAttribute("aria-label")?.includes(gameA.game.name)
          );

        if (updatedRow && row.matches(":focus")) {
          updatedRow.focus();
        }
      }

      row.addEventListener("click", toggleGame);
      row.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleGame();
        }
      });

      body.append(row);

      if (isExpanded) {
        body.append(makeExpandedRow(gameId));
      }
    });
  }


  // ------------------------------------------
  // RADAR CHART
  // ------------------------------------------

  const gameIcons = new Map();

  let lastRadarA = null;
  let lastRadarB = null;

  games.forEach(game => {
    if (!game.icon) {
      return;
    }

    const image = new Image();

    image.onload = () => {
      if (!$("compare-results").hidden) {
        drawRadar(
          lastRadarA,
          lastRadarB
        );
      }
    };

    image.src = game.icon;

    gameIcons.set(
      game.id,
      image
    );
  });

  let radarFrame = 0;
  function drawRadar(a, b, progress = 1) {
    lastRadarA = a;
    lastRadarB = b;

    if (!a || !b) {
      return;
    }

    const canvas = $("compare-radar");
    const parent = canvas.parentElement;

    const width = Math.max(
      270,
      parent.clientWidth
    );

    const height =
      window.innerWidth < 650
        ? 310
        : 390;

    const dpr =
      window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.height =
      `${height}px`;

    const ctx = canvas.getContext("2d");

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    const centerX = width / 2;
    const centerY = height / 2;

    const radius = Math.min(
      width * .31,
      height * .31,
      145
    );

    const count = games.length;

    if (count < 3) {
      return;
    }

    function point(index, fraction) {
      const angle =
        index * Math.PI * 2 / count -
        Math.PI / 2;

      return {
        x:
          centerX +
          Math.cos(angle) *
          radius *
          fraction,
        y:
          centerY +
          Math.sin(angle) *
          radius *
          fraction
      };
    }

    for (
      let ring = 1;
      ring <= 5;
      ring++
    ) {
      ctx.beginPath();

      games.forEach((game, index) => {
        const p = point(
          index,
          ring / 5
        );

        if (index === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      });

      ctx.closePath();

      ctx.strokeStyle =
        "rgba(255,255,255,.10)";

      ctx.lineWidth = 1;
      ctx.stroke();
    }

    games.forEach((game, index) => {
      const end = point(index, 1);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(end.x, end.y);

      ctx.strokeStyle =
        "rgba(255,255,255,.08)";

      ctx.stroke();

      const labelPoint = point(
        index,
        1.28
      );

      const icon = gameIcons.get(
        game.id
      );

      if (
        icon?.complete &&
        icon.naturalWidth > 0
      ) {
        ctx.drawImage(
          icon,
          labelPoint.x - 16,
          labelPoint.y - 16,
          32,
          32
        );
      } else {
        ctx.font =
          "12px Lexend, sans-serif";

        ctx.fillStyle = "#d1d5db";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
          game.shortName || game.name,
          labelPoint.x,
          labelPoint.y
        );
      }
    });

    function drawPolygon(
      data,
      fill,
      stroke
    ) {
      ctx.beginPath();

      data.forEach((game, index) => {
        const fraction = Math.max(
          0,
          Math.min(
            1,
            ((game.percentile ?? 0) / 100) * progress
          )
        );

        const p = point(
          index,
          fraction
        );

        if (index === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      });

      ctx.closePath();

      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.5;

      ctx.fill();
      ctx.stroke();

      data.forEach((game, index) => {
        const fraction = Math.max(
          0,
          Math.min(
            1,
            ((game.percentile ?? 0) / 100) * progress
          )
        );

        const p = point(
          index,
          fraction
        );

        ctx.beginPath();

        ctx.arc(
          p.x,
          p.y,
          3.5,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = stroke;
        ctx.fill();
      });
    }

    drawPolygon(
      a,
      "rgba(232,184,107,.18)",
      "#e8b86b"
    );

    drawPolygon(
      b,
      "rgba(145,185,160,.18)",
      "#91b9a0"
    );
  }

  // ==========================================
  // PLAYER DISPLAY
  // ==========================================

  function updatePlayerDisplay(id, name) {
    const image = $(
      `compare-avatar-${id}`
    );

    const link = $(
      `compare-profile-${id}`
    );

    const previousSkin = image.dataset.compareSkin || "";
    const nextSkin = name ? name.toLowerCase() : "";
    if (previousSkin !== nextSkin) {
      image.dataset.compareSkin = nextSkin;
      image.classList.remove("compare-skin-enter");
      if (nextSkin && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        void image.offsetWidth;
        image.classList.add("compare-skin-enter");
      }
    }

    if (!name) {
      image.src = PLACEHOLDER_SKIN;

      image.alt =
        id === "a"
          ? "Select player 1"
          : "Select player 2";

      image.classList.add(
        "compare-placeholder"
      );

      link.hidden = true;

      return;
    }

    const size =
      name.toLowerCase() ===
      "wailed_burrito61"
        ? 360
        : 180;

    image.src =
      `https://mc-heads.net/body/${
        encodeURIComponent(
          name.toLowerCase()
        )
      }/${size}`;

    image.alt =
      `${name}'s Minecraft skin`;

    image.classList.remove(
      "compare-placeholder"
    );

    link.href =
      `player.html?name=${
        encodeURIComponent(name)
      }`;

    link.hidden = false;
  }

  // ==========================================
  // MAIN UPDATE
  // ==========================================

  function updateComparison() {
    const nameA = lookup(
      $("compare-player-a").value
    );

    const nameB = lookup(
      $("compare-player-b").value
    );

    updatePlayerDisplay(
      "a",
      nameA
    );

    updatePlayerDisplay(
      "b",
      nameB
    );

    const ready =
      !!nameA &&
      !!nameB &&
      nameA.toLowerCase() !==
        nameB.toLowerCase();

    $("compare-results").hidden =
      !ready;

    if (!ready) {
      $("compare-status").textContent =
        !nameA || !nameB
          ? "Select two players to begin."
          : "Choose two different players.";

      return;
    }

    $("compare-status").textContent = "";
    document.querySelectorAll(".compare-panel").forEach((panel, index) => {
      panel.classList.remove("compare-panel-enter");
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        void panel.offsetWidth;
        panel.style.animationDelay = `${index * 65}ms`;
        panel.classList.add("compare-panel-enter");
      }
    });

    const filteredEvents =
      getFilteredEvents();

    const appearancesA =
      getAppearances(
        filteredEvents,
        nameA
      );

    const appearancesB =
      getAppearances(
        filteredEvents,
        nameB
      );

    renderEventStatistics(
      nameA,
      nameB,
      getEventStatistics(
        appearancesA
      ),
      getEventStatistics(
        appearancesB
      )
    );

    renderSharedEvents(
      nameA,
      nameB,
      appearancesA,
      appearancesB
    );

    const gameStatsA =
      getGameStatistics(
        appearancesA,
        nameA
      );

    const gameStatsB =
      getGameStatistics(
        appearancesB,
        nameB
      );

    renderGameTable(
  nameA,
  nameB,
  gameStatsA,
  gameStatsB,
  appearancesA,
  appearancesB
);

    $("compare-legend").replaceChildren(
      create("span", "", nameA),
      create("span", "", nameB)
    );

    cancelAnimationFrame(radarFrame);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      drawRadar(gameStatsA, gameStatsB);
    } else {
      const started = performance.now();
      const animateRadar = now => {
        const t = Math.min(1, (now - started) / 500);
        const eased = 1 - Math.pow(1 - t, 3);
        drawRadar(gameStatsA, gameStatsB, eased);
        if (t < 1) radarFrame = requestAnimationFrame(animateRadar);
      };
      radarFrame = requestAnimationFrame(animateRadar);
    }

    const url = new URL(
      location.href
    );

    url.searchParams.set(
      "a",
      nameA
    );

    url.searchParams.set(
      "b",
      nameB
    );

    history.replaceState(
      null,
      "",
      url
    );
  }

  // ==========================================
  // CUSTOM PLAYER SEARCH
  // ==========================================

  function setupPlayerSearch(id) {
    const input = $(
      `compare-player-${id}`
    );

    const results = $(
      `compare-results-${id}`
    );

    let matches = [];
    let activeIndex = -1;

    function closeResults() {
      results.hidden = true;
      results.replaceChildren();

      matches = [];
      activeIndex = -1;

      input.removeAttribute(
        "aria-activedescendant"
      );
    }

    function setActive(index) {
      const options = [
        ...results.querySelectorAll(
          ".compare-player-option"
        )
      ];

      if (!options.length) {
        return;
      }

      activeIndex =
        (index + options.length) %
        options.length;

      options.forEach(
        (option, optionIndex) => {
          const active =
            optionIndex === activeIndex;

          option.classList.toggle(
            "is-active",
            active
          );

          option.setAttribute(
            "aria-selected",
            String(active)
          );
        }
      );

      const selected =
        options[activeIndex];

      input.setAttribute(
        "aria-activedescendant",
        selected.id
      );

      selected.scrollIntoView({
        block: "nearest"
      });
    }

    function selectPlayer(name) {
  const selectedName = lookup(name);

  if (!selectedName) return;

  input.value = selectedName;

  closeResults();

  // Update the selected player's skin and profile link
  updatePlayerDisplay(id, selectedName);

  // Recalculate the comparison
  updateComparison();
}
    function showResults() {
      const query = input.value
        .trim()
        .toLowerCase();

      results.replaceChildren();

      matches = query
        ? names.filter(name =>
            name.toLowerCase()
              .includes(query)
          ).slice(0, 8)
        : [];

      activeIndex = -1;

      if (!matches.length) {
        closeResults();
        return;
      }

      matches.forEach((name, index) => {
        const option = create(
          "button",
          "compare-player-option"
        );

        option.type = "button";
        option.id =
          `compare-option-${id}-${index}`;

        option.setAttribute(
          "role",
          "option"
        );

        option.setAttribute(
          "aria-selected",
          "false"
        );

        

const avatar = create("img");

const skinUsername = name.trim().toLowerCase();

const largeHeads = [
  "creep1et",
  "sacred_bean",
  "wailed_burrito61",
  "froopyloopidy",
  "awsomeants",
  "fennecfox1247",
  "voidvvy"
];

const size = largeHeads.includes(skinUsername) ? 64 : 32;

avatar.src =
  `https://mc-heads.net/avatar/${encodeURIComponent(skinUsername)}/${size}`;

avatar.alt = "";
avatar.loading = "lazy";

avatar.onerror = () => {
  if (!avatar.dataset.fallback) {
    avatar.dataset.fallback = "1";
    avatar.src =
      `https://minotar.net/avatar/${encodeURIComponent(skinUsername)}/64`;
  } else {
    avatar.style.visibility = "hidden";
  }
};



        const username = create(
          "span",
          "",
          name
        );

        option.append(
          avatar,
          username
        );

        option.addEventListener("pointerdown", event => {
  event.preventDefault();
  selectPlayer(name);
});

        option.addEventListener(
          "mouseenter",
          () => {
            setActive(index);
          }
        );

        results.append(option);
      });

      results.hidden = false;
    }

    input.addEventListener(
      "input",
      () => {
        showResults();
        updateComparison();
      }
    );

    input.addEventListener(
      "focus",
      () => {
        showResults();
      }
    );

    input.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "ArrowDown" ||
          event.key === "ArrowUp"
        ) {
          if (results.hidden) {
            showResults();
          }

          if (!matches.length) {
            return;
          }

          event.preventDefault();

          if (event.key === "ArrowDown") {
            setActive(activeIndex + 1);
          } else {
            setActive(
              activeIndex < 0
                ? matches.length - 1
                : activeIndex - 1
            );
          }

          return;
        }

        if (event.key === "Enter") {
          if (
            !results.hidden &&
            matches.length
          ) {
            event.preventDefault();

            selectPlayer(
              matches[
                activeIndex >= 0
                  ? activeIndex
                  : 0
              ]
            );
          }

          return;
        }

        if (event.key === "Escape") {
          closeResults();
        }
      }
    );

    input.addEventListener(
      "blur",
      () => {
        setTimeout(
          closeResults,
          150
        );
      }
    );

    return closeResults;
  }

  const closeSearchA =
    setupPlayerSearch("a");

  const closeSearchB =
    setupPlayerSearch("b");

  // ------------------------------------------
  // EVENT LISTENERS
  // ------------------------------------------

  [
    "compare-season",
    "compare-mode",
    "compare-noncanon",
    "compare-incomplete"
  ].forEach(id => {
    $(id).addEventListener(
      "change",
      updateComparison
    );
  });

  $("compare-swap").addEventListener(
    "click",
    () => {
      const playerA = $(
        "compare-player-a"
      );

      const playerB = $(
        "compare-player-b"
      );

      const previousA =
        playerA.value;

      playerA.value =
        playerB.value;

      playerB.value =
        previousA;

      closeSearchA();
      closeSearchB();

      updateComparison();
    }
  );

  document.addEventListener(
    "click",
    event => {
      if (
        !event.target.closest(
          ".compare-player-search"
        )
      ) {
        closeSearchA();
        closeSearchB();
      }
    }
  );

  window.addEventListener(
    "resize",
    () => {
      drawRadar(
        lastRadarA,
        lastRadarB
      );
    }
  );

  updateComparison();
});
