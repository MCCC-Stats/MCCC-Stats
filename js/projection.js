
/* ==========================================
   MCCC STATS - NEXT EVENT PROJECTION
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    setupProjection();
});

function setupProjection() {
    const gameSelect = document.getElementById("projection-game");
    const eventsCountSelect = document.getElementById("projection-events-count");
    const individualBody = document.getElementById("projection-individual-body");
    const teamResults = document.getElementById("projection-team-results");
    const chart = document.getElementById("projection-chart");
    const orderModeSelect = document.getElementById("projection-order-mode");
const orderControls = document.getElementById("projection-order-controls");
const orderList = document.getElementById("projection-order-list");
const randomizeButton = document.getElementById("projection-randomize");

let selectedOrder = [...(window.MCCC_PROJECTION?.games || [])];

const gameNames = new Map(
    (window.MCCC_GAMES || []).map(game => [game.id, game.name])
);

    const projection = window.MCCC_PROJECTION;
    const historicalEvents = window.MCCC_EVENTS || [];

    if (
        !gameSelect ||
        !eventsCountSelect ||
        !individualBody ||
        !teamResults ||
        !chart ||
        !projection ||
        !window.MCCC_DATA
    ) {
        return;
    }

    const formatCoins = value =>
        Number(value).toLocaleString("en-IE", {
            maximumFractionDigits: 2
        });

    const normalizeName = name => String(name).trim().toLowerCase();

    const getPlayerHead = name => {
        const username = normalizeName(name);

        const size = [
            "creep1et",
            "wailed_burrito61",
            "froopyloopidy",
            "fennecfox1247"
        ].includes(username) ? 64 : 32;

        return `https://mc-heads.net/avatar/${encodeURIComponent(username)}/${size}`;
    };

    // Only completed, canon events count towards projections.
    const completedEvents = historicalEvents
        .filter(event => !event.noncanon)
        .sort((a, b) => b.id - a.id);

    // Find a player's score even if their username has
    // different capitalisation in older events.
    function findPlayerName(event, playerName) {
        return Object.keys(event.scores || {}).find(
            name => normalizeName(name) === normalizeName(playerName)
        ) || null;
    }

    function average(values) {
        if (!values.length) return null;

        return values.reduce((sum, value) => sum + value, 0) /
            values.length;
    }

    function getHistoryLimit() {
        const value = eventsCountSelect.value;

        if (value === "all") return Infinity;

        const count = Number(value);
        return Number.isFinite(count) && count > 0
            ? count
            : 3;
    }

    // Get a returning player's most recent appearances,
    // skipping events in which they did not participate.
    function getPlayerHistory(playerName) {
    const selection = eventsCountSelect.value;

    let eligibleEvents = completedEvents;
    let limit = getHistoryLimit();

    if (selection === "season1") {
        eligibleEvents = completedEvents.filter(
            event => event.season === 1
        );
        limit = Infinity;
    }

    if (selection === "season2") {
        eligibleEvents = completedEvents.filter(
            event => event.season === 2
        );
        limit = Infinity;
    }

    const appearances = [];

    
for (const event of eligibleEvents) {
    const actualName = findPlayerName(event, playerName);

    if (!actualName) continue;

    // Skip events where the player did not complete all games.
    const participation = Object.entries(
        event.participation || {}
    ).find(
        ([name]) => normalizeName(name) === normalizeName(playerName)
    )?.[1];

    if (
        Array.isArray(participation) &&
        (
            participation.length !== event.games.length ||
            !participation.every(played => played === true)
        )
    ) {
        continue;
    }

    appearances.push({
        event,
        name: actualName
    });

    if (appearances.length >= limit) break;
}


    return appearances;
}

    function getHistoricalGameAverage(playerName, gameId) {
        const appearances = getPlayerHistory(playerName);
        const scores = [];

        for (const appearance of appearances) {
            const score = window.MCCC_DATA.getPlayerGameScore(
                appearance.event,
                appearance.name,
                gameId
            );

            if (typeof score === "number" && Number.isFinite(score)) {
    scores.push(
        normalizeGameScore(
            score,
            appearance.event,
            gameId
        )
    );
}
        }

        return average(scores);
    }

    function getHistoricalEventAverage(playerName) {
        const appearances = getPlayerHistory(playerName);
        const scores = [];

        for (const appearance of appearances) {
            
const event = appearance.event;

const gameScores = event.games.map(gameId => {
    const rawScore = window.MCCC_DATA.getPlayerGameScore(
        event,
        appearance.name,
        gameId
    );

    if (
        typeof rawScore !== "number" ||
        !Number.isFinite(rawScore)
    ) {
        return null;
    }

    return normalizeGameScore(rawScore, event, gameId);
});

const score = gameScores.every(value => value !== null)
    ? gameScores.reduce((sum, value) => sum + value, 0)
    : null;


            if (typeof score === "number" && Number.isFinite(score)) {
                scores.push(score);
            }
        }

        return average(scores);
    }

    
    /* ==========================================
       FIVE-TEAM SCORE NORMALISATION
       ========================================== */

    function getNormalizationFactors() {
        const totals = new Map();

        // Collect average individual scores for each
        // game and event size.
        completedEvents.forEach(event => {
            const teamCount = event.teams?.length;

            if (!teamCount) return;

            event.games.forEach((gameId, index) => {
                const key = `${teamCount}:${gameId}`;

                if (!totals.has(key)) {
                    totals.set(key, { sum: 0, count: 0 });
                }

                const entry = totals.get(key);

                Object.entries(event.scores || {}).forEach(
                    ([playerName, scores]) => {
                        const participation = Object.entries(
                            event.participation || {}
                        ).find(
                            ([name]) =>
                                normalizeName(name) ===
                                normalizeName(playerName)
                        )?.[1];

                        // Exclude incomplete appearances.
                        if (
                            Array.isArray(participation) &&
                            (
                                participation.length !== event.games.length ||
                                !participation.every(played => played === true)
                            )
                        ) {
                            return;
                        }

                        const score = scores?.[index];

                        if (
                            typeof score !== "number" ||
                            !Number.isFinite(score)
                        ) {
                            return;
                        }

                        entry.sum += score;
                        entry.count++;
                    }
                );
            });
        });

        const factors = new Map();

        (window.MCCC_GAMES || []).forEach(game => {
            const baseline = totals.get(`5:${game.id}`);

            if (!baseline?.count || baseline.sum <= 0) {
                return;
            }

            const baselineAverage =
                baseline.sum / baseline.count;

            [4, 5, 6].forEach(teamCount => {
                const entry = totals.get(
                    `${teamCount}:${game.id}`
                );

                if (!entry?.count || entry.sum <= 0) {
                    return;
                }

                const eventAverage =
                    entry.sum / entry.count;

                const factor = game.id === "hole_in_the_wall"
    ? 1
    : baselineAverage / eventAverage;

factors.set(
    `${teamCount}:${game.id}`,
    factor
);
            });
        });

        return factors;
    }

    const normalizationFactors = getNormalizationFactors();

    function normalizeGameScore(score, event, gameId) {
        const teamCount = event.teams?.length;

        if (teamCount === 5) return score;

        const factor = normalizationFactors.get(
            `${teamCount}:${gameId}`
        ) ?? 1;

        return score * factor;
    }



    // Calculate historical coin distribution for newcomers.
    // Each game's share is based on its proportion of
    // all recorded individual game scores.
    function getGameWeights() {
        const totals = {};
        const counts = {};

        (window.MCCC_GAMES || []).forEach(game => {
            totals[game.id] = 0;
            counts[game.id] = 0;
        });

        completedEvents.forEach(event => {
            Object.entries(event.scores || {}).forEach(
                ([playerName, scores]) => {
                    if (!Array.isArray(scores)) return;

                    event.games.forEach((gameId, index) => {
                        const score = scores[index];

                        if (
                            typeof score !== "number" ||
                            !Number.isFinite(score)
                        ) {
                            return;
                        }

                        totals[gameId] =
                            (totals[gameId] || 0) + score;

                        counts[gameId] =
                            (counts[gameId] || 0) + 1;
                    });
                }
            );
        });

        const weights = {};

        const games = projection.games || [];

        games.forEach(gameId => {
            weights[gameId] = counts[gameId]
                ? totals[gameId] / counts[gameId]
                : 0;
        });

        const weightTotal = games.reduce(
            (sum, gameId) => sum + weights[gameId],
            0
        );

        if (weightTotal <= 0) {
            const equalWeight = games.length
                ? 1 / games.length
                : 0;

            games.forEach(gameId => {
                weights[gameId] = equalWeight;
            });

            return weights;
        }

        games.forEach(gameId => {
            weights[gameId] /= weightTotal;
        });

        return weights;
    }

    const gameWeights = getGameWeights();

    function getNewcomerTotal(playerName) {
        const newcomers = projection.newcomers || {};

        const key = Object.keys(newcomers).find(
            name => normalizeName(name) === normalizeName(playerName)
        );

        if (!key) return null;

        const score = Number(newcomers[key]);

        return Number.isFinite(score) && score >= 0
            ? score
            : null;
    }

    function getPredictedGameScore(playerName, gameId) {
        const newcomerTotal = getNewcomerTotal(playerName);

        if (newcomerTotal !== null) {
            return newcomerTotal * (gameWeights[gameId] || 0);
        }

        return getHistoricalGameAverage(playerName, gameId);
    }

    function getPredictedEventScore(playerName) {
        const newcomerTotal = getNewcomerTotal(playerName);

        if (newcomerTotal !== null) {
            return newcomerTotal;
        }

        return getHistoricalEventAverage(playerName);
    }

    function getProjectedPlayerScore(playerName, gameId) {
        if (gameId === "event") {
            return getPredictedEventScore(playerName);
        }

        return getPredictedGameScore(playerName, gameId);
    }

    function getProjectedTeamScore(team, selectedGame) {
        if (selectedGame !== "event") {
            const scores = team.players.map(
                name => getPredictedGameScore(name, selectedGame)
            );

            if (scores.some(score => score === null)) {
                return null;
            }

            return scores.reduce((sum, score) => sum + score, 0);
        }

        // Predict team totals using the upcoming event's
        // game order and multipliers.
        let total = 0;

        for (const playerName of team.players) {
            const mode = orderModeSelect.value;
const games = mode === "average"
    ? projection.games
    : selectedOrder;

for (let index = 0; index < games.length; index++) {
    const gameId = games[index];
                const score = getPredictedGameScore(
                    playerName,
                    gameId
                );

                if (score === null) {
                    return null;
                }

                const multipliers = projection.multipliers || [1, 1.5, 2, 2, 2.5, 3];

const averageMultiplier =
    multipliers.reduce((sum, value) => sum + value, 0) /
    multipliers.length;

const multiplier = mode === "average"
    ? averageMultiplier
    : multipliers[index] ?? 1;

                total += score * multiplier;
            }
        }

        return total;
    }

    function buildLeaderboard() {
        const selectedGame = gameSelect.value;

        const playerResults = projection.teams.flatMap(team =>
            team.players.map(playerName => ({
                name: playerName,
                team,
                score: getProjectedPlayerScore(
                    playerName,
                    selectedGame
                )
            }))
        );

        playerResults.sort((a, b) => {
            if (a.score === null && b.score === null) {
                return a.name.localeCompare(b.name);
            }

            if (a.score === null) return 1;
            if (b.score === null) return -1;

            return b.score - a.score;
        });

        renderIndividualLeaderboard(playerResults);

        const teamData = projection.teams.map(team => ({
            ...team,
            score: getProjectedTeamScore(team, selectedGame)
        }));

        teamData.sort((a, b) => {
            if (a.score === null && b.score === null) {
                return a.name.localeCompare(b.name);
            }

            if (a.score === null) return 1;
            if (b.score === null) return -1;

            return b.score - a.score;
        });

        renderTeamLeaderboard(teamData);
        renderChart(teamData);

        let note = document.getElementById(
            "projection-data-note"
        );

        if (!note) {
            note = document.createElement("p");
            note.id = "projection-data-note";
            note.style.color = "var(--text-secondary)";
            note.style.fontSize = "12px";

            const main = document.querySelector(
    "#event-projection .projection-main"
);

if (main) {
    main.appendChild(note);
}
        }

        if (note) {
            const selection = eventsCountSelect.value;

const historyLabel =
    selection === "all" ? "full recorded history" :
    selection === "season1" ? "Season 1 performances" :
    selection === "season2" ? "Season 2 performances" :
    "last " + selection + " appearances";

note.textContent =
    "Next Event projection based on each player's " +
    historyLabel +
    ". Newcomers use estimated scores. " +
    "N/A means insufficient historical data.";
        }
    }

    
