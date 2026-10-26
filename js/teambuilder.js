
/* =========================================
   MCCC TEAM BUILDER
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       SETUP
       ========================================= */

    const $ = id => document.getElementById(id);

    const events = window.MCCC_EVENTS || [];
    const games = window.MCCC_GAMES || [];

    const KEY = 'mccc-team-builder-v1';

    const colours = [
        ['Red', '#f35d60', 'red'],
        ['Orange', '#f5a33b', 'orange'],
        ['Yellow', '#f2d14c', 'yellow'],
        ['Lime', '#83cf5c', 'lime'],
        ['Green', '#30b45d', 'green'],
        ['Cyan', '#37bdd1', 'cyan'],
        ['Aqua', '#55d0d7', 'aqua'],
        ['Blue', '#4787ed', 'blue'],
        ['Purple', '#a06ee0', 'purple'],
        ['Pink', '#ef82ba', 'pink']
    ];

    const defaultColours = [
        'Red', 'Orange', 'Yellow', 'Lime',
        'Aqua', 'Blue', 'Purple', 'Pink'
    ];

    const state = {
        teams: [],
        roster: [],
        guests: {},
        together: [],
        apart: [],
        results: []
    };

    const norm = value =>
        String(value ?? '').trim().toLowerCase();

    const fmt = value =>
        Math.round(value).toLocaleString('en-IE');

    const size = () => Number($('tb-size').value);
    
    function sortPlayers(players) {
        const mode = $('tb-sort').value;

        return [...players].sort((a, b) => {
            if (mode === 'alphabetical') {
                return a.localeCompare(b);
            }

            return score(b) - score(a) ||
                   a.localeCompare(b);
        });
    }


    const capacity = () =>
        state.teams.length * size();

    const canon = event =>
        event.noncanon !== true && event.canon !== false;

    const gameId = game =>
        typeof game === 'string' ? game : game?.id;


let notificationTimeout;
let notificationFadeTimeout;

