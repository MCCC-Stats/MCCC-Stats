
/* ==========================================
   MCCC STATS - PLAYER PROFILES
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // ------------------------------------------
    // SETUP
    // ------------------------------------------

    const params = new URLSearchParams(window.location.search);
    const requestedPlayer = params.get("name");

    const events = window.MCCC_EVENTS || [];
    const games = window.MCCC_GAMES || [];

    
let scoreMode = "normalized";

// Calculate the same five-team baseline used by the predictor.
const normalizationFactors = new Map();
const normalizationTotals = new Map();

events
    .filter(event =>
        event.noncanon !== true &&
        event.canon !== false &&
        Array.isArray(event.teams) &&
        Array.isArray(event.games)
    )
    .forEach(event => {
        const teamCount = event.teams.length;

        event.games.forEach((game, index) => {
            const gameId = typeof game === "string" ? game : game.id;
            const key = `${teamCount}:${gameId}`;

            if (!normalizationTotals.has(key)) {
                normalizationTotals.set(key, { sum: 0, count: 0 });
            }

            const entry = normalizationTotals.get(key);

            Object.entries(event.scores || {}).forEach(([name, scores]) => {
                const participation = Object.entries(
                    event.participation || {}
                ).find(([otherName]) =>
                    otherName.toLowerCase() === name.toLowerCase()
                )?.[1];

                if (
                    Array.isArray(participation) &&
                    (
                        participation.length !== event.games.length ||
                        !participation.every(Boolean)
                    )
                ) {
                    return;
                }

                const score = scores?.[index];

                if (typeof score !== "number" || !Number.isFinite(score)) {
                    return;
                }

                entry.sum += score;
                entry.count++;
            });
        });
    });

games.forEach(game => {
    const baseline = normalizationTotals.get(`5:${game.id}`);

    if (!baseline?.count || baseline.sum <= 0) return;

    const baselineAverage = baseline.sum / baseline.count;

    [4, 5, 6].forEach(teamCount => {
        const entry = normalizationTotals.get(`${teamCount}:${game.id}`);

        if (!entry?.count || entry.sum <= 0) return;

        const factor = game.id === "hole_in_the_wall"
    ? 1
    : baselineAverage / (entry.sum / entry.count);

normalizationFactors.set(
    `${teamCount}:${game.id}`,
    factor
);
    });
});

function adjustScore(score, event, gameId) {
    if (scoreMode !== "normalized" || score === null) {
        return score;
    }

    const factor = normalizationFactors.get(
        `${event.teams?.length}:${gameId}`
    ) ?? 1;

    return score * factor;
}


    const seasonSelect = document.getElementById("player-season");
    const noncanonCheckbox = document.getElementById("player-noncanon");
    const fullEventsLabel = document.createElement("label");
fullEventsLabel.className = "player-full-events-filter";

const fullEventsCheckbox = document.createElement("input");
fullEventsCheckbox.type = "checkbox";
fullEventsCheckbox.id = "player-full-events";

fullEventsLabel.append(
    document.createTextNode("Include incomplete events"),
    fullEventsCheckbox
);

noncanonCheckbox.closest("label")?.after(fullEventsLabel);
    const gameFilter = document.getElementById("player-game-filter");

    
const radarHistorySelect =
    document.getElementById("player-radar-history");

function getRadarAppearances() {
    const selection = radarHistorySelect.value;

    const eligibleEvents = events
        .filter(event =>
            event.noncanon !== true &&
            event.canon !== false &&
            playedFullEvent(event, player) &&
            (event.teams || []).some(team =>
                (team.players || []).some(name =>
                    name.toLowerCase() === player.toLowerCase()
                )
            )
        )
        .filter(event =>
            selection === "season1" ? getEventSeason(event) === 1 :
            selection === "season2" ? getEventSeason(event) === 2 :
            true
        )
        .sort((a, b) => Number(b.id) - Number(a.id));

    const limit = Number(selection);

    const selectedEvents = Number.isFinite(limit) && limit > 0
        ? eligibleEvents.slice(0, limit)
        : eligibleEvents;

    return getPlayerAppearances(selectedEvents);
}


    const gameIcons = new Map();

    const playerNames = [
        ...new Set(
            events.flatMap(event =>
                (event.teams || []).flatMap(team => team.players || [])
            )
        )
    ];

    const player = playerNames.find(name =>
        name.toLowerCase() === (requestedPlayer || "").toLowerCase()
    );

    const nameElement = document.getElementById("player-name");

    if (!player) {
        nameElement.textContent = "Player not found";
        document.querySelector(".player-content").hidden = true;
        document.getElementById("player-skin").hidden = true;
        document.querySelector(".player-filters").hidden = true;
        return;
    }

    nameElement.textContent = player;
    document.title = `${player} | MCCC Stats`;

    const skin = document.getElementById("player-skin");
    
const skinSize = player.toLowerCase() === "wailed_burrito61" ? 360 : 180;

skin.src = `https://mc-heads.net/body/${encodeURIComponent(player.toLowerCase())}/${skinSize}`;

    skin.alt = `${player}'s Minecraft skin`;

    // ------------------------------------------
    // HELPERS
    // ------------------------------------------

    const formatNumber = value =>
        Math.round(value).toLocaleString("en-IE");

    const average = values =>
        values.length
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : 0;

    const ordinal = number => {
        const suffix =
            number % 100 >= 11 && number % 100 <= 13
                ? "th"
                : number % 10 === 1
                    ? "st"
                    : number % 10 === 2
                        ? "nd"
                        : number % 10 === 3
                            ? "rd"
                            : "th";

        return `${number}${suffix}`;
    };

    function getPlayerScoreArray(event, playerName) {
        const matchingName = Object.keys(event.scores || {}).find(
            name => name.toLowerCase() === playerName.toLowerCase()
        );

        return matchingName ? event.scores[matchingName] : null;
    }

    function getGameIndex(event, gameId) {
        return (event.games || []).findIndex(
            game => (typeof game === "string" ? game : game.id) === gameId
        );
    }

    function getPlayerGameScore(event, playerName, gameId) {
        const index = getGameIndex(event, gameId);
        if (index === -1) return null;

        const scores = getPlayerScoreArray(event, playerName);
        if (!Array.isArray(scores)) return null;

        const value = scores[index];

        if (value === null || value === undefined || value === "") {
            return null;
        }

        const score = Number(value);
        return Number.isFinite(score)
    ? adjustScore(score, event, gameId)
    : null;
    }

    function getPlayerTotal(event, playerName) {
    const scores = getPlayerScoreArray(event, playerName);

    if (!Array.isArray(scores)) return 0;

    return (event.games || []).reduce((total, game, index) => {
        const gameId = typeof game === "string" ? game : game.id;
        const score = Number(scores[index]) || 0;

        return total + adjustScore(score, event, gameId);
    }, 0);
}

    function getEventRank(event, playerName) {
        const standings = (event.teams || [])
            .flatMap(team => team.players || [])
            .map(name => ({
                name,
                coins: (getPlayerScoreArray(event, name) || [])
    .reduce((sum, score) => sum + (Number(score) || 0), 0)
            }));

        const target = standings.find(
            entry => entry.name.toLowerCase() === playerName.toLowerCase()
        );

        if (!target) return null;

        // Tied players share the same rank.
        return standings.filter(
            entry => entry.coins > target.coins
        ).length + 1;
    }

    function getGameRank(event, gameId, playerName) {
        const standings = (event.teams || [])
            .flatMap(team => team.players || [])
            .map(name => ({
                name,
                score: (() => {
    const index = getGameIndex(event, gameId);
    const scores = getPlayerScoreArray(event, name);
    return index >= 0 && scores ? scores[index] ?? null : null;
})()
            }))
            .filter(entry => entry.score !== null);

        const target = standings.find(
            entry => entry.name.toLowerCase() === playerName.toLowerCase()
        );

        if (!target) return null;

        return standings.filter(
            entry => entry.score > target.score
        ).length + 1;
    }

    function getPlayerTeam(event) {
        return (event.teams || []).find(team =>
            (team.players || []).some(
                name => name.toLowerCase() === player.toLowerCase()
            )
        );
    }

    function getEventSeason(event) {
        if (event.season != null) {
            return Number(event.season);
        }

        return Number(event.id) <= 10 ? 1 : 2;
    }

    // ------------------------------------------
    // FILTERS
    // ------------------------------------------
    function playedFullEvent(event, playerName) {
    const participation = Object.entries(event.participation || {})
        .find(([name]) =>
            name.toLowerCase() === playerName.toLowerCase()
        )?.[1];

    if (!participation) return true;

    return (
        participation.length === (event.games || []).length &&
        participation.every(played => played === true)
    );
}

    function getFilteredEvents() {
        const selectedSeason = seasonSelect.value;
        const includeNoncanon = noncanonCheckbox.checked;

        return events.filter(event => {
            if (!getPlayerTeam(event)) return false;

            if (
                selectedSeason !== "all" &&
                getEventSeason(event) !== Number(selectedSeason)
            ) {
                return false;
            }

            if (
                !includeNoncanon &&
                (event.noncanon === true || event.canon === false)
            ) {
                return false;
            }

            if (
    !fullEventsCheckbox.checked &&
    !playedFullEvent(event, player)
) {
    return false;
}

            return true;
        });
    }

    // ------------------------------------------
    // EVENT RESULTS
    // ------------------------------------------

    function getEventResult(event, team) {
    const dodgebolt = event.dodgebolt;

    if (!dodgebolt || !team) {
        return {
            dodgebolt: false,
            win: false
        };
    }

    const finalists = dodgebolt.finalists || [];
    const winner = dodgebolt.winner;

    return {
        dodgebolt: finalists.includes(team.id),
        win: winner === team.id
    };
}

    function getPlayerAppearances(filteredEvents) {
        return filteredEvents.map(event => {
            const team = getPlayerTeam(event);

            return {
                event,
                team,
                coins: getPlayerTotal(event, player),
                rank: getEventRank(event, player),
                result: getEventResult(event, team)
            };
        });
    }

    // ------------------------------------------
    // EVENT STATISTICS
    // ------------------------------------------

    function renderEventStatistics(appearances) {
        const coins = appearances.map(entry => entry.coins);

        const ranks = appearances
            .map(entry => entry.rank)
            .filter(rank => rank !== null);

        const wins = appearances.filter(
            entry => entry.result.win
        ).length;

        const dodgebolts = appearances.filter(
            entry => entry.result.dodgebolt
        ).length;

        document.getElementById("player-coin-average").textContent =
            coins.length ? formatNumber(average(coins)) : "—";

        document.getElementById("player-rank-average").textContent =
            ranks.length ? average(ranks).toFixed(1) : "—";

        document.getElementById("player-wins").textContent = wins;

        document.getElementById("player-dodgebolts").textContent =
            dodgebolts;

        document.getElementById("player-events").textContent =
            appearances.length;
    }

    // ------------------------------------------
    // EVENT HISTORY
    // ------------------------------------------

    function renderEventHistory(appearances) {
        const tbody = document.getElementById("player-history-body");
        tbody.innerHTML = "";

        if (!appearances.length) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.className = "player-empty";
            cell.textContent = "No events found for these filters.";

            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }

        appearances.forEach(entry => {
            const { event, team, coins, rank, result } = entry;

            const row = document.createElement("tr");

            const eventCell = document.createElement("td");
            const eventLink = document.createElement("a");

            eventLink.href = `event.html?id=${encodeURIComponent(event.id)}`;
            eventLink.textContent = event.name || String(event.id);
            eventCell.appendChild(eventLink);

            const teamCell = document.createElement("td");
            const teamWrapper = document.createElement("span");
            teamWrapper.className = "player-history-team";

            
const teamColor = document.createElement("img");
teamColor.className = "player-history-team-icon";

// Use the first word of the team name as its colour.
// For example: "Blue Bats" becomes "blue".
const teamColour = team.name
    .trim()
    .split(/\s+/)[0]
    .toLowerCase();

teamColor.src = team.icon || `assets/teams/${teamColour}.webp`;
teamColor.alt = "";

// Fall back to a coloured square if the icon is missing.
teamColor.onerror = () => {
    const fallback = document.createElement("span");
    fallback.className = "player-history-team-color";
    fallback.style.backgroundColor = team.color || "#888";

    teamColor.replaceWith(fallback);
};


            const teamName = document.createElement("span");
            teamName.textContent = team.name;

            teamWrapper.append(teamColor, teamName);

            if (result.win || result.dodgebolt) {
    const resultIcon = document.createElement("img");

    resultIcon.src = result.win
        ? "assets/stats/crown.webp"
        : "assets/stats/dodgebolt.webp";

    resultIcon.alt = result.win
        ? "Dodgebolt Winner"
        : "Dodgebolt Finalist";

    resultIcon.title = resultIcon.alt;
    resultIcon.className = "player-dodgebolt-icon";

    teamWrapper.appendChild(resultIcon);
}

            teamCell.appendChild(teamWrapper);

            const coinCell = document.createElement("td");
            coinCell.innerHTML = `${formatNumber(coins)} <img src="assets/coin.webp" class="player-coin-icon" alt="coins">`;

            const rankCell = document.createElement("td");
            rankCell.textContent = rank === null ? "—" : ordinal(rank);

            row.append(eventCell, teamCell, coinCell, rankCell);
            tbody.appendChild(row);
        });
    }

    // ------------------------------------------
    // OVERALL GAME STATISTICS
    // ------------------------------------------

    
function getGameStatistics(appearances) {
    return games.map(game => {
        const scores = [];
        const ranks = [];

        appearances.forEach(({ event }) => {
            const score = getPlayerGameScore(event, player, game.id);

            if (score === null) return;

            scores.push(score);

            const rank = getGameRank(event, game.id, player);

            if (rank !== null) {
                ranks.push(rank);
            }
        });

        return {
            ...game,
            played: scores.length,
            average: scores.length ? average(scores) : null,
            averageRank: ranks.length ? average(ranks) : null,
            best: scores.length ? Math.max(...scores) : null
        };
    });
}


    

function renderGameStatistics(stats) {
    const tbody = document.getElementById("player-games-body");

    // Remember where each game was before reordering.
    const oldPositions = new Map();

    Array.from(tbody.rows).forEach(row => {
        const gameId = row.dataset.game;
        if (!gameId) return;

        oldPositions.set(
            gameId,
            row.getBoundingClientRect().top
        );
    });

    tbody.innerHTML = "";


    [...stats]
    .sort((a, b) => {
        if (!a.played) return 1;
        if (!b.played) return -1;

        return a.averageRank - b.averageRank;
    })
    .forEach(game => {
        const row = document.createElement("tr");
        row.dataset.game = game.id;

        const gameCell = document.createElement("td");
        const gameWrapper = document.createElement("span");
        gameWrapper.className = "player-game-name";

        if (game.icon) {
            const icon = document.createElement("img");
            icon.src = game.icon;
            icon.alt = "";
            gameWrapper.appendChild(icon);
        }

        const name = document.createElement("span");
        name.textContent = game.name;
        gameWrapper.appendChild(name);
        gameCell.appendChild(gameWrapper);

        const averageCell = document.createElement("td");

        if (game.played) {
            averageCell.append(
                document.createTextNode(formatNumber(game.average) + " ")
            );

            const coin = document.createElement("img");
            coin.src = "assets/coin.webp";
            coin.alt = "coins";
            coin.className = "player-coin-icon";
            averageCell.appendChild(coin);
        } else {
            averageCell.textContent = "—";
        }

        const rankCell = document.createElement("td");
        rankCell.textContent = game.averageRank === null
            ? "—"
            : game.averageRank.toFixed(1);

        const detailsCell = document.createElement("td");
        const details = document.createElement("button");

        details.type = "button";
        details.className = "player-game-details-link";
        details.textContent = "DETAILS";

        details.addEventListener("click", () => {
            gameFilter.value = game.id;
            updateProfile();

            document.querySelector(".player-game-selector")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        });

        detailsCell.appendChild(details);

        
        row.append(gameCell, averageCell, rankCell, detailsCell);
        tbody.appendChild(row);
    });

    // Animate games moving into their new positions.
    Array.from(tbody.rows).forEach(row => {
        const oldTop = oldPositions.get(row.dataset.game);

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



    // ------------------------------------------
    // SELECTED GAME STATISTICS
    // ------------------------------------------

    function renderSelectedGame(appearances) {
        const selectedId = gameFilter.value;
        const isAll = selectedId === "all";

        const allGamesView =
            document.getElementById("player-all-games-view");

        const allGamesTable =
            document.getElementById("player-all-games-table");

        const selectedView =
            document.getElementById("player-selected-game-view");

        const selectedIcon =
            document.getElementById("player-selected-game-icon");

        // Switch between the two views.
        allGamesView.hidden = false;
        allGamesTable.hidden = !isAll;
        selectedView.hidden = isAll;

        
const game = games.find(g => g.id === selectedId);

if (selectedIcon) {
    selectedIcon.src =
        game?.icon || "assets/stats/all.webp";
}


        if (isAll || !game) return;

        const results = [];

        appearances.forEach(({ event }) => {
            const score = getPlayerGameScore(
                event,
                player,
                selectedId
            );

            if (score === null) return;

            results.push({
                event,
                score,
                rank: getGameRank(event, selectedId, player)
            });
        });

        const scores = results.map(result => result.score);

        const ranks = results
            .map(result => result.rank)
            .filter(rank => rank !== null);

        const averageCoins = scores.length
            ? average(scores)
            : null;

        const averageRank = ranks.length
            ? average(ranks)
            : null;

        // Update the two cards.
        document.getElementById("player-game-coin-label").textContent =
            `${game.name} Coin Average`;

        document.getElementById("player-game-rank-label").textContent =
            `${game.name} Rank Average`;

        document.getElementById("player-game-coin-average").textContent =
            averageCoins === null
                ? "—"
                : formatNumber(averageCoins);

        document.getElementById("player-game-rank-average").textContent =
            averageRank === null
                ? "—"
                : averageRank.toFixed(1);

        // Build the per-event game history.
        const tbody =
            document.getElementById("player-game-history-body");

        tbody.innerHTML = "";

        if (!results.length) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 3;
            cell.className = "player-empty";
            cell.textContent = "No results for this game.";

            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }

        results.forEach(result => {
            const row = document.createElement("tr");

            const eventCell = document.createElement("td");
            const link = document.createElement("a");

            link.href =
                `event.html?id=${encodeURIComponent(result.event.id)}`;

            link.textContent = result.event.name || String(result.event.id);

            eventCell.appendChild(link);

            const coinCell = document.createElement("td");
            coinCell.innerHTML = `${formatNumber(result.score)} <img src="assets/coin.webp" class="player-coin-icon" alt="coins">`;

            const rankCell = document.createElement("td");
            rankCell.textContent = result.rank === null
                ? "—"
                : ordinal(result.rank);

            row.append(eventCell, coinCell, rankCell);
            tbody.appendChild(row);
        });
    }

    // ------------------------------------------
    // RADAR CHART
    // ------------------------------------------
    let previousRadarPerformance = null;
let radarAnimationFrame = null;

    function renderRadarChart(stats) {
        const canvas = document.getElementById("player-game-radar");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        const width = Math.max(
            300,
            Math.floor(canvas.parentElement.clientWidth)
        );

        const height = 440;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width * 0.30, 155);

        // Sort games from worst average rank to best.
// Higher average rank = worse performance.

const count = stats.length;
if (count < 3) return;
        const appearances = getRadarAppearances();

        // Calculate performance percentile for each game.
        const performance = stats.map(game => {
            const results = [];

            appearances.forEach(({ event }) => {
                const playerScore = getPlayerGameScore(
                    event,
                    player,
                    game.id
                );

                if (playerScore === null) return;

                const rank = getGameRank(event, game.id, player);

                const totalPlayers = (event.teams || [])
                    .flatMap(team => team.players || [])
                    .filter(name =>
                        getPlayerGameScore(event, name, game.id) !== null
                    ).length;

                if (rank === null || totalPlayers === 0) return;

                const percentage = totalPlayers > 1
                    ? ((totalPlayers - rank) / (totalPlayers - 1)) * 100
                    : 100;

                results.push(percentage);
            });

            return results.length ? average(results) : 0;
        });

        function point(index, fraction) {
            const angle =
                (Math.PI * 2 * index) / count - Math.PI / 2;

            return {
                x: centerX + Math.cos(angle) * radius * fraction,
                y: centerY + Math.sin(angle) * radius * fraction
            };
        }

        // Draw five radar rings.
        for (let ring = 1; ring <= 5; ring++) {
            ctx.beginPath();

            stats.forEach((game, index) => {
                const p = point(index, ring / 5);

                if (index === 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            });

            ctx.closePath();
            ctx.strokeStyle = "rgba(255,255,255,0.07)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw axes and game icons.
        stats.forEach((game, index) => {
            const end = point(index, 1);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.stroke();

            const labelPoint = point(index, 1.28);
            const icon = gameIcons.get(game.id);

            if (icon && icon.complete && icon.naturalWidth > 0) {
                const size = 36;

                ctx.drawImage(
                    icon,
                    labelPoint.x - size / 2,
                    labelPoint.y - size / 2,
                    size,
                    size
                );
            } else {
                ctx.font = "13px 'Lexend Deca', sans-serif";
                ctx.fillStyle = "#e5e7eb";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.fillText(
                    game.shortName || game.name,
                    labelPoint.x,
                    labelPoint.y
                );
            }
        });

        
        // Draw the performance polygon at the supplied values.
        function drawPerformancePolygon(values) {
            ctx.beginPath();

            values.forEach((value, index) => {
                const p = point(index, value / 100);

                if (index === 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            });

            ctx.closePath();
            ctx.fillStyle = "rgba(234, 171, 78, 0.28)";
            ctx.strokeStyle = "#f1b65e";
            ctx.lineWidth = 2.5;
            ctx.fill();
            ctx.stroke();

            values.forEach((value, index) => {
                const p = point(index, value / 100);

                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#f1b65e";
                ctx.fill();
            });
        }

        // Save the grid and icons so they stay stationary.
        const background = document.createElement("canvas");
        background.width = canvas.width;
        background.height = canvas.height;
        background.getContext("2d").drawImage(canvas, 0, 0);

        // Cancel any previous animation.
        if (radarAnimationFrame !== null) {
            cancelAnimationFrame(radarAnimationFrame);
        }

        const startValues =
            previousRadarPerformance?.length === performance.length
                ? [...previousRadarPerformance]
                : [...performance];

        const targetValues = [...performance];

        // Track the values currently displayed.
        let currentValues = [...startValues];
        previousRadarPerformance = currentValues;

        const duration = 500;
        const startTime = window.performance.now();

        function animateRadar(now) {
            const progress = Math.min((now - startTime) / duration, 1);

            // Smooth easing, matching the leaderboard.
            const eased = 1 - Math.pow(1 - progress, 4);

            currentValues = startValues.map((start, index) =>
                start + (targetValues[index] - start) * eased
            );

            previousRadarPerformance = currentValues;

            // Restore the stationary grid and game icons.
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(background, 0, 0, width, height);

            // Draw the animated shape.
            drawPerformancePolygon(currentValues);

            if (progress < 1) {
                radarAnimationFrame = requestAnimationFrame(animateRadar);
            } else {
                radarAnimationFrame = null;
            }
        }

        // Draw the initial chart immediately.
        if (startValues.every((value, i) => value === targetValues[i])) {
            drawPerformancePolygon(targetValues);
            previousRadarPerformance = targetValues;
        } else {
            radarAnimationFrame = requestAnimationFrame(animateRadar);
        }

    }

    // ------------------------------------------
    // LOAD GAME ICONS
    // ------------------------------------------

    games.forEach(game => {
        if (!game.icon) return;

        const icon = new Image();
        gameIcons.set(game.id, icon);

        icon.onload = () => {
    renderRadarChart(getGameStatistics(getRadarAppearances()));
};

        icon.src = game.icon;
    });

    
    // ------------------------------------------
    // PLAYER PROGRESSION
    // ------------------------------------------
    const progressMetric = document.getElementById("progress-metric");
    const progressGame = document.getElementById("progress-game");
    const progressHistory = document.getElementById("progress-history");
    const progressContainer = document.getElementById("player-progression-chart");

    function getProgressionAppearances() {
        const selection = progressHistory.value;

        const eligible = events.filter(event =>
            event.noncanon !== true &&
            event.canon !== false &&
            playedFullEvent(event, player) &&
            Boolean(getPlayerTeam(event)) &&
            (selection !== "season1" || getEventSeason(event) === 1) &&
            (selection !== "season2" || getEventSeason(event) === 2)
        ).sort((a, b) => Number(a.id) - Number(b.id));

        const limit = Number(selection);

        const selected = Number.isFinite(limit) && limit > 0
            ? eligible.slice(-limit)
            : eligible;

        return getPlayerAppearances(selected);
    }

    let progressionTooltip = null;

function hideProgressionTooltip() {
    if (progressionTooltip) {
        progressionTooltip.hidden = true;
    }
}

function showProgressionTooltip(entry, x, y, isRank, gameId) {
    if (!progressionTooltip) {
        progressionTooltip = document.createElement("div");
        progressionTooltip.className = "progression-tooltip";
        progressContainer.appendChild(progressionTooltip);
    }

    const { event, team } = entry;

    const teamColour = team?.name
        ?.trim()
        .split(/\s+/)[0]
        .toLowerCase() || "";

    const icon = team?.icon ||
        `assets/teams/${teamColour}.webp`;

    const coins = gameId === "all"
        ? getPlayerTotal(event, player)
        : getPlayerGameScore(event, player, gameId);

    const rank = gameId === "all"
        ? getEventRank(event, player)
        : getGameRank(event, gameId, player);

    progressionTooltip.replaceChildren();

    const header = document.createElement("div");
    header.className = "progression-tooltip-header";
    header.textContent = event.name || `MCCC ${event.id}`;

    const teamRow = document.createElement("div");
    teamRow.className = "progression-tooltip-team";

    const teamIcon = document.createElement("img");
    teamIcon.src = icon;
    teamIcon.alt = "";

    const teamName = document.createElement("strong");
    teamName.textContent = team?.name || "Unknown Team";

    teamRow.append(teamIcon, teamName);

    const stats = document.createElement("div");
    stats.className = "progression-tooltip-stats";

    const coinRow = document.createElement("div");
    coinRow.className = "progression-tooltip-stat";

    const coinLabel = document.createElement("span");
    coinLabel.textContent = "Coins";

    const coinValue = document.createElement("strong");
    coinValue.textContent = coins === null
        ? "—"
        : formatNumber(coins);

    const coinIcon = document.createElement("img");
    coinIcon.src = "assets/coin.webp";
    coinIcon.alt = "";
    coinIcon.className = "progression-tooltip-coin";

    const coinDisplay = document.createElement("span");
    coinDisplay.className = "progression-tooltip-value";
    coinDisplay.append(coinValue, coinIcon);

    coinRow.append(coinLabel, coinDisplay);

    const rankRow = document.createElement("div");
    rankRow.className = "progression-tooltip-stat";

    const rankLabel = document.createElement("span");
    rankLabel.textContent = "Placement";

    const rankValue = document.createElement("strong");
    rankValue.textContent = rank === null ? "—" : ordinal(rank);

    rankRow.append(rankLabel, rankValue);

    stats.append(coinRow, rankRow);

    const footer = document.createElement("div");
    footer.className = "progression-tooltip-footer";
    footer.textContent = "Click to view event →";

    progressionTooltip.append(header, teamRow, stats, footer);
    progressionTooltip.hidden = false;

    // Position relative to the actual SVG point.
    const svg = progressContainer.querySelector("svg");
    const svgRect = svg.getBoundingClientRect();
    const containerRect = progressContainer.getBoundingClientRect();

    const svgX = svgRect.left - containerRect.left +
        x * svgRect.width / 900;

    const svgY = svgRect.top - containerRect.top +
        y * svgRect.height / 360;

    const tooltipWidth = progressionTooltip.offsetWidth;
    const tooltipHeight = progressionTooltip.offsetHeight;

    const left = Math.max(
        4,
        Math.min(
            svgX - tooltipWidth / 2,
            progressContainer.clientWidth - tooltipWidth - 4
        )
    );

    let top = svgY - tooltipHeight - 14;

    if (top < 4) {
        top = svgY + 14;
    }

    progressionTooltip.style.left = `${left}px`;
    progressionTooltip.style.top = `${top}px`;
}

    
function renderProgression() {
    if (!progressContainer) return;

    const metric = progressMetric.value;
    const gameId = progressGame.value;
    const isRank = metric === "rank";

    const entries = getProgressionAppearances()
        .map(({ event, coins, rank, team }) => ({
            event,
            team,
            value: gameId === "all"
                ? (isRank ? rank : coins)
                : isRank
                    ? getGameRank(event, gameId, player)
                    : getPlayerGameScore(event, player, gameId)
        }))
        .filter(entry =>
            entry.value !== null &&
            Number.isFinite(entry.value)
        );

    // Remember the current graph before replacing it.
    const oldSvg = progressContainer.querySelector("svg");

    const oldAverageY = oldSvg
    ? Number(oldSvg.querySelector(".progress-average")?.getAttribute("y1"))
    : null;

    const oldPoints = oldSvg
        ? [...oldSvg.querySelectorAll(".progress-point")].map(point => ({
            x: Number(point.getAttribute("cx")),
            y: Number(point.getAttribute("cy"))
        }))
        : [];

    // Cancel an animation that is still running.
    if (progressContainer._progressAnimation) {
        cancelAnimationFrame(progressContainer._progressAnimation);
        progressContainer._progressAnimation = null;
    }

    progressContainer.replaceChildren();
    progressionTooltip = null;

    if (!entries.length) {
        progressContainer.textContent =
            "No results for this history selection.";
        progressContainer.classList.add("player-progression-empty");
        return;
    }

    progressContainer.classList.remove("player-progression-empty");

    const W = 900;
    const H = 360;

    const pad = {
        left: 70,
        right: 30,
        top: 55,
        bottom: 66
    };

    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const values = entries.map(entry => entry.value);
    const mean = average(values);
    const rawMax = Math.max(...values);

    const niceStep = rough => {
        const power = Math.pow(
            10,
            Math.floor(Math.log10(Math.max(rough, 0.0001)))
        );

        const fraction = rough / power;

        const nice = fraction <= 1 ? 1
            : fraction <= 2 ? 2
            : fraction <= 2.5 ? 2.5
            : fraction <= 5 ? 5
            : 10;

        return nice * power;
    };

    const step = isRank
        ? Math.max(1, Math.ceil((rawMax - 1) / 4))
        : niceStep(rawMax / 4);

    const min = isRank ? 1 : 0;

    const max = isRank
        ? Math.max(5, 1 + step * 4)
        : Math.max(step * 4, Math.ceil(rawMax / step) * step);

    const x = index =>
        pad.left + (
            entries.length === 1
                ? plotW / 2
                : index * plotW / (entries.length - 1)
        );

    const y = value =>
        pad.top + (
            isRank
                ? (value - min) / (max - min)
                : (max - value) / (max - min)
        ) * plotH;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("class", "player-progression-svg");
    svg.setAttribute("aria-hidden", "true");

    const make = (tag, attrs = {}, content) => {
        const element = document.createElementNS(svgNS, tag);

        Object.entries(attrs).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        if (content !== undefined) {
            element.textContent = content;
        }

        return element;
    };

    // Grid and Y-axis.
    for (let i = 0; i <= 4; i++) {
        const value = min + (max - min) * i / 4;
        const yy = y(value);

        svg.append(
            make("line", {
                x1: pad.left,
                y1: yy,
                x2: W - pad.right,
                y2: yy,
                class: "progress-grid"
            })
        );

        svg.append(
            make("text", {
                x: pad.left - 12,
                y: yy + 4,
                "text-anchor": "end",
                class: "progress-axis"
            }, isRank
                ? String(Math.round(value))
                : formatNumber(value))
        );
    }

    
// Average reference line.
const targetAverageY = y(mean);

const startingAverageY = Number.isFinite(oldAverageY)
    ? oldAverageY
    : targetAverageY;

const averageLine = make("line", {
    x1: pad.left,
    y1: startingAverageY,
    x2: W - pad.right,
    y2: startingAverageY,
    class: "progress-average"
});

svg.append(averageLine);


    svg.append(
        make("text", {
            x: W - pad.right,
            y: 24,
            "text-anchor": "end",
            class: "progress-average-label"
        }, `Average: ${
            isRank ? mean.toFixed(1) : formatNumber(mean)
        }`)
    );

    // Final positions for the new settings.
    const targetPoints = entries.map((entry, index) => ({
        x: x(index),
        y: y(entry.value)
    }));

    // Match the old graph to the new number of points.
    const startingPoints = targetPoints.map((target, index) => {
        if (!oldPoints.length) return { ...target };

        const oldIndex = targetPoints.length === 1
            ? Math.floor((oldPoints.length - 1) / 2)
            : Math.round(
                index * (oldPoints.length - 1) /
                (targetPoints.length - 1)
            );

        return { ...oldPoints[oldIndex] };
    });

    // The line and points start at the previous positions.
    let line = null;

    if (entries.length > 1) {
        line = make("polyline", {
            points: startingPoints
                .map(point => `${point.x},${point.y}`)
                .join(" "),
            class: "progress-line"
        });

        svg.append(line);
    }

    const circles = [];

    const labelStep = Math.max(
        1,
        Math.ceil(entries.length / 10)
    );

    entries.forEach((entry, index) => {
        const point = startingPoints[index];

        if (
            index % labelStep === 0 ||
            index === entries.length - 1
        ) {
            svg.append(
                make("text", {
                    x: targetPoints[index].x,
                    y: H - 28,
                    "text-anchor": "middle",
                    class: "progress-axis"
                }, entry.event.name || `MCCC ${entry.event.id}`)
            );
        }

        const link = make("a", {
            href: `event.html?id=${encodeURIComponent(entry.event.id)}`,
            class: "progress-point-link"
        });

        const circle = make("circle", {
            cx: point.x,
            cy: point.y,
            r: 6,
            class: "progress-point"
        });

        // Disable the previous draw/pop animations.
        circle.style.setProperty(
            "animation",
            "none",
            "important"
        );

        circles.push(circle);
        link.append(circle);

        // The tooltip follows the point's current position.
        const showTooltip = () => {
            showProgressionTooltip(
                entry,
                Number(circle.getAttribute("cx")),
                Number(circle.getAttribute("cy")),
                isRank,
                gameId
            );
        };

        link.addEventListener("mouseenter", showTooltip);
        link.addEventListener("mouseleave", hideProgressionTooltip);
        link.addEventListener("focus", showTooltip);
        link.addEventListener("blur", hideProgressionTooltip);

        svg.append(link);
    });

    if (line) {
        line.style.setProperty(
            "animation",
            "none",
            "important"
        );
        line.style.strokeDasharray = "none";
        line.style.strokeDashoffset = "0";
    }

    progressContainer.append(svg);

    progressContainer.setAttribute(
        "aria-label",
        `${player} ${isRank ? "placement" : "coins"} progression across ${entries.length} events`
    );

    // Animate only when there was a previous graph.
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!oldPoints.length || reducedMotion) {
        updatePositions(1);
        return;
    }

    const duration = 550;
    let startTime = null;

    
function updatePositions(t) {
    const currentPoints = targetPoints.map((target, index) => {
        const start = startingPoints[index];

        return {
            x: start.x + (target.x - start.x) * t,
            y: start.y + (target.y - start.y) * t
        };
    });

    // Move the gold points.
    circles.forEach((circle, index) => {
        circle.setAttribute("cx", currentPoints[index].x);
        circle.setAttribute("cy", currentPoints[index].y);
    });

    // Move the gold connecting line.
    if (line) {
        line.setAttribute(
            "points",
            currentPoints
                .map(point => `${point.x},${point.y}`)
                .join(" ")
        );
    }

    // Move the dashed average line.
    const currentAverageY =
        startingAverageY +
        (targetAverageY - startingAverageY) * t;

    averageLine.setAttribute("y1", currentAverageY);
    averageLine.setAttribute("y2", currentAverageY);
}


    function animateFrame(timestamp) {
        if (startTime === null) startTime = timestamp;

        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth ease-in-out movement.
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        updatePositions(eased);

        if (progress < 1) {
            progressContainer._progressAnimation =
                requestAnimationFrame(animateFrame);
        } else {
            progressContainer._progressAnimation = null;
        }
    }

    progressContainer._progressAnimation =
        requestAnimationFrame(animateFrame);
}


    [progressMetric, progressGame, progressHistory].forEach(
        control => control?.addEventListener("change", updateProfile)
    );

    // ------------------------------------------
    // UPDATE PROFILE
    // ------------------------------------------

    

function updateProfile() {
    const filteredEvents = getFilteredEvents();
    const appearances = getPlayerAppearances(filteredEvents);

    // Radar dropdown controls Game Statistics.
    const radarAppearances = getRadarAppearances();
    const gameStats = getGameStatistics(radarAppearances);

    // Event Statistics retain their existing filters.
    renderEventStatistics(appearances);
    renderEventHistory(appearances);
    renderProgression();

    // Game Statistics use the radar dropdown.
    renderGameStatistics(gameStats);
    renderSelectedGame(radarAppearances);
    renderRadarChart(gameStats);
}



    // ------------------------------------------
    // EVENT LISTENERS
    // ------------------------------------------

    gameFilter.addEventListener("change", updateProfile);

    radarHistorySelect.addEventListener("change", updateProfile);

    seasonSelect.addEventListener("change", updateProfile);

    noncanonCheckbox.addEventListener("change", updateProfile);

    fullEventsCheckbox.addEventListener("change", updateProfile);

    window.addEventListener("resize", () => {
        renderRadarChart(getGameStatistics(getRadarAppearances()));
    });

    document.querySelectorAll("[data-score-mode]").forEach(button => {
    button.addEventListener("click", () => {
        scoreMode = button.dataset.scoreMode;

        document.querySelectorAll("[data-score-mode]").forEach(other => {
            const active = other.dataset.scoreMode === scoreMode;

            other.classList.toggle("active", active);
            other.setAttribute("aria-pressed", String(active));
        });

        updateProfile();
    });
});

    // Initial page render.
    updateProfile();

});