function renderIndividualLeaderboard(players) {
    // Remember each player's previous position.
    const oldPositions = new Map();

    Array.from(individualBody.rows).forEach(row => {
        const playerName = row.dataset.player;

        if (!playerName) return;

        oldPositions.set(
            playerName,
            row.getBoundingClientRect().top
        );
    });

    individualBody.replaceChildren();


        players.forEach((player, index) => {
    const row = document.createElement("tr");
    row.dataset.player = normalizeName(player.name);

            const rankCell = document.createElement("td");
            rankCell.textContent = index + 1;

            const nameCell = document.createElement("td");

            const playerLink = document.createElement("a");
            playerLink.href =
                "player.html?name=" +
                encodeURIComponent(player.name);

            const avatar = document.createElement("img");
            avatar.src = getPlayerHead(player.name);
            avatar.alt = "";
            avatar.loading = "lazy";

            const name = document.createElement("span");
            name.textContent = player.name;

            playerLink.append(avatar, name);
            nameCell.appendChild(playerLink);

            const scoreCell = document.createElement("td");
            scoreCell.textContent = player.score === null
    ? "N/A"
    : formatCoins(player.score);

if (player.score !== null) {
    const coin = document.createElement("img");
    coin.src = "assets/coin.webp";
    coin.className = "projection-coin-icon";
    coin.alt = "";
    scoreCell.appendChild(coin);
}

            scoreCell.style.textAlign = "right";

            row.append(
                rankCell,
                nameCell,
                scoreCell
            );

            
            individualBody.appendChild(row);
        });

        // Slide players into their new leaderboard positions.
        Array.from(individualBody.rows).forEach(row => {
            const oldTop = oldPositions.get(row.dataset.player);

            if (oldTop === undefined) return;

            const newTop = row.getBoundingClientRect().top;
            const delta = oldTop - newTop;

            if (Math.abs(delta) < 1) return;

            Array.from(row.cells).forEach(cell => {
                cell.animate(
                    [
                        { transform: `translateY(${delta}px)` },
                        { transform: "translateY(0)" }
                    ],
                    {
                        duration: 500,
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)"
                    }
                );
            });
        });
    }

    function renderTeamLeaderboard(teams) {
    const oldPositions = new Map();

    Array.from(teamResults.children).forEach(row => {
        const teamId = row.dataset.team;
        if (!teamId) return;

        oldPositions.set(
            teamId,
            row.getBoundingClientRect().top
        );
    });

    teamResults.replaceChildren();

        teams.forEach((team, index) => {
            const row = document.createElement("div");
            row.className = "projection-team-row";
            row.dataset.team = team.id;

            row.style.borderLeft =
                "4px solid " + team.color;

            const rank = document.createElement("span");
            rank.className = "projection-team-rank";
            rank.textContent = index + 1;

            const name = document.createElement("span");
            name.className = "projection-team-name";
            name.textContent = team.name;

            const score = document.createElement("span");
            score.className = "projection-team-score";

            score.textContent = team.score === null
                ? "N/A"
                : formatCoins(team.score);

            
            row.append(rank, name, score);
            teamResults.appendChild(row);
        });

        // Animate teams moving between positions.
        Array.from(teamResults.children).forEach(row => {
            const oldTop = oldPositions.get(row.dataset.team);

            if (oldTop === undefined) return;

            const newTop = row.getBoundingClientRect().top;
            const delta = oldTop - newTop;

            if (Math.abs(delta) < 1) return;

            row.animate(
                [
                    { transform: `translateY(${delta}px)` },
                    { transform: "translateY(0)" }
                ],
                {
                    duration: 500,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)"
                }
            );
        });
    }

    


