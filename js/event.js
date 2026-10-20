
/* ==========================================
   MCCC STATS - INDIVIDUAL EVENT PAGE
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    setupEventPage();
});

function setupEventPage() {
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get("id") || "1";
const eventId = rawId === "scuffed" ? "scuffed" : Number(rawId);

    const event = window.MCCC_DATA?.getEventById(eventId);

    if (!event) {
        document.getElementById("event-title").textContent =
            "Event not found";
        return;
    }

    let showUnmultiplied = false;
    let activeTab = "team";
    let sortColumn = "total";
    let sortDirection = "desc";

    const formatScore = value =>
        Number(value).toLocaleString("en-IE", {
            maximumFractionDigits: 2
        });

    const gameById = id =>
        window.MCCC_GAMES.find(game => game.id === id);

    const getGameName = id =>
        gameById(id)?.name || id;

    const getGameIcon = id =>
        "assets/games/" + id + ".webp";

    const getTeamIcon = team =>
    team.icon || "assets/teams/" + team.id + ".webp";

    const getDodgeboltIcon = team => {
    const dodgebolt = event.dodgebolt;

    if (!dodgebolt) return null;

    // Scuffed: multiple winning teams
    if (dodgebolt.winningSide?.includes(team.id)) {
        return "assets/stats/crown.webp";
    }

    // Normal events: one winning team
    if (dodgebolt.winner === team.id) {
        return "assets/stats/crown.webp";
    }

    if (dodgebolt.finalists?.includes(team.id)) {
        return "assets/stats/dodgebolt.webp";
    }

    return null;
};

    const getPlayerHead = name => {
    const username = name.toLowerCase();

    const size = [
        "creep1et",
        "wailed_burrito61",
        "froopyloopidy"
    ].includes(username) ? 64 : 32;

    return `https://mc-heads.net/avatar/${encodeURIComponent(username)}/${size}`;
};

    /* ======================================
       EVENT BANNER
       ====================================== */

    function renderBanner() {
        document.title = event.name + " - MCCC Stats";

        document.getElementById("event-title").textContent =
            event.name;

        const dateElement = document.getElementById(
            "event-date"
        );

        if (event.date) {
            const parts = event.date.split("-");

            if (parts.length === 3) {
                const date = new Date(
                    Number(parts[0]),
                    Number(parts[1]) - 1,
                    Number(parts[2])
                );

                dateElement.textContent =
                    date.toLocaleDateString("en-IE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    });
            } else {
                dateElement.textContent = event.date;
            }
        } else {
            dateElement.textContent = "";
        }

        if (event.banner) {
            document.getElementById(
                "event-banner"
            ).style.backgroundImage =
                'url("' + event.banner + '")';
        }
    }

    /* ======================================
       TEAM LIST
       ====================================== */

    function renderTeams() {
        const container = document.getElementById(
            "event-detail-teams"
        );

        container.replaceChildren();

        event.teams.forEach(team => {
            const card = document.createElement("div");
            card.className = "team-card event-team-card";
            card.style.setProperty(
                "--event-team-color",
                team.color
            );

            const heading = document.createElement("div");
            heading.className = "event-team-heading";

            const icon = document.createElement("img");
            icon.src = getTeamIcon(team);
            icon.alt = "";
            icon.className = "event-team-icon";

            // Keep the layout usable without team icons.
            icon.onerror = () => {
                icon.style.display = "none";
            };

            const name = document.createElement("strong");
            name.textContent = team.name;

            heading.append(icon, name);
            card.appendChild(heading);

            const divider = document.createElement("hr");
            divider.className = "event-team-divider";
            card.appendChild(divider);

            team.players.forEach(playerName => {
                const link = document.createElement("a");
                link.className = "event-team-player";

                link.href =
                    "player.html?name=" +
                    encodeURIComponent(playerName);

                const head = document.createElement("img");
                head.src = getPlayerHead(playerName);
                head.alt = "";
                head.loading = "lazy";

                const label = document.createElement("span");
                label.textContent = playerName;

                link.append(head, label);
                card.appendChild(link);
            });

            container.appendChild(card);
        });
    }

    /* ======================================
       GAME SELECTION
       ====================================== */

    function createGameCard(gameId, skipped = false) {
        const game = gameById(gameId);

        const card = document.createElement("div");
        card.className = "event-game-card";

        if (skipped) {
            card.classList.add("skipped");
        }

        const imageBox = document.createElement("div");
        imageBox.className = "event-game-icon-box";

        const image = document.createElement("img");
        image.src = getGameIcon(gameId);
        image.alt = game?.name || gameId;
        image.loading = "lazy";

        image.onerror = () => {
            image.style.display = "none";
        };

        imageBox.appendChild(image);

        const label = document.createElement("span");
        label.textContent = game?.name || gameId;

        card.append(imageBox, label);

        return card;
    }

    function renderGames() {
        const selected = document.getElementById(
            "event-selected-games"
        );

        const skipped = document.getElementById(
            "event-skipped-games"
        );

        selected.replaceChildren();
        skipped.replaceChildren();

        event.games.forEach(gameId => {
            selected.appendChild(
                createGameCard(gameId)
            );
        });

        const skippedGames = window.MCCC_GAMES.filter(
            game => !event.games.includes(game.id)
        );

        skippedGames.forEach(game => {
            skipped.appendChild(
                createGameCard(game.id, true)
            );
        });

        if (skippedGames.length === 0) {
            const message = document.createElement("p");
            message.className = "event-empty-message";
            message.textContent = "No skipped games";

            skipped.appendChild(message);
        }
    }

    /* ======================================
       SCORING
       ====================================== */

    function getPlayerGameScore(playerName, index) {
        const scores = event.scores[playerName];

        if (!scores) return 0;

        return Number(scores[index] || 0);
    }

    function getDisplayedScore(playerName, index) {
        const score = getPlayerGameScore(
            playerName,
            index
        );

        if (showUnmultiplied) {
            return score;
        }

        return score * (event.multipliers[index] || 1);
    }

    function getTeamGameScore(team, index) {
    const playerTotal = team.players.reduce(
        (sum, playerName) =>
            sum + getDisplayedScore(playerName, index),
        0
    );

    const ghostScore = Number(
        event.ghostScores?.[team.id]?.[index] ?? 0
    );

    const gameMultiplier = showUnmultiplied
        ? 1
        : (event.multipliers[index] || 1);

    const teamMultiplier =
        event.teamScoreMultipliers?.[team.id] || 1;

    return (
        playerTotal + ghostScore * gameMultiplier
    ) * teamMultiplier;
}

    function getPlayerTotal(playerName) {
        return event.games.reduce(
            (total, gameId, index) =>
                total + getDisplayedScore(
                    playerName,
                    index
                ),
            0
        );
    }

    function getTeamTotal(team) {
    return event.games.reduce(
        (total, gameId, index) =>
            total + getTeamGameScore(team, index),
        0
    );
}

    /* ======================================
       TABLE HEADERS
       ====================================== */

    function createHeader(label, column) {
        const th = document.createElement("th");
        th.className = "event-sortable-header";

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;

        button.addEventListener("click", () => {
            changeSort(column);
        });

        th.appendChild(button);

        return th;
    }

    function renderTableHeader(type) {
        const head = document.getElementById(
            type === "team"
                ? "event-team-head"
                : "event-individual-head"
        );

        head.replaceChildren();

        const row = document.createElement("tr");

        const rank = document.createElement("th");
        rank.textContent = "";

        row.appendChild(rank);

        row.appendChild(
            createHeader(
                type === "team" ? "Team" : "Player",
                "name"
            )
        );

        event.games.forEach((gameId, index) => {
            const th = document.createElement("th");
            th.className = "event-game-column";

            const button = document.createElement("button");
            button.type = "button";
            button.className = "event-game-header";

            button.title = getGameName(gameId);

            const icon = document.createElement("img");
            icon.src = getGameIcon(gameId);
            icon.alt = getGameName(gameId);

            icon.onerror = () => {
                icon.style.display = "none";
            };

            const multiplier = document.createElement(
                "span"
            );

            multiplier.textContent = showUnmultiplied
                ? "x1"
                : "x" + event.multipliers[index];

            button.append(icon, multiplier);

            button.addEventListener("click", () => {
                changeSort(index);
            });

            th.appendChild(button);
            row.appendChild(th);
        });

        row.appendChild(
            createHeader("Total", "total")
        );

        head.appendChild(row);
    }

    /* ======================================
       SORTING
       ====================================== */

    function changeSort(column) {
        if (sortColumn === column) {
            sortDirection =
                sortDirection === "desc"
                    ? "asc"
                    : "desc";
        } else {
            sortColumn = column;
            sortDirection =
                column === "name" ? "asc" : "desc";
        }

        renderBreakdown();
    }

    function sortEntries(entries, type) {
        return [...entries].sort((a, b) => {
            let comparison = 0;

            if (sortColumn === "name") {
                comparison = a.name.localeCompare(
                    b.name
                );
            } else {
                const getValue = entry => {
                    if (sortColumn === "total") {
                        return type === "team"
                            ? getTeamTotal(entry.team)
                            : getPlayerTotal(entry.name);
                    }

                    return type === "team"
                        ? getTeamGameScore(
                            entry.team,
                            sortColumn
                        )
                        : getDisplayedScore(
                            entry.name,
                            sortColumn
                        );
                };

                comparison =
                    getValue(a) - getValue(b);
            }

            return sortDirection === "asc"
                ? comparison
                : -comparison;
        });
    }

    /* ======================================
       TEAM BREAKDOWN
       ====================================== */

    function renderTeamBreakdown() {
        const body = document.getElementById(
            "event-team-body"
        );

        body.replaceChildren();

        const entries = event.teams.map(team => ({
            name: team.name,
            team
        }));

        const sorted = sortEntries(entries, "team");

        sorted.forEach((entry, index) => {
            const team = entry.team;

            const row = document.createElement("tr");
            row.className = "event-score-row";
            row.dataset.team = team.id;
            row.style.setProperty(
                "--event-row-color",
                team.color
            );

            const rank = document.createElement("th");
            rank.textContent = index + 1;

            const nameCell = document.createElement("th");
            nameCell.className = "event-score-name";

            const nameWrapper = document.createElement(
                "div"
            );

            nameWrapper.className =
                "event-score-name-content";

            const icon = document.createElement("img");
            icon.src = getTeamIcon(team);
            icon.alt = "";
            icon.className = "event-score-team-icon";

            icon.onerror = () => {
                icon.style.display = "none";
            };

            const text = document.createElement("div");

            const teamName = document.createElement("strong");
teamName.textContent = team.name;

// Dodgebolt winner / finalist icon
const dodgeboltIconPath = getDodgeboltIcon(team);

if (dodgeboltIconPath) {
    const dodgeboltIcon = document.createElement("img");

    dodgeboltIcon.src = dodgeboltIconPath;
    dodgeboltIcon.alt =
    event.dodgebolt.winner === team.id ||
    event.dodgebolt.winningSide?.includes(team.id)
        ? "Dodgebolt Winner"
        : "Dodgebolt Finalist";

    dodgeboltIcon.title = dodgeboltIcon.alt;
    dodgeboltIcon.className = "event-dodgebolt-icon";

    teamName.appendChild(dodgeboltIcon);
}

const players = document.createElement("small");
            players.textContent =
                team.players.join(", ");

            text.append(teamName, players);
            nameWrapper.append(icon, text);
            nameCell.appendChild(nameWrapper);

            row.append(rank, nameCell);

            event.games.forEach((gameId, gameIndex) => {
                const cell = document.createElement("td");
                cell.textContent = formatScore(
                    getTeamGameScore(team, gameIndex)
                );

                row.appendChild(cell);
            });

            const total = document.createElement("th");
            total.className = "event-score-total";
            total.textContent = formatScore(
                getTeamTotal(team)
            );

            row.appendChild(total);
            body.appendChild(row);
        });
    }

    /* ======================================
       INDIVIDUAL BREAKDOWN
       ====================================== */

    function renderIndividualBreakdown() {
        const body = document.getElementById(
            "event-individual-body"
        );

        body.replaceChildren();

        const entries = event.teams.flatMap(team =>
            team.players.map(name => ({
                name,
                team
            }))
        );

        const sorted = sortEntries(
            entries,
            "individual"
        );

        sorted.forEach((entry, index) => {
            const row = document.createElement("tr");
            row.className = "event-score-row";
            row.dataset.player = entry.name;

            row.style.setProperty(
                "--event-row-color",
                entry.team.color
            );

            const rank = document.createElement("th");
            rank.textContent = index + 1;

            const nameCell = document.createElement("th");
            nameCell.className = "event-score-name";

            const link = document.createElement("a");
            link.className = "event-score-name-content";

            link.href =
                "player.html?name=" +
                encodeURIComponent(entry.name);

            const head = document.createElement("img");
            head.src = getPlayerHead(entry.name);
            head.alt = "";
            head.className = "event-score-player-head";

            const name = document.createElement("strong");
name.textContent = entry.name;

link.append(head, name);

const dodgeboltIconPath = getDodgeboltIcon(entry.team);

if (dodgeboltIconPath) {
    const resultIcon = document.createElement("img");

    resultIcon.src = dodgeboltIconPath;
    resultIcon.alt =
    event.dodgebolt.winner === entry.team.id ||
    event.dodgebolt.winningSide?.includes(entry.team.id)
        ? "Dodgebolt Winner"
        : "Dodgebolt Finalist";

    resultIcon.title = resultIcon.alt;
    resultIcon.className = "event-player-result-icon";

    link.appendChild(resultIcon);
}
            nameCell.appendChild(link);

            row.append(rank, nameCell);

            event.games.forEach((gameId, gameIndex) => {
                const cell = document.createElement("td");

                cell.textContent = formatScore(
                    getDisplayedScore(
                        entry.name,
                        gameIndex
                    )
                );

                row.appendChild(cell);
            });

            const total = document.createElement("th");
            total.className = "event-score-total";

            total.textContent = formatScore(
                getPlayerTotal(entry.name)
            );

            row.appendChild(total);
            body.appendChild(row);
        });
    }

    /* ======================================
       TABS AND TOGGLE
       ====================================== */

    


function renderBreakdown() {
    const oldPositions = new Map();

    // Save the positions of the existing rows
    ["team", "individual"].forEach(type => {
        const tbody = document.getElementById(
            type === "team"
                ? "event-team-body"
                : "event-individual-body"
        );

        Array.from(tbody.rows).forEach(row => {
            const key = row.dataset.team ||
                        row.dataset.player;

            if (!key) return;

            oldPositions.set(
                type + ":" + key,
                row.getBoundingClientRect().top
            );
        });
    });

    // Render the updated leaderboard
    renderTableHeader("team");
    renderTableHeader("individual");
    renderTeamBreakdown();
    renderIndividualBreakdown();

    // Highlight the currently selected column
    document.querySelectorAll(
        ".event-breakdown-table"
    ).forEach(table => {
        table.querySelectorAll("tr").forEach(row => {
            const cells = row.children;

            Array.from(cells).forEach(cell => {
                cell.classList.remove("event-active-column");
            });

            const columnIndex =
                sortColumn === "name" ? 1 :
                sortColumn === "total"
                    ? event.games.length + 2
                    : sortColumn + 2;

            if (cells[columnIndex]) {
                cells[columnIndex].classList.add(
                    "event-active-column"
                );
            }
        });
    });

    // Animate each row's cells from old to new position
    ["team", "individual"].forEach(type => {
        const tbody = document.getElementById(
            type === "team"
                ? "event-team-body"
                : "event-individual-body"
        );

        Array.from(tbody.rows).forEach(row => {
            const key = row.dataset.team ||
                        row.dataset.player;

            if (!key) return;

            const oldTop = oldPositions.get(
                type + ":" + key
            );

            if (oldTop === undefined) return;

            const newTop =
                row.getBoundingClientRect().top;

            const delta = oldTop - newTop;

            if (Math.abs(delta) < 1) return;

            Array.from(row.cells).forEach(cell => {
                cell.animate(
                    [
                        {
                            transform:
                                `translateY(${delta}px)`
                        },
                        {
                            transform: "translateY(0)"
                        }
                    ],
                    {
                        duration: 500,
                        easing:
                            "cubic-bezier(0.22, 1, 0.36, 1)"
                    }
                );
            });
        });
    });
}

 
function switchTab(tab) {
    activeTab = tab;

    // Set the default multiplier mode for each table
    showUnmultiplied = tab === "individual";

    // Keep the checkbox in sync
    document.getElementById(
        "event-unmultiplied"
    ).checked = showUnmultiplied;

    const teamTab = document.getElementById(
        "event-team-tab"
    );

    const individualTab = document.getElementById(
        "event-individual-tab"
    );

    const teamPanel = document.getElementById(
        "event-team-panel"
    );

    const individualPanel = document.getElementById(
        "event-individual-panel"
    );

    teamTab.classList.toggle(
        "active",
        activeTab === "team"
    );

    individualTab.classList.toggle(
        "active",
        activeTab === "individual"
    );

    teamTab.setAttribute(
        "aria-selected",
        String(activeTab === "team")
    );

    individualTab.setAttribute(
        "aria-selected",
        String(activeTab === "individual")
    );

    teamPanel.hidden = activeTab !== "team";
    individualPanel.hidden = activeTab !== "individual";

    // Recalculate the scores using the new multiplier mode
    renderBreakdown();
}


    document.getElementById(
        "event-team-tab"
    ).addEventListener("click", () => {
        switchTab("team");
    });

    document.getElementById(
        "event-individual-tab"
    ).addEventListener("click", () => {
        switchTab("individual");
    });

    document.getElementById(
        "event-unmultiplied"
    ).addEventListener("change", event => {
        showUnmultiplied = event.target.checked;
        renderBreakdown();
    });

    /* ======================================
       INITIAL RENDER
       ====================================== */

    renderBanner();
    renderTeams();
    renderBreakdown();
    switchTab("team");
}