function notify(message) {
    const element = $('tb-message');

    clearTimeout(notificationTimeout);
    clearTimeout(notificationFadeTimeout);

    // Reset and restart the entrance animation.
    element.classList.remove('tb-toast-hide');
    element.textContent = message;

    element.style.animation = 'none';
    void element.offsetWidth;
    element.style.animation = '';

    // Begin fading after 3 seconds.
    notificationTimeout = setTimeout(() => {
        element.classList.add('tb-toast-hide');

        // Clear the message after the fade finishes.
        notificationFadeTimeout = setTimeout(() => {
            element.textContent = '';
            element.classList.remove('tb-toast-hide');
        }, 600);

    }, 3000);
}




    /* =========================================
       PLAYER DATABASE
       ========================================= */

    const known = new Map();

    events.forEach(event => {
        (event.teams || []).forEach(team => {
            (team.players || []).forEach(name => {
                known.set(norm(name), name);
            });
        });
    });

    const special = new Set([
        'creep1et',
        'fennecfox1247',
        'wailed_burrito61',
        'froopyloopidy',
        'sacred_bean'
    ]);

    function avatar(name) {
        const username = norm(name);
        const resolution = special.has(username) ? 64 : 32;

        return `https://mc-heads.net/avatar/${encodeURIComponent(username)}/${resolution}`;
    }

    function face(name) {
        const image = document.createElement('img');

        image.src = avatar(name);
        image.alt = '';
        image.loading = 'lazy';

        image.onerror = () => {
            image.style.visibility = 'hidden';
        };

        return image;
    }


    /* =========================================
       PLAYER SCORES
       ========================================= */

    function participation(event, name) {
        return Object.entries(event.participation || {})
            .find(([player]) => norm(player) === norm(name))?.[1];
    }

    function complete(event, name) {
        const played = participation(event, name);

        return !played || (
            played.length === (event.games || []).length &&
            played.every(Boolean)
        );
    }

    function scoresFor(event, name) {
        const key = Object.keys(event.scores || {})
            .find(player => norm(player) === norm(name));

        return key ? event.scores[key] : null;
    }


    /* =========================================
       SCORE NORMALISATION
       ========================================= */

    const baseline = new Map();
    const factors = new Map();

    events.filter(canon).forEach(event => {
        (event.games || []).forEach((game, index) => {

            const key =
                `${(event.teams || []).length}:${gameId(game)}`;

            if (!baseline.has(key)) {
                baseline.set(key, {
                    sum: 0,
                    count: 0
                });
            }

            Object.entries(event.scores || {}).forEach(
                ([name, scores]) => {

                    if (
                        !complete(event, name) ||
                        !Number.isFinite(scores?.[index])
                    ) {
                        return;
                    }

                    const data = baseline.get(key);

                    data.sum += scores[index];
                    data.count++;
                }
            );
        });
    });

    games.forEach(game => {
        const reference = baseline.get(`5:${game.id}`);

        if (!reference?.count) {
            return;
        }

        for (const [key, data] of baseline) {
            const [, id] = key.split(':');

            if (
                id !== game.id ||
                !data.count ||
                !data.sum
            ) {
                continue;
            }

            const factor = game.id === 'hole_in_the_wall'
                ? 1
                : (reference.sum / reference.count) /
                  (data.sum / data.count);

            factors.set(key, factor);
        }
    });


    /* =========================================
       PLAYER AVERAGES
       ========================================= */

    function score(name) {
        const key = norm(name);

        if (Object.hasOwn(state.guests, key)) {
            return Number(state.guests[key]) || 0;
        }

        const range = $('tb-range').value;
        const mode = $('tb-score').value;

        const eligible = [...events]
            .filter(event => {

                if (
                    !$('tb-noncanon').checked &&
                    !canon(event)
                ) {
                    return false;
                }

                if (range === 's1' || range === 's2') {
                    const season = Number(
                        event.season ??
                        (Number(event.id) <= 10 ? 1 : 2)
                    );

                    return season === Number(range[1]);
                }

                return true;
            })
            .sort((a, b) => Number(b.id) - Number(a.id));

        const values = [];

        for (const event of eligible) {
            if (
                !$('tb-incomplete').checked &&
                !complete(event, name)
            ) {
                continue;
            }

            const playerScores = scoresFor(event, name);

            if (!Array.isArray(playerScores)) {
                continue;
            }

            const total = (event.games || []).reduce(
                (sum, game, index) => {

                    const points =
                        Number(playerScores[index]) || 0;

                    const factor =
                        mode === 'normalized' &&
                        event.teams?.length !== 5
                            ? factors.get(
                                `${event.teams?.length}:${gameId(game)}`
                              ) ?? 1
                            : 1;

                    return sum + points * factor;
                },
                0
            );

            values.push(total);

            if (
                /^\d+$/.test(range) &&
                values.length >= Number(range)
            ) {
                break;
            }
        }

        return values.length
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0;
    }


    /* =========================================
       TEAMS AND ROSTER
       ========================================= */

    function initTeams(count) {
        state.teams = Array.from(
            { length: count },
            (_, index) => {

                const colour = colours.find(
                    item => item[0] === defaultColours[index]
                ) || colours[0];

                return {
                    name: `${colour[0]} Team`,
                    color: colour[1],
                    players: []
                };
            }
        );
    }

    function inRoster(name) {
        return state.roster.some(
            player => norm(player) === norm(name)
        );
    }

    function teamOf(name) {
        return state.teams.findIndex(team =>
            team.players.some(
                player => norm(player) === norm(name)
            )
        );
    }

    function cleanupRules() {
        state.together = state.together.filter(
            ([a, b]) => inRoster(a) && inRoster(b)
        );

        state.apart = state.apart.filter(
            ([a, b]) => inRoster(a) && inRoster(b)
        );
    }

    function addPlayer(name, guest = false) {
        name = String(name || '').trim();

        if (!name) {
            return;
        }

        if (inRoster(name)) {
            notify(`${name} is already selected.`);
            return;
        }

        if (state.roster.length >= capacity()) {
            notify('Roster is full. Increase team capacity first.');
            return;
        }

        if (guest) {
            if (known.has(norm(name))) {
                notify('Player is in the database. Use search instead.');
                return;
            }

            state.guests[norm(name)] = Math.max(
                0,
                Number($('tb-guest-score').value) || 0
            );
        }

        state.roster.push(known.get(norm(name)) || name);

        $('tb-guest-name').value = '';

        notify(`${name} added.`);

        render();
    }

    function removePlayer(name) {
        state.roster = state.roster.filter(
            player => norm(player) !== norm(name)
        );

        state.teams.forEach(team => {
            team.players = team.players.filter(
                player => norm(player) !== norm(name)
            );
        });

        delete state.guests[norm(name)];

        cleanupRules();

        state.results = [];

        render();
    }


    /* =========================================
       MOVE AND SWAP PLAYERS
       ========================================= */

    function move(name, target) {
        if (!inRoster(name)) {
            return;
        }

        const from = teamOf(name);
        const to = Number(target);

        if (from === to) {
            return;
        }

        if (
            to >= 0 &&
            (
                !state.teams[to] ||
                state.teams[to].players.length >= size()
            )
        ) {
            notify('Team full. Drop onto another player to swap.');
            return;
        }

        if (from >= 0) {
            state.teams[from].players =
                state.teams[from].players.filter(
                    player => norm(player) !== norm(name)
                );
        }

        
        if (to >= 0) {
            state.teams[to].players.push(name);
        }

        state.results = [];

        render();

        const grid = $('tb-team-grid');

        grid.classList.remove('tb-animate');
        void grid.offsetWidth;
        grid.classList.add('tb-animate');
    }


    function swap(a, b) {
        if (
            !inRoster(a) ||
            !inRoster(b) ||
            norm(a) === norm(b)
        ) {
            return;
        }

        const teamA = teamOf(a);
        const teamB = teamOf(b);

        if (teamA < 0 && teamB < 0) {
            return;
        }

        if (teamA < 0 || teamB < 0) {
            const teamIndex = teamA >= 0 ? teamA : teamB;
            const outgoing = teamA >= 0 ? a : b;
            const incoming = teamA < 0 ? a : b;

            const index = state.teams[teamIndex].players.findIndex(
                player => norm(player) === norm(outgoing)
            );

            state.teams[teamIndex].players[index] = incoming;
        } else {
            const indexA = state.teams[teamA].players.findIndex(
                player => norm(player) === norm(a)
            );

            const indexB = state.teams[teamB].players.findIndex(
                player => norm(player) === norm(b)
            );

            [
                state.teams[teamA].players[indexA],
                state.teams[teamB].players[indexB]
            ] = [
                state.teams[teamB].players[indexB],
                state.teams[teamA].players[indexA]
            ];
        }

        
        state.results = [];

        render();

        const grid = $('tb-team-grid');

        grid.classList.remove('tb-animate');
        void grid.offsetWidth;
        grid.classList.add('tb-animate');
    }


    /* =========================================
       PLAYER CARDS
       ========================================= */


    function coins(name) {
        const element = document.createElement('span');

        element.className = 'tb-person-score';
        element.textContent = fmt(score(name));

        const icon = document.createElement('img');

        icon.src = 'assets/stats/coin.webp';
        icon.alt = '';
        icon.className = 'tb-coin-icon';

        element.append(' ', icon);

        return element;
    }

    function person(name, assigned = false) {
        const element = document.createElement('div');

        element.className = 'tb-person';
        element.draggable = true;

        element.addEventListener('dragstart', event => {
            event.dataTransfer.setData('text/plain', name);
            event.dataTransfer.effectAllowed = 'move';
        });

        element.addEventListener('dragover', event => {
            event.preventDefault();
            event.stopPropagation();

            element.classList.add('tb-over');
        });

        element.addEventListener('dragleave', () => {
            element.classList.remove('tb-over');
        });

        element.addEventListener('drop', event => {
            event.preventDefault();
            event.stopPropagation();

            element.classList.remove('tb-over');

            const dragged =
                event.dataTransfer.getData('text/plain');

            if (dragged) {
                swap(dragged, name);
            }
        });

        const label = document.createElement('span');

        label.className = 'tb-person-name';
        label.textContent = name;

        element.append(face(name), label, coins(name));

        if (!assigned) {
            const remove = document.createElement('button');

            remove.type = 'button';
            remove.textContent = '×';
            remove.title = `Remove ${name}`;
            remove.onclick = () => removePlayer(name);

            element.append(remove);
        }

        return element;
    }


    /* =========================================
       DRAG AND DROP
       ========================================= */

    function zone(element, index) {
        element.addEventListener('dragover', event => {
            event.preventDefault();
            element.classList.add('tb-over');
        });

        element.addEventListener('dragleave', () => {
            element.classList.remove('tb-over');
        });

        element.addEventListener('drop', event => {
            event.preventDefault();
            element.classList.remove('tb-over');

            const name =
                event.dataTransfer.getData('text/plain');

            if (name) {
                move(name, index);
            }
        });
    }

    zone($('tb-pool-list'), -1);


    /* =========================================
       AUTO-SCROLL WHILE DRAGGING
       ========================================= */

    let scrollDir = 0;
    let scrollFrame = null;

    function scrollStep() {
        if (!scrollDir) {
            scrollFrame = null;
            return;
        }

        window.scrollBy(0, scrollDir * 12);

        scrollFrame = requestAnimationFrame(scrollStep);
    }

    document.addEventListener('dragover', event => {
        scrollDir =
            event.clientY < 110
                ? -1
                : event.clientY > window.innerHeight - 110
                    ? 1
                    : 0;

        if (scrollDir && !scrollFrame) {
            scrollFrame = requestAnimationFrame(scrollStep);
        }
    });

    function stopScroll() {
        scrollDir = 0;

        if (scrollFrame) {
            cancelAnimationFrame(scrollFrame);
        }

        scrollFrame = null;
    }

    document.addEventListener('drop', stopScroll);
    document.addEventListener('dragend', stopScroll);


    /* =========================================
       PLAYER SEARCH
       ========================================= */

    let searchOpen = false;

    function renderSearch() {
        const root = $('tb-search-results');

        root.replaceChildren();

        if (!searchOpen) {
            return;
        }

        const query = norm($('tb-search').value);

        
        const players = sortPlayers(
            [...known.values()].filter(name =>
                norm(name).includes(query) &&
                !inRoster(name)
            )
        );

        players.forEach(name => {
            const row = document.createElement('div');
            row.className = 'tb-person';

            const label = document.createElement('span');
            label.className = 'tb-person-name';
            label.textContent = name;

            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Add';

            button.onmousedown = event => {
                event.preventDefault();
            };

            button.onclick = () => addPlayer(name);

            row.append(
                face(name),
                label,
                coins(name),
                button
            );

            root.append(row);
        });
    }


    /* =========================================
       ADVANCED BALANCING PANEL
       ========================================= */

    const advanced = document.createElement('section');

    advanced.className = 'tb-panel tb-advanced';

    advanced.innerHTML = `
        <div class="tb-advanced-heading">
            <h2>Advanced Balancing</h2>
            <span>Thorough balancing enabled</span>
        </div>

        <div class="tb-rule-grid">

            <div>
                <h3>Keep together</h3>

                <div class="tb-rule-inputs">
                    <div id="tb-together-a"></div>
                    <div id="tb-together-b"></div>

                    <button type="button" id="tb-add-together">
                        Add
                    </button>
                </div>

                <div id="tb-together-list"></div>
            </div>

            <div>
                <h3>Keep apart</h3>

                <div class="tb-rule-inputs">
                    <div id="tb-apart-a"></div>
                    <div id="tb-apart-b"></div>

                    <button type="button" id="tb-add-apart">
                        Add
                    </button>
                </div>

                <div id="tb-apart-list"></div>
            </div>

        </div>

        <p class="tb-muted tb-small">
            Choose two players to add a restriction.
            All restrictions are respected during balancing.
        </p>

        <div
            id="tb-advanced-results"
            class="tb-advanced-results"
        ></div>
    `;

    document.querySelector('.tb-toolbar').after(advanced);


    
    /* =========================================
       SEARCHABLE PLAYER ICON SELECTORS
       ========================================= */

    const pickers = new Map();

    function playerLabel(name) {
        const player = document.createElement('span');

        player.className = 'tb-rule-player';

        const image = face(name);
        image.className = 'tb-rule-avatar';

        const text = document.createElement('span');
        text.textContent = name;

        player.append(image, text);

        return player;
    }

    function createPlayerPicker(id) {
        const container = $(id);

        container.className = 'tb-rule-picker';

        const trigger = document.createElement('div');

        trigger.className = 'tb-rule-trigger';

        const selected = document.createElement('div');

        selected.className = 'tb-rule-selected';

        const search = document.createElement('input');

        search.type = 'text';
        search.className = 'tb-rule-search';
        search.placeholder = 'Select player';
        search.autocomplete = 'off';
        search.setAttribute('aria-label', 'Search players');
        search.setAttribute('aria-expanded', 'false');

        const arrow = document.createElement('span');

        arrow.className = 'tb-arrow';
        arrow.textContent = '▾';

        const menu = document.createElement('div');

        menu.className = 'tb-rule-menu';
        menu.hidden = true;

        selected.append(search);
        trigger.append(selected, arrow);
        container.append(trigger, menu);

        const picker = {
            value: '',
            container,
            trigger,
            selected,
            search,
            menu
        };

        pickers.set(id, picker);

        search.addEventListener('focus', () => {
            openPicker(id);
        });

        search.addEventListener('input', () => {
            picker.value = '';
            openPicker(id);
            filterPicker(id);
        });

        trigger.addEventListener('click', event => {
            if (event.target !== search) {
                search.focus();
            }
        });

        search.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closePickers();
                search.blur();
            }

            if (event.key === 'Enter') {
                event.preventDefault();

                const first = [...menu.querySelectorAll(
                    '.tb-rule-option'
                )].find(option => !option.hidden);

                if (first) {
                    first.click();
                }
            }
        });
    }

    function closePickers() {
        pickers.forEach(picker => {
            picker.menu.hidden = true;

            picker.search.setAttribute(
                'aria-expanded',
                'false'
            );
        });
    }

    function openPicker(id) {
        const picker = pickers.get(id);

        closePickers();

        picker.menu.hidden = false;

        picker.search.setAttribute(
            'aria-expanded',
            'true'
        );

        filterPicker(id);
    }

    function filterPicker(id) {
        const picker = pickers.get(id);

        const query = norm(picker.search.value);

        let visible = 0;

        picker.menu.querySelectorAll(
            '.tb-rule-option'
        ).forEach(option => {
            const matches = norm(option.dataset.player)
                .includes(query);

            option.hidden = !matches;

            if (matches) {
                visible++;
            }
        });

        let empty = picker.menu.querySelector(
            '.tb-rule-empty'
        );

        if (!empty) {
            empty = document.createElement('div');

            empty.className = 'tb-rule-empty';

            picker.menu.append(empty);
        }

        empty.textContent = state.roster.length
            ? 'No matching players.'
            : 'Add players to your roster first.';

        empty.hidden = visible > 0;
    }

    [
        'tb-together-a',
        'tb-together-b',
        'tb-apart-a',
        'tb-apart-b'
    ].forEach(createPlayerPicker);

    document.addEventListener('pointerdown', event => {
    const clickedInside = [...pickers.values()].some(
        picker => picker.container.contains(event.target)
    );

    if (!clickedInside) {
        closePickers();
    }
});

    function fillPicker(id) {
        const picker = pickers.get(id);

        if (!picker) {
            return;
        }

        const previous = picker.value;

        picker.value = state.roster.some(
            name => norm(name) === previous
        ) ? previous : '';

        // Keep the search input attached while updating the dropdown.
picker.selected.replaceChildren(picker.search);
picker.menu.replaceChildren();

        if (picker.value) {
            const name = state.roster.find(
                player => norm(player) === picker.value
            );

            const label = playerLabel(name);

            picker.selected.replaceChildren(label, picker.search);

picker.search.value = '';
picker.search.placeholder = '';
picker.search.style.display = 'none';

            label.addEventListener('click', () => {
                picker.value = '';

                picker.search.style.display = '';
                picker.search.placeholder = 'Select player';

                fillPicker(id);
                picker.search.focus();
            });
        } else {
            picker.search.style.display = '';
            picker.search.placeholder = 'Select player';

            picker.selected.append(picker.search);
        }

        state.roster
            .slice()
            .sort((a, b) => a.localeCompare(b))
            .forEach(name => {
                const option = document.createElement('button');

                option.type = 'button';
                option.className = 'tb-rule-option';
                option.dataset.player = name;

                option.append(playerLabel(name));

                option.addEventListener('pointerdown', event => {
    event.preventDefault();
});

option.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();

    picker.value = norm(name);
    picker.search.value = '';

    closePickers();
    fillPicker(id);
});

                picker.menu.append(option);
            });

        filterPicker(id);
    }

    function resetPicker(id) {
        const picker = pickers.get(id);

        picker.value = '';
        picker.search.value = '';

        fillPicker(id);
    }


    /* =========================================
       RESTRICTION DISPLAY
       ========================================= */

    function renderRuleList(type) {
        const root = $(`tb-${type}-list`);

        root.replaceChildren();

        state[type].forEach(([a, b], index) => {
            const row = document.createElement('div');

            row.className = 'tb-rule';

            const players = document.createElement('div');

            players.className = 'tb-rule-players';

            const nameA =
                state.roster.find(name => norm(name) === a) || a;

            const nameB =
                state.roster.find(name => norm(name) === b) || b;

            const separator = document.createElement('span');

            separator.className = 'tb-rule-separator';
            separator.textContent = type === 'together' ? '+' : '≠';

            players.append(
                playerLabel(nameA),
                separator,
                playerLabel(nameB)
            );

            const remove = document.createElement('button');

            remove.type = 'button';
            remove.textContent = '×';
            remove.title = 'Remove restriction';

            remove.onclick = () => {
                state[type].splice(index, 1);
                state.results = [];

                render();
            };

            row.append(players, remove);
            root.append(row);
        });
    }

    function renderRules() {
        ['together', 'apart'].forEach(type => {
            fillPicker(`tb-${type}-a`);
            fillPicker(`tb-${type}-b`);

            renderRuleList(type);
        });
    }

    function addRule(type) {
        const a = pickers.get(`tb-${type}-a`).value;
        const b = pickers.get(`tb-${type}-b`).value;

        if (!a || !b) {
            notify('Select two players first.');
            return;
        }

        if (a === b) {
            notify('Select two different players.');
            return;
        }

        const exists = state[type].some(
            pair => pair.includes(a) && pair.includes(b)
        );

        if (!exists) {
            state[type].push([a, b]);
        }

        resetPicker(`tb-${type}-a`);
        resetPicker(`tb-${type}-b`);

        state.results = [];

        notify(exists ? 'Restriction already exists.' : 'Restriction added.');

        render();
    }

    $('tb-add-together').onclick = () => addRule('together');
    $('tb-add-apart').onclick = () => addRule('apart');


    /* =========================================
       KEEP-TOGETHER GROUPS
       ========================================= */

    function buildGroups() {
        const parent = new Map(
            state.roster.map(name => [
                norm(name),
                norm(name)
            ])
        );

        function root(key) {
            while (parent.get(key) !== key) {
                key = parent.get(key);
            }

            return key;
        }

        state.together.forEach(([a, b]) => {
            if (parent.has(a) && parent.has(b)) {
                parent.set(root(a), root(b));
            }
        });

        const grouped = new Map();

        state.roster.forEach(name => {
            const key = root(norm(name));

            if (!grouped.has(key)) {
                grouped.set(key, []);
            }

            grouped.get(key).push(name);
        });

        return [...grouped.values()];
    }


    /* =========================================
       VALIDATE RESTRICTIONS
       ========================================= */

    function validateRules(groups) {
        if (state.roster.length !== capacity()) {
            return `Select exactly ${capacity()} players (${state.roster.length} selected).`;
        }

        if (groups.some(group => group.length > size())) {
            return 'A keep-together group exceeds the team size.';
        }

        for (const [a, b] of state.apart) {
            const conflict = groups.some(group =>
                group.some(name => norm(name) === a) &&
                group.some(name => norm(name) === b)
            );

            if (conflict) {
                return 'A keep-together rule conflicts with a keep-apart rule.';
            }
        }

        return null;
    }


    /* =========================================
       GENERATE TEAM ARRANGEMENT
       ========================================= */

    function candidate(groups, random) {
        const assigned = state.teams.map(() => []);
        const sums = assigned.map(() => 0);

        const target = state.roster.reduce(
            (sum, name) => sum + score(name),
            0
        ) / assigned.length;

        const apart = new Set(
            state.apart.flatMap(([a, b]) => [
                `${a}|${b}`,
                `${b}|${a}`
            ])
        );

        function legal(group, index) {
            return (
                assigned[index].length + group.length <= size() &&
                group.every(name =>
                    assigned[index].every(player =>
                        !apart.has(`${norm(name)}|${norm(player)}`)
                    )
                )
            );
        }

        const free = [...groups];

        free.sort((a, b) =>
            b.length - a.length ||
            b.reduce((sum, name) => sum + score(name), 0) -
            a.reduce((sum, name) => sum + score(name), 0)
        );

        if (random) {
            free.sort((a, b) =>
                b.length - a.length ||
                Math.random() - 0.5
            );
        }

        let nodes = 0;

        function place(remaining) {
            if (!remaining.length) {
                return true;
            }

            if (++nodes > 15000) {
                return false;
            }

            let pick = -1;
            let options = null;

            for (let index = 0; index < remaining.length; index++) {
                const available = assigned
                    .map((_, teamIndex) => teamIndex)
                    .filter(teamIndex =>
                        legal(remaining[index], teamIndex)
                    );

                if (!available.length) {
                    return false;
                }

                if (
                    !options ||
                    available.length < options.length
                ) {
                    options = available;
                    pick = index;

                    if (available.length === 1) {
                        break;
                    }
                }
            }

            const group = remaining[pick];

            const weight = group.reduce(
                (sum, name) => sum + score(name),
                0
            );

            options.sort((a, b) => {
                const differenceA =
                    Math.abs(sums[a] + weight - target);

                const differenceB =
                    Math.abs(sums[b] + weight - target);

                const variation = random
                    ? (Math.random() - 0.5) * target * 0.4
                    : 0;

                return differenceA - differenceB + variation;
            });

            const next = remaining.filter(
                (_, index) => index !== pick
            );

            for (const index of options) {
                assigned[index].push(...group);
                sums[index] += weight;

                if (place(next)) {
                    return true;
                }

                assigned[index].splice(
                    assigned[index].length - group.length,
                    group.length
                );

                sums[index] -= weight;
            }

            return false;
        }

        if (!place(free)) {
            return null;
        }

        return {
            teams: assigned,
            sums
        };
    }


    /* =========================================
       IMPROVE BALANCE THROUGH SWAPS
       ========================================= */

    function improve(result) {
        const apart = new Set(
            state.apart.flatMap(([a, b]) => [
                `${a}|${b}`,
                `${b}|${a}`
            ])
        );

        const groups = buildGroups();
        const groupOf = new Map();

        groups.forEach((group, index) => {
            group.forEach(name => {
                groupOf.set(norm(name), index);
            });
        });

        function spread() {
            return Math.max(...result.sums) -
                   Math.min(...result.sums);
        }

        for (let pass = 0; pass < 80; pass++) {
            let best = spread();
            let chosen = null;

            for (let a = 0; a < result.teams.length; a++) {
                for (let b = a + 1; b < result.teams.length; b++) {

                    const groupsA = [...new Set(
                        result.teams[a].map(
                            name => groupOf.get(norm(name))
                        )
                    )];

                    const groupsB = [...new Set(
                        result.teams[b].map(
                            name => groupOf.get(norm(name))
                        )
                    )];

                    for (const indexA of groupsA) {
                        for (const indexB of groupsB) {
                            const groupA = groups[indexA];
                            const groupB = groups[indexB];

                            if (groupA.length !== groupB.length) {
                                continue;
                            }

                            const left = result.teams[a].filter(
                                name => !groupA.some(
                                    player => norm(player) === norm(name)
                                )
                            );

                            const right = result.teams[b].filter(
                                name => !groupB.some(
                                    player => norm(player) === norm(name)
                                )
                            );

                            const invalidLeft = groupB.some(name =>
                                left.some(player =>
                                    apart.has(
                                        `${norm(name)}|${norm(player)}`
                                    )
                                )
                            );

                            const invalidRight = groupA.some(name =>
                                right.some(player =>
                                    apart.has(
                                        `${norm(name)}|${norm(player)}`
                                    )
                                )
                            );

                            if (invalidLeft || invalidRight) {
                                continue;
                            }

                            const delta =
                                groupB.reduce(
                                    (sum, name) => sum + score(name),
                                    0
                                ) -
                                groupA.reduce(
                                    (sum, name) => sum + score(name),
                                    0
                                );

                            const next = result.sums.map(
                                (value, index) => {
                                    if (index === a) {
                                        return value + delta;
                                    }

                                    if (index === b) {
                                        return value - delta;
                                    }

                                    return value;
                                }
                            );

                            const width =
                                Math.max(...next) - Math.min(...next);

                            if (width < best - 0.00001) {
                                best = width;

                                chosen = {
                                    a,
                                    b,
                                    groupA,
                                    groupB,
                                    delta
                                };
                            }
                        }
                    }
                }
            }

            if (!chosen) {
                break;
            }

            const {
                a,
                b,
                groupA,
                groupB,
                delta
            } = chosen;

            result.teams[a] = result.teams[a]
                .filter(name =>
                    !groupA.some(
                        player => norm(player) === norm(name)
                    )
                )
                .concat(groupB);

            result.teams[b] = result.teams[b]
                .filter(name =>
                    !groupB.some(
                        player => norm(player) === norm(name)
                    )
                )
                .concat(groupA);

            result.sums[a] += delta;
            result.sums[b] -= delta;
        }

        return result;
    }


    
    /* =========================================
       THOROUGH AUTO BALANCE
       ========================================= */

    const DEFAULT_MS_PER_ATTEMPT = 16;

    let msPerAttempt = DEFAULT_MS_PER_ATTEMPT;
    let isBalancing = false;

    /* =========================================
       BALANCING TIME ESTIMATES
       ========================================= */

    function formatBalanceTime(milliseconds) {
        const seconds = Math.max(
            0,
            Math.ceil(milliseconds / 1000)
        );

        if (seconds < 60) {
            return `${seconds}s`;
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes < 60) {
            return `${minutes}m ${remainingSeconds}s`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        return `${hours}h ${remainingMinutes}m`;
    }

    function updateTimeEstimate() {
        const attempts = Number($('tb-attempts').value);

        const estimatedTime = attempts * msPerAttempt;

        $('tb-time-estimate').textContent =
            `Estimated: ~${formatBalanceTime(estimatedTime)}`;
    }


    /* =========================================
       BALANCING PROGRESS
       ========================================= */

    function updateBalanceProgress(percent, message) {
        const progress = $('tb-balance-progress');

        progress.hidden = false;

        $('tb-progress-fill').style.width = `${percent}%`;
        $('tb-progress-percent').textContent = `${percent}%`;
        $('tb-progress-label').textContent = message;

        const progressbar = progress.querySelector(
            '[role="progressbar"]'
        );

        if (progressbar) {
            progressbar.setAttribute(
                'aria-valuenow',
                String(percent)
            );
        }
    }

    function waitForPaint() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                setTimeout(resolve, 0);
            });
        });
    }


    /* =========================================
       RUN AUTO BALANCE
       ========================================= */

    async function balance() {
        if (isBalancing) {
            return;
        }

        cleanupRules();

        const groups = buildGroups();
        const problem = validateRules(groups);

        if (problem) {
            notify(problem);
            return;
        }

        const attempts = Number($('tb-attempts').value);

        if (!Number.isInteger(attempts) || attempts <= 0) {
            notify('Select a valid number of attempts.');
            return;
        }

        const button = $('tb-balance');
        const attemptsSelect = $('tb-attempts');

        isBalancing = true;

        button.disabled = true;
        button.classList.add('tb-balancing');
        button.textContent = 'Balancing...';

        attemptsSelect.disabled = true;

        state.results = [];

        updateBalanceProgress(
            0,
            `0 / ${attempts.toLocaleString()} attempts · Preparing...`
        );

        await waitForPaint();

        const found = new Map();
        const start = performance.now();

        let completed = 0;
        let lastUpdate = start;
        let succeeded = false;

        try {
            for (let index = 0; index < attempts; index++) {

                const result = candidate(groups, index !== 0);

                completed++;

                if (result) {
                    improve(result);

                    const key = result.teams
                        .map(team =>
                            team.map(norm).sort().join(',')
                        )
                        .sort()
                        .join('|');

                    const spread =
                        Math.max(...result.sums) -
                        Math.min(...result.sums);

                    if (
                        !found.has(key) ||
                        spread < found.get(key).spread
                    ) {
                        found.set(key, {
                            teams: result.teams.map(team => [...team]),
                            sums: [...result.sums],
                            spread
                        });
                    }
                }

                const now = performance.now();

                // Update the progress bar approximately every 100ms.
                if (
                    now - lastUpdate >= 100 ||
                    completed === attempts
                ) {
                    const percent = Math.min(
                        100,
                        Math.floor((completed / attempts) * 100)
                    );

                    // Calculate the actual average time per attempt.
                    const elapsed = now - start;
                    const currentMsPerAttempt = elapsed / completed;

                    // Smooth the estimated speed to prevent sudden jumps.
                    msPerAttempt =
                        msPerAttempt * 0.7 +
                        currentMsPerAttempt * 0.3;

                    const remainingAttempts = attempts - completed;

                    const remainingTime =
                        remainingAttempts * msPerAttempt;

                    const message =
                        `${completed.toLocaleString()} / ` +
                        `${attempts.toLocaleString()} attempts · ` +
                        `${found.size.toLocaleString()} arrangements · ` +
                        `~${formatBalanceTime(remainingTime)} remaining`;

                    updateBalanceProgress(percent, message);

                    lastUpdate = now;

                    // Give the browser time to redraw the interface.
                    if (completed < attempts) {
                        await waitForPaint();
                    }
                }
            }

            /* =========================================
               PROCESS RESULTS
               ========================================= */

            const all = [...found.values()]
                .sort((a, b) => a.spread - b.spread);

            if (!all.length) {
                notify(
                    'No valid arrangement found. Check restrictions.'
                );
            } else {
                state.results = all.slice(0, 5);

                applyResult(0);

                notify(
                    `${all.length} distinct arrangements found. ` +
                    `Showing up to five options.`
                );
            }

            succeeded = true;

            const totalTime = performance.now() - start;

            updateBalanceProgress(
                100,
                `Finished · ${completed.toLocaleString()} / ` +
                `${attempts.toLocaleString()} attempts · ` +
                `${formatBalanceTime(totalTime)} elapsed`
            );

        } catch (error) {
            console.error('Auto Balance failed:', error);

            notify(
                'Balancing failed. Check the console for details.'
            );

            $('tb-progress-label').textContent =
                `Stopped after ${completed.toLocaleString()} attempts.`;

        } finally {
            const totalTime = performance.now() - start;

            if (completed > 0) {
                msPerAttempt = totalTime / completed;
            }

            isBalancing = false;

            button.disabled = false;
            button.classList.remove('tb-balancing');
            button.textContent = 'Auto Balance';

            attemptsSelect.disabled = false;

            updateTimeEstimate();

            if (!succeeded) {
                const percent = Math.floor(
                    (completed / attempts) * 100
                );

                $('tb-progress-percent').textContent =
                    `${percent}%`;
            }
        }
    }

    
    function applyResult(index) {
        const result = state.results[index];

        if (!result) {
            return;
        }

        state.teams.forEach((team, teamIndex) => {
            team.players = [...result.teams[teamIndex]];
        });

        render();

        // Animate the newly generated team arrangement.
        const grid = $('tb-team-grid');

        grid.classList.remove('tb-animate');

        // Restart the animation when switching results.
        void grid.offsetWidth;

        grid.classList.add('tb-animate');
    }


    function renderResults() {
        const root = $('tb-advanced-results');

        root.replaceChildren();

        if (!state.results.length) {
            return;
        }

        const title = document.createElement('h3');
        title.textContent = 'Balancing results';

        root.append(title);

        const list = document.createElement('div');
        list.className = 'tb-result-options';

        state.results.forEach((result, index) => {
            const button = document.createElement('button');

            button.type = 'button';
            button.textContent =
                `Option ${index + 1} · ${fmt(result.spread)} spread`;

            button.onclick = () => {
                applyResult(index);
                notify(`Applied option ${index + 1}.`);
            };

            list.append(button);
        });

        root.append(list);
    }


    /* =========================================
       RENDER TEAM BUILDER
       ========================================= */

    function render() {
        const totalCapacity = capacity();

        $('tb-roster-count').textContent =
            `${state.roster.length} / ${totalCapacity}`;

        const pool = $('tb-pool-list');

        pool.replaceChildren();

        
        sortPlayers(
            state.roster.filter(name => teamOf(name) < 0)
        ).forEach(name => pool.append(person(name)));


        const grid = $('tb-team-grid');

        grid.replaceChildren();

        const totals = [];
        let filled = 0;

        state.teams.forEach((team, index) => {
            const card = document.createElement('article');

            card.className = 'tb-team';

            card.style.setProperty(
                '--team-color',
                team.color
            );

            zone(card, index);

            /* Team Header */

            const header = document.createElement('div');
            header.className = 'tb-team-header';

            const logo = document.createElement('img');
            logo.alt = '';

            function updateLogo() {
                const colour = colours.find(
                    item => item[1] === team.color
                ) || colours[0];

                logo.src = `assets/teams/${colour[2]}.webp`;
            }

            logo.onerror = () => {
                logo.style.visibility = 'hidden';
            };

            updateLogo();

            const name = document.createElement('input');

            name.value = team.name;

            name.setAttribute(
                'aria-label',
                `Team ${index + 1} name`
            );

            name.oninput = () => {
                team.name = name.value;
            };

            const selector = document.createElement('select');

            selector.className = 'tb-colour-select';

            selector.setAttribute(
                'aria-label',
                `Team ${index + 1} colour`
            );

            colours.forEach(colour => {
                const option = document.createElement('option');

                option.value = colour[1];
                option.textContent = colour[0];

                selector.append(option);
            });

            selector.value = team.color;

            selector.onchange = () => {
                const oldColour = colours.find(
                    item => item[1] === team.color
                );

                const newColour = colours.find(
                    item => item[1] === selector.value
                );

                if (!newColour) {
                    return;
                }

                if (team.name === `${oldColour?.[0]} Team`) {
                    team.name = `${newColour[0]} Team`;
                }

                team.color = newColour[1];
                name.value = team.name;

                card.style.setProperty(
                    '--team-color',
                    team.color
                );

                logo.style.visibility = 'visible';

                updateLogo();
            };

            header.append(logo, name, selector);
            card.append(header);

            /* Player Slots */

            for (let slot = 0; slot < size(); slot++) {
                const wrapper = document.createElement('div');

                wrapper.className = 'tb-team-slot';

                if (team.players[slot]) {
                    wrapper.append(
                        person(team.players[slot], true)
                    );
                } else {
                    wrapper.classList.add('tb-empty');
                    wrapper.textContent = '+ Empty slot';
                }

                card.append(wrapper);
            }

            /* Team Total */

            const total = team.players.reduce(
                (sum, player) => sum + score(player),
                0
            );

            totals.push(total);
            filled += team.players.length;

            const footer = document.createElement('div');
            footer.className = 'tb-team-total';

            const label = document.createElement('span');

            label.textContent =
                `${team.players.length} / ${size()} players`;

            const value = document.createElement('strong');
            value.textContent = fmt(total);

            footer.append(label, value);
            card.append(footer);

            grid.append(card);
        });

        $('tb-filled').textContent =
            `${filled} / ${totalCapacity}`;

        $('tb-spread').textContent =
            filled === totalCapacity
                ? fmt(Math.max(...totals) - Math.min(...totals))
                : '—';

        $('tb-average').textContent =
            state.roster.length === totalCapacity
                ? fmt(
                    state.roster.reduce(
                        (sum, player) => sum + score(player),
                        0
                    ) / state.teams.length
                  )
                : '—';

        renderSearch();
        renderRules();
        renderResults();
    }


    /* =========================================
       CHANGE TEAM FORMAT
       ========================================= */

    function changeFormat() {
        const count = Number($('tb-count').value);
        const newSize = size();

        const oldTeams = state.teams;
        const overflow = [];

        initTeams(count);

        oldTeams.forEach((team, index) => {
            if (index < count) {
                state.teams[index].name = team.name;
                state.teams[index].color = team.color;

                state.teams[index].players =
                    team.players.slice(0, newSize);

                overflow.push(...team.players.slice(newSize));
            } else {
                overflow.push(...team.players);
            }
        });

        cleanupRules();

        state.results = [];

        notify(
            overflow.length
                ? `${overflow.length} player(s) returned to pool.`
                : 'Team format updated.'
        );

        render();
    }


    /* =========================================
       EVENT LISTENERS
       ========================================= */

    $('tb-search').addEventListener('focus', () => {
        searchOpen = true;
        renderSearch();
    });

    $('tb-search').addEventListener('input', () => {
        searchOpen = true;
        renderSearch();
    });

    document.addEventListener('pointerdown', event => {
        if (
            !$('tb-search').contains(event.target) &&
            !$('tb-search-results').contains(event.target)
        ) {
            searchOpen = false;
            renderSearch();
        }
    });

    $('tb-add-guest').onclick = () => {
        addPlayer($('tb-guest-name').value, true);
    };

    $('tb-guest-name').addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            addPlayer(event.target.value, true);
        }
    });

    
    $('tb-count').addEventListener('change', changeFormat);
    $('tb-size').addEventListener('change', changeFormat);

    $('tb-sort').addEventListener('change', render);

    // Update estimated duration when attempt count changes.
    $('tb-attempts').addEventListener(
        'change',
        updateTimeEstimate
    );

    // Display the initial estimate.
    updateTimeEstimate();



    [
        'tb-range',
        'tb-score',
        'tb-noncanon',
        'tb-incomplete'
    ].forEach(id => {
        $(id).addEventListener('change', () => {
            state.results = [];
            render();
        });
    });

    $('tb-balance').onclick = balance;


    /* =========================================
       CLEAR AND RESET
       ========================================= */

    $('tb-clear').onclick = () => {
        state.teams.forEach(team => {
            team.players = [];
        });

        state.results = [];

        notify('Team assignments cleared; roster kept.');

        render();
    };

    $('tb-reset').onclick = () => {
        if (!confirm('Clear all players, teams and restrictions?')) {
            return;
        }

        state.roster = [];
        state.guests = {};
        state.together = [];
        state.apart = [];
        state.results = [];

        initTeams(Number($('tb-count').value));

        localStorage.removeItem(KEY);

        notify('Builder reset.');

        render();
    };


    /* =========================================
       SAVE IN BROWSER
       ========================================= */

    $('tb-save').onclick = () => {
        try {
            const data = {
                teams: state.teams,
                roster: state.roster,
                guests: state.guests,
                together: state.together,
                apart: state.apart,

                settings: {
                    count: $('tb-count').value,
                    size: $('tb-size').value,
                    range: $('tb-range').value,
                    score: $('tb-score').value,
                    noncanon: $('tb-noncanon').checked,
                    incomplete: $('tb-incomplete').checked
                }
            };

            localStorage.setItem(
                KEY,
                JSON.stringify(data)
            );

            notify('Saved in this browser.');
        } catch {
            notify('Unable to save.');
        }
    };


    /* =========================================
       COPY TEAMS
       ========================================= */

    $('tb-export').onclick = async () => {
        const output = state.teams.map(team => {
            const total = team.players.reduce(
                (sum, name) => sum + score(name),
                0
            );

            const players = team.players.map(
                name => `• ${name} (${fmt(score(name))})`
            );

            return (
                `${team.name} (${fmt(total)}):\n` +
                players.join('\n')
            );
        }).join('\n\n');

        try {
            await navigator.clipboard.writeText(output);

            notify('Teams copied.');
        } catch {
            const input = document.createElement('textarea');

            input.value = output;

            document.body.append(input);
            input.select();

            const success = document.execCommand('copy');

            input.remove();

            notify(
                success
                    ? 'Teams copied.'
                    : 'Could not copy teams.'
            );
        }
    };


    /* =========================================
       RESTORE SAVED DATA
       ========================================= */

    initTeams(5);

    try {
        const saved = JSON.parse(
            localStorage.getItem(KEY) || 'null'
        );

        if (
            Array.isArray(saved?.teams) &&
            Array.isArray(saved.roster)
        ) {
            const count = [4, 5, 6, 7, 8].includes(
                saved.teams.length
            )
                ? saved.teams.length
                : 5;

            const chosenSize = [2, 3, 4, 5, 6, 7, 8].includes(
                Number(saved.settings?.size)
            )
                ? Number(saved.settings.size)
                : 4;

            $('tb-count').value = String(count);
            $('tb-size').value = String(chosenSize);

            initTeams(count);

            state.roster = unique(saved.roster);
            state.guests = saved.guests || {};

            const used = new Set();

            saved.teams.slice(0, count).forEach(
                (team, index) => {
                    state.teams[index].name = String(
                        team.name || state.teams[index].name
                    );

                    if (
                        colours.some(
                            colour => colour[1] === team.color
                        )
                    ) {
                        state.teams[index].color = team.color;
                    }

                    state.teams[index].players =
                        (team.players || [])
                            .filter(name => {
                                const key = norm(name);

                                if (
                                    used.has(key) ||
                                    !inRoster(name)
                                ) {
                                    return false;
                                }

                                used.add(key);
                                return true;
                            })
                            .slice(0, chosenSize);
                }
            );

            state.together = Array.isArray(saved.together)
                ? saved.together
                : [];

            state.apart = Array.isArray(saved.apart)
                ? saved.apart
                : [];

            cleanupRules();

            const settings = saved.settings || {};

            if (
                ['1', '2', '3', '5', 's1', 's2', 'all']
                    .includes(settings.range)
            ) {
                $('tb-range').value = settings.range;
            }

            if (
                ['raw', 'normalized'].includes(settings.score)
            ) {
                $('tb-score').value = settings.score;
            }

            $('tb-noncanon').checked = !!settings.noncanon;
            $('tb-incomplete').checked = !!settings.incomplete;
        }
    } catch (error) {
        console.warn(
            'Could not restore Team Builder:',
            error
        );
    }


    /* =========================================
       INITIAL RENDER
       ========================================= */

    render();

});