function renderChart(teams) {
    const duration = 500;
    const easing = "cubic-bezier(0.22, 1, 0.36, 1)";

    const validScores = teams
        .map(team => team.score)
        .filter(score => Number.isFinite(score));

    const maximum = Math.max(...validScores, 1);

    const averageScore = validScores.length
        ? validScores.reduce((sum, score) => sum + score, 0)
            / validScores.length
        : 0;

    const chartMax = maximum * 1.18;

    // Create the chart structure only once.
    let plot = chart.querySelector(".projection-bar-plot");
    let averageLine = chart.querySelector(".projection-average-line");

    if (!plot) {
        chart.replaceChildren();

        averageLine = document.createElement("div");
        averageLine.className = "projection-average-line";

        const label = document.createElement("span");
        averageLine.appendChild(label);

        plot = document.createElement("div");
        plot.className = "projection-bar-plot";

        chart.append(averageLine, plot);
    }

    // Remember current visual positions, including ongoing animations.
    const oldPositions = new Map();

    plot.querySelectorAll("[data-chart-team]").forEach(row => {
        oldPositions.set(
            row.dataset.chartTeam,
            row.getBoundingClientRect().top
        );
    });

    // Update the average line.
    averageLine.querySelector("span").textContent =
        formatCoins(averageScore);

    averageLine.style.transition =
        `left ${duration}ms ${easing}`;

    averageLine.style.left =
        `${(averageScore / chartMax) * 100}%`;

    const halloweenColour = {
        violet: "purple",
        mustard: "yellow"
    };

    const teamIcons = {
        red: "assets/teams/red.webp",
        lime: "assets/teams/lime.webp",
        violet: "assets/teams/purple.webp",
        aqua: "assets/teams/aqua.webp",
        mustard: "assets/teams/yellow.webp"
    };

    teams.forEach(team => {
        let row = Array.from(plot.children).find(
            element => element.dataset.chartTeam === String(team.id)
        );

        const colour = team.name
            .trim()
            .split(/\s+/)[0]
            .toLowerCase();

        if (!row) {
            row = document.createElement("div");
            row.className = "projection-bar-row";
            row.dataset.chartTeam = team.id;

            const identity = document.createElement("div");
            identity.className = "projection-bar-identity";

            const icon = document.createElement("img");
            const iconColour = halloweenColour[colour] || colour;

            icon.src =
                `assets/teams/halloween/${iconColour}.webp`;

            icon.alt = "";

            icon.onerror = () => {
                const fallback = teamIcons[colour];

                if (fallback && !icon.src.endsWith(fallback)) {
                    icon.src = fallback;
                } else {
                    icon.style.display = "none";
                }
            };

            const name = document.createElement("span");
            name.textContent = colour;

            identity.append(icon, name);

            const track = document.createElement("div");
            track.className = "projection-bar-track";

            const bar = document.createElement("div");
            bar.className = "projection-score-bar";
            bar.style.backgroundColor = team.color;

            const score = document.createElement("span");
            score.className = "projection-bar-score";

            track.append(bar, score);
            row.append(identity, track);

            plot.appendChild(row);
        }

        const bar = row.querySelector(".projection-score-bar");
        const score = row.querySelector(".projection-bar-score");

        const percentage = Number.isFinite(team.score)
            ? Math.max(0, team.score / chartMax * 100)
            : 0;

        // Animate bar and score label together.
        bar.style.transition =
            `width ${duration}ms ${easing}`;

        score.style.transition =
            `left ${duration}ms ${easing}`;

        bar.style.width = `${percentage}%`;
        score.style.left = `${percentage}%`;

        score.textContent = Number.isFinite(team.score)
    ? formatCoins(team.score)
    : "N/A";

if (Number.isFinite(team.score)) {
    const coin = document.createElement("img");
    coin.src = "assets/coin.webp";
    coin.className = "projection-coin-icon";
    coin.alt = "";
    score.appendChild(coin);
}
    });

    // Reorder existing DOM elements without recreating them.
    teams.forEach(team => {
        const row = Array.from(plot.children).find(
            element => element.dataset.chartTeam === String(team.id)
        );

        if (row) {
            plot.appendChild(row);
        }
    });

    // FLIP animation for team ranking changes.
    Array.from(plot.children).forEach(row => {
        const oldTop = oldPositions.get(row.dataset.chartTeam);

        if (oldTop === undefined) return;

        const newTop = row.getBoundingClientRect().top;
        const delta = oldTop - newTop;

        if (Math.abs(delta) < 1) return;

        // Stop an existing position animation before starting another.
        row.getAnimations().forEach(animation => {
            animation.cancel();
        });

        row.animate(
            [
                { transform: `translateY(${delta}px)` },
                { transform: "translateY(0)" }
            ],
            {
                duration,
                easing
            }
        );
    });
}


