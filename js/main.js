
/* ==========================================
   MCCC STATS - MAIN JAVASCRIPT
   Theme switching and player search
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    setupThemeSwitcher();
    setupPlayerSearch();
    setupNextEventTeams();
});

/* ==========================================
   1. THEME SWITCHER
   ========================================== */

function setupThemeSwitcher() {
    const themeButton = document.getElementById("theme-button");
    const themeMenu = document.getElementById("theme-menu");

    if (!themeButton || !themeMenu) return;

    // Load the previously selected theme.
    let savedTheme = "dark";

    try {
        savedTheme = localStorage.getItem("mccc-theme") || "dark";
    } catch (error) {
        console.warn("Theme storage unavailable:", error);
    }

    applyTheme(savedTheme);

    // Open or close the dropdown.
    themeButton.addEventListener("click", (event) => {
        event.stopPropagation();

        const isOpening = themeMenu.hidden;

        themeMenu.hidden = !isOpening;
        themeButton.setAttribute(
            "aria-expanded",
            String(isOpening)
        );
    });

    // Handle theme selection.
    const themeOptions = document.querySelectorAll(
        "[data-theme-choice]"
    );

    themeOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const selectedTheme = option.dataset.themeChoice;

            applyTheme(selectedTheme);

            try {
                localStorage.setItem(
                    "mccc-theme",
                    selectedTheme
                );
            } catch (error) {
                console.warn("Could not save theme:", error);
            }

            themeMenu.hidden = true;
            themeButton.setAttribute(
                "aria-expanded",
                "false"
            );
        });
    });

    // Close the dropdown when clicking elsewhere.
    document.addEventListener("click", (event) => {
        if (!event.target.closest(".theme-dropdown")) {
            themeMenu.hidden = true;
            themeButton.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    });

    // Close with Escape.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            themeMenu.hidden = true;
            themeButton.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    });

    // Update when the system theme changes.
    const systemTheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );

    systemTheme.addEventListener("change", () => {
        let currentTheme = "dark";

        try {
            currentTheme =
                localStorage.getItem("mccc-theme") || "dark";
        } catch (error) {
            // Continue with the default.
        }

        if (currentTheme === "system") {
            applyTheme("system");
        }
    });
}

function applyTheme(theme) {
    let resolvedTheme = theme;

    if (theme === "system") {
        resolvedTheme = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches ? "dark" : "light";
    }

    document.documentElement.setAttribute(
        "data-theme",
        resolvedTheme
    );
}


/* ==========================================
   2. PLAYER SEARCH
   Homepage + Navigation Bar
   ========================================== */

