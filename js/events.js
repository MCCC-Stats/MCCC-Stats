/* MCCC Stats — Horizontal Event Archive */
document.addEventListener("DOMContentLoaded", () => {
    const archive = document.getElementById("events-grid");
    const filters = document.getElementById("events-filters");
    if (!archive || !filters || !Array.isArray(window.MCCC_EVENTS)) return;

    const events = [...window.MCCC_EVENTS].sort((a, b) => Number(b.id) - Number(a.id));
    let currentFilter = "all";

    function render() {
        archive.replaceChildren();
        filters.querySelectorAll("button[data-filter]").forEach(button => {
            const active = button.dataset.filter === currentFilter;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        const visible = events.filter(event => {
            if (currentFilter === "noncanon") return event.noncanon === true;
            if (currentFilter === "1" || currentFilter === "2") {
                return String(event.season ?? 1) === currentFilter && event.noncanon !== true;
            }
            return true;
        });

        if (!visible.length) {
            const empty = document.createElement("p");
            empty.className = "events-empty";
            empty.textContent = "No events available in this category.";
            archive.appendChild(empty);
            return;
        }

        // Group by season, newest season first. Non-canon events stay in their season.
        const seasons = [...new Set(visible.map(event => String(event.season ?? 1)))].sort((a, b) => Number(b) - Number(a));
        seasons.forEach(season => {
            const section = document.createElement("section");
            section.className = "events-season-section";
            const heading = document.createElement("h3");
            heading.className = "events-season-heading";
            const label = document.createElement("span");
            label.textContent = "SEASON " + season;
            heading.appendChild(label);
            const list = document.createElement("div");
            list.className = "events-rows";
            visible.filter(event => String(event.season ?? 1) === season)
                .forEach(event => list.appendChild(createEventRow(event)));
            section.append(heading, list);
            archive.appendChild(section);
        });
    }

    filters.addEventListener("click", event => {
        const button = event.target.closest("button[data-filter]");
        if (!button || !filters.contains(button)) return;
        currentFilter = button.dataset.filter;
        render();
    });
    render();
});

function createEventRow(event) {
    const row = document.createElement("a");
    row.className = "event-archive-row";
    row.href = "event.html?id=" + encodeURIComponent(event.id);

    const number = document.createElement("span");
    number.className = "event-archive-number";
    const match = String(event.name || "").match(/^MCCC\s+(\d+)$/i);
    number.textContent = match ? match[1] : "★";
    number.setAttribute("aria-hidden", "true");

    const details = document.createElement("span");
    details.className = "event-archive-details";
    const titleLine = document.createElement("span");
    titleLine.className = "event-archive-title-line";
    const title = document.createElement("span");
    title.className = "event-archive-title";
    title.textContent = event.name || "Untitled event";
    titleLine.appendChild(title);
    if (event.noncanon === true) {
        const badge = document.createElement("span");
        badge.className = "event-archive-noncanon";
        badge.textContent = "NON-CANON";
        titleLine.appendChild(badge);
    }
    const subtitle = document.createElement("span");
    subtitle.className = "event-archive-subtitle";
    subtitle.textContent = event.date ? formatEventDate(event.date) : "Event results and statistics";
    details.append(titleLine, subtitle);

    const winnerBlock = document.createElement("span");
    winnerBlock.className = "event-archive-winner-block";
    const winnerLabel = document.createElement("span");
    winnerLabel.className = "event-archive-winner-label";
    winnerLabel.textContent = "WINNER";
    const winnerLine = document.createElement("span");
    winnerLine.className = "event-archive-winner-line";
    const winnerId = event.dodgebolt?.winner;
    let winnerTeam = winnerId && Array.isArray(event.teams)
        ? event.teams.find(team => String(team.id).toLowerCase() === String(winnerId).toLowerCase())
        : null;

    // MCCC Scuffed: rank teams by their multiplied event scores rather than Dodgebolt.
    if (!winnerTeam && /scuffed/i.test(String(event.name)) && Array.isArray(event.teams)) {
        const teamTotal = team => {
            const playerScore = (team.players || []).reduce((sum, player) => {
                const scores = event.scores?.[player] || [];
                return sum + (event.games || []).reduce((subtotal, _, index) =>
                    subtotal + Number(scores[index] || 0) * Number(event.multipliers?.[index] ?? 1), 0);
            }, 0);
            const ghostScore = (event.ghostScores?.[team.id] || []).reduce((sum, score, index) =>
                sum + Number(score || 0) * Number(event.multipliers?.[index] ?? 1), 0);
            return playerScore + ghostScore;
        };
        if (event.teams.length && event.scores && event.games) {
            winnerTeam = [...event.teams].sort((a, b) => teamTotal(b) - teamTotal(a))[0];
            winnerLabel.textContent = "TOP SCORING TEAM";
        }
    }

    if (winnerTeam) {
        const icon = document.createElement("img");
        icon.className = "event-archive-winner-icon";
        icon.src = winnerTeam.icon || "assets/teams/" + winnerTeam.id + ".webp";
        icon.alt = "";
        icon.loading = "lazy";
        icon.onerror = () => { icon.style.display = "none"; };
        const name = document.createElement("span");
        name.textContent = winnerTeam.name || winnerTeam.id;
        winnerLine.append(icon, name);
    } else {
        winnerLine.classList.add("event-archive-pending");
        winnerLine.textContent = winnerId ? "Winner unavailable" : "Results pending";
    }
    winnerBlock.append(winnerLabel, winnerLine);

    const arrow = document.createElement("span");
    arrow.className = "event-archive-arrow";
    arrow.textContent = "›";
    arrow.setAttribute("aria-hidden", "true");
    row.append(number, details, winnerBlock, arrow);
    return row;
}

function formatEventDate(value) {
    const parts = String(value).split("-");
    if (parts.length !== 3) return String(value);
    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return String(value);
    return date.toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
}