function renderOrderControls() {
    const mode = orderModeSelect.value;

    orderControls.hidden = mode === "average";
    randomizeButton.hidden = mode !== "random";

    orderList.replaceChildren();

    if (mode === "average") return;

    selectedOrder.forEach((gameId, index) => {
        const card = document.createElement("div");
        card.className = "projection-order-card";
        card.dataset.game = gameId;

        const position = document.createElement("span");
        position.className = "projection-order-position";
        position.textContent = `GAME ${index + 1}`;

        const multiplier = document.createElement("span");
        multiplier.className = "projection-order-multiplier";
        multiplier.textContent =
            `${projection.multipliers?.[index] ?? 1}×`;

        const icon = document.createElement("img");
        icon.className = "projection-order-icon";
        icon.src = `assets/games/${gameId}.webp`;
        icon.alt = "";
        icon.draggable = false;
        icon.onerror = () => {
            icon.style.visibility = "hidden";
        };

        const name = document.createElement("span");
        name.className = "projection-order-name";
        name.textContent = gameNames.get(gameId) || gameId;

        const grip = document.createElement("span");
        grip.className = "projection-order-grip";
        grip.textContent = "⠿";
        grip.setAttribute("aria-hidden", "true");

        card.append(position, multiplier, icon, name, grip);

        if (mode === "custom") {
            card.classList.add("is-draggable");

            card.addEventListener("pointerdown", event => {
                if (event.button !== 0) return;

                const startX = event.clientX;
                const startY = event.clientY;
                let dragging = false;
                let targetIndex = index;

                card.setPointerCapture(event.pointerId);

                function move(moveEvent) {
                    const dx = moveEvent.clientX - startX;
                    const dy = moveEvent.clientY - startY;

                    if (!dragging && Math.hypot(dx, dy) < 6) {
                        return;
                    }

                    dragging = true;
                    card.classList.add("is-dragging");

                    card.style.transform =
                        `translate(${dx}px, ${dy}px)`;

                    const cards = [...orderList.children];

                    const target = cards.findIndex(other => {
                        if (other === card) return false;

                        const rect = other.getBoundingClientRect();

                        return moveEvent.clientX >= rect.left &&
                               moveEvent.clientX <= rect.right &&
                               moveEvent.clientY >= rect.top &&
                               moveEvent.clientY <= rect.bottom;
                    });

                    cards.forEach(other => {
                        other.classList.remove("is-drop-target");
                    });

                    if (target !== -1) {
                        targetIndex = target;
                        cards[target].classList.add("is-drop-target");
                    }
                }

                function finish() {
                    card.removeEventListener("pointermove", move);
                    card.removeEventListener("pointerup", finish);
                    card.removeEventListener("pointercancel", cancel);

                    card.classList.remove("is-dragging");
                    card.style.transform = "";

                    if (dragging && targetIndex !== index) {
                        const [movedGame] = selectedOrder.splice(index, 1);
                        selectedOrder.splice(targetIndex, 0, movedGame);

                        renderOrderControls();
                        buildLeaderboard();
                    } else {
                        orderList.querySelectorAll(".is-drop-target")
                            .forEach(element =>
                                element.classList.remove("is-drop-target")
                            );
                    }
                }

                function cancel() {
                    card.removeEventListener("pointermove", move);
                    card.removeEventListener("pointerup", finish);
                    card.removeEventListener("pointercancel", cancel);

                    card.classList.remove("is-dragging");
                    card.style.transform = "";

                    orderList.querySelectorAll(".is-drop-target")
                        .forEach(element =>
                            element.classList.remove("is-drop-target")
                        );
                }

                card.addEventListener("pointermove", move);
                card.addEventListener("pointerup", finish);
                card.addEventListener("pointercancel", cancel);
            });
        }

        orderList.appendChild(card);
    });
}