function setupPlayerSearch() {

    // Collect every player from the event data.
    function getPlayers() {
        const playerNames = new Map();

        // Include players from all recorded MCCC events.
        (window.MCCC_EVENTS || []).forEach(event => {
            (event.teams || []).forEach(team => {
                (team.players || []).forEach(name => {
                    if (typeof name === "string" && name.trim()) {
                        const cleanName = name.trim();
                        const key = cleanName.toLowerCase();

                        if (!playerNames.has(key)) {
                            playerNames.set(key, cleanName);
                        }
                    }
                });
            });
        });

        // Also support a separate player list if one exists.
        (window.MCCC_PLAYERS || []).forEach(player => {
            const name = typeof player === "string"
                ? player
                : player?.name;

            if (typeof name === "string" && name.trim()) {
                const cleanName = name.trim();
                const key = cleanName.toLowerCase();

                if (!playerNames.has(key)) {
                    playerNames.set(key, cleanName);
                }
            }
        });

        return [...playerNames.values()];
    }

    // Set up one search field and its own results panel.
    function initialiseSearch(inputId, resultsId, containerSelector) {

        const searchInput = document.getElementById(inputId);
        const searchResults = document.getElementById(resultsId);

        if (!searchInput || !searchResults) return;

        function closeResults() {
            searchResults.hidden = true;
            searchResults.replaceChildren();
        }

        function createPlayerResult(playerName) {
            const link = document.createElement("a");

            link.className = "search-result";
            link.href =
                "player.html?name=" +
                encodeURIComponent(playerName);

            const avatar = document.createElement("img");

const username = playerName.toLowerCase();

const size = [
    "creep1et",
    "wailed_burrito61",
    "froopyloopidy",
    "fennecfox1247",
    "voidvvy"
].includes(username) ? 64 : 32;

avatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(username)}/${size}`;

            avatar.alt = "";
            avatar.loading = "lazy";

            const name = document.createElement("span");
            name.textContent = playerName;

            link.append(avatar, name);

            return link;
        }

        function updateResults() {
            const query = searchInput.value.trim().toLowerCase();

            searchResults.replaceChildren();

            if (!query) {
                closeResults();
                return;
            }

            const matchingPlayers = getPlayers()
                .filter(name => name.toLowerCase().includes(query))
                .sort((a, b) => {
                    const aStarts = a.toLowerCase().startsWith(query);
                    const bStarts = b.toLowerCase().startsWith(query);

                    if (aStarts !== bStarts) {
                        return aStarts ? -1 : 1;
                    }

                    return a.localeCompare(b);
                })
                .slice(0, 10);

            if (matchingPlayers.length === 0) {
                const noResults = document.createElement("div");

                noResults.className = "search-result";
                noResults.textContent = "No results found";

                searchResults.appendChild(noResults);
            } else {
                matchingPlayers.forEach(name => {
                    searchResults.appendChild(
                        createPlayerResult(name)
                    );
                });
            }

            searchResults.hidden = false;
        }

        // Update suggestions while typing.
        searchInput.addEventListener("input", updateResults);

        // Reopen suggestions when focused.
        searchInput.addEventListener("focus", () => {
            if (searchInput.value.trim()) {
                updateResults();
            }
        });

        // Keyboard controls.
        searchInput.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeResults();
                searchInput.blur();
                return;
            }

            if (event.key === "Enter") {
                const firstResult = searchResults.querySelector(
                    "a.search-result"
                );

                if (firstResult) {
                    window.location.href = firstResult.href;
                }
            }
        });

        // Close when clicking outside this particular search.
        document.addEventListener("click", event => {
            if (!event.target.closest(containerSelector)) {
                closeResults();
            }
        });
    }

    // Homepage hero search.
    initialiseSearch(
        "player-search",
        "player-search-results",
        ".search-container"
    );

    // Navigation bar search.
    initialiseSearch(
        "navbar-player-search",
        "navbar-search-results",
        ".navbar-search"
    );
}

/* ==========================================
   3. NEXT EVENT TEAMS
   ========================================== */

function setupNextEventTeams() {
    const grid = document.getElementById("event-team-grid");
    const projection = window.MCCC_PROJECTION;

    if (!grid || !projection) return;

    grid.replaceChildren();

    const specialHeads = [
        "creep1et",
        "wailed_burrito61",
        "froopyloopidy",
        "fennecfox1247",
        "voidvvy"
    ];

    projection.teams.forEach(team => {
        // Create team card.
        const card = document.createElement("div");
        card.className = `team-card ${team.id}-team`;

        // Use the team colour from data.js.
        card.style.backgroundColor = `${team.color}18`;

        // Team header.
        const header = document.createElement("div");
        header.className = "team-card-header";

        const icon = document.createElement("img");
        icon.src = team.icon || `assets/teams/${team.id}.webp`;
        icon.alt = team.name;
        icon.className = "team-icon";
        icon.onerror = () => {
            icon.style.display = "none";
        };

        const title = document.createElement("h3");
        title.textContent = team.name;

        header.append(icon, title);

        // Divider.
        const divider = document.createElement("div");
        divider.className = "team-divider";

        // Player list.
        const playerList = document.createElement("div");
        playerList.className = "team-players";

        team.players.forEach(playerName => {
            const link = document.createElement("a");
            link.className = "team-player";

            const isNewcomer = Object.keys(
                projection.newcomers || {}
            ).some(name =>
                name.toLowerCase() === playerName.toLowerCase()
            );

            if (isNewcomer) {
                // Newcomers don't have official stats pages yet.
                link.removeAttribute("href");
            } else {
                link.href =
                    "player.html?name=" +
                    encodeURIComponent(playerName);
            }

            const avatar = document.createElement("img");
            const username = playerName.toLowerCase();

            const size = specialHeads.includes(username) ? 64 : 32;

            avatar.src =
                `https://mc-heads.net/avatar/${encodeURIComponent(username)}/${size}`;

            avatar.alt = "";
            avatar.loading = "lazy";

            const name = document.createElement("span");
            name.textContent = playerName;

            link.append(avatar, name);
            playerList.appendChild(link);
        });

        card.append(header, divider, playerList);
        grid.appendChild(card);
    });
}


/* Mobile navigation */

document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".site-header .navbar");
    const navLinks = navbar?.querySelector(".navbar-end");

    if (!navbar || !navLinks || navbar.querySelector(".mobile-nav-toggle")) {
        return;
    }

    const toggle = document.createElement("button");

    toggle.type = "button";
    toggle.className = "mobile-nav-toggle";
    toggle.textContent = "☰";
    toggle.setAttribute("aria-label", "Toggle navigation");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "mobile-nav-links");

    navLinks.id = "mobile-nav-links";
    navbar.appendChild(toggle);

    toggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("is-open");

        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.textContent = isOpen ? "✕" : "☰";
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.textContent = "☰";
        });
    });
});