orderModeSelect.addEventListener("change", () => {
    if (orderModeSelect.value === "random") {
        shuffleOrder();
    }

    renderOrderControls();
    buildLeaderboard();
});

function shuffleOrder() {
    selectedOrder = [...projection.games];

    for (let i = selectedOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [selectedOrder[i], selectedOrder[j]] =
            [selectedOrder[j], selectedOrder[i]];
    }
}

function animateOrderShuffle() {
    // Remember where each game card currently is.
    const oldPositions = new Map();

    Array.from(orderList.children).forEach(card => {
        oldPositions.set(
            card.dataset.game,
            card.getBoundingClientRect()
        );
    });

    // Shuffle and redraw the cards.
    shuffleOrder();
    renderOrderControls();

    // Animate cards from their old positions to their new ones.
    Array.from(orderList.children).forEach(card => {
        const old = oldPositions.get(card.dataset.game);
        if (!old) return;

        const current = card.getBoundingClientRect();

        const deltaX = old.left - current.left;
        const deltaY = old.top - current.top;

        if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
            return;
        }

        card.animate(
            [
                {
                    transform: `translate(${deltaX}px, ${deltaY}px)`
                },
                {
                    transform: "translate(0, 0)"
                }
            ],
            {
                duration: 500,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)"
            }
        );
    });
}

randomizeButton.addEventListener("click", () => {
    animateOrderShuffle();
    buildLeaderboard();
});

function updateProjectionGameIcon() {
    const gameIcon = document.querySelector(
        "#event-projection .selected-game-icon"
    );

    if (!gameIcon) return;

    gameIcon.src = gameSelect.value === "event"
        ? "assets/stats/all.webp"
        : `assets/games/${gameSelect.value}.webp`;
}

gameSelect.addEventListener("change", () => {
    updateProjectionGameIcon();
    buildLeaderboard();
});

updateProjectionGameIcon();
eventsCountSelect.addEventListener("change", buildLeaderboard);

renderOrderControls();
buildLeaderboard();

}
