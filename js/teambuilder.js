
/* MCCC Team Builder */
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const events = window.MCCC_EVENTS || [];
  const games = window.MCCC_GAMES || [];
  const KEY = 'mccc-team-builder-v1';

  const teamColours = [
    { name: 'Red', hex: '#f35d60', icon: 'red' },
    { name: 'Orange', hex: '#f5a33b', icon: 'orange' },
    { name: 'Yellow', hex: '#f2d14c', icon: 'yellow' },
    { name: 'Lime', hex: '#83cf5c', icon: 'lime' },
    { name: 'Green', hex: '#30b45d', icon: 'green' },
    { name: 'Cyan', hex: '#37bdd1', icon: 'cyan' },
    { name: 'Aqua', hex: '#55d0d7', icon: 'aqua' },
    { name: 'Blue', hex: '#4787ed', icon: 'blue' },
    { name: 'Purple', hex: '#a06ee0', icon: 'purple' },
    { name: 'Pink', hex: '#ef82ba', icon: 'pink' }
  ];

  const defaults = [
    'Red', 'Orange', 'Yellow', 'Lime',
    'Aqua', 'Blue', 'Purple', 'Pink'
  ];

  const specialHeads = [
    'creep1et',
    'fennecfox1247',
    'wailed_burrito61',
    'froopyloopidy',
    'sacred_bean'
  ];

  const normalize = s => String(s).trim().toLowerCase();
  const fmt = n => Math.round(n).toLocaleString('en-IE');
  const isCanon = e => e.noncanon !== true && e.canon !== false;
  const gameId = g => typeof g === 'string' ? g : g.id;

  const state = {
    teams: [],
    roster: [],
    guests: {},
    currentSize: 4
  };

  const teamSize = () => Number($('tb-size').value);
  const capacity = () => state.teams.length * teamSize();

  const avatar = name => {
    const key = normalize(name);
    const size = specialHeads.includes(key) ? 64 : 32;
    return `https://mc-heads.net/avatar/${encodeURIComponent(key)}/${size}`;
  };

  function notify(message) {
    $('tb-message').textContent = message;
  }

  function full(event, name) {
    const participation = Object.entries(event.participation || {})
      .find(([n]) => normalize(n) === normalize(name))?.[1];

    return !participation || (
      participation.length === (event.games || []).length &&
      participation.every(Boolean)
    );
  }

  function getScores(event, name) {
    const key = Object.keys(event.scores || {})
      .find(n => normalize(n) === normalize(name));

    return key ? event.scores[key] : null;
  }

  const known = new Map();

  events.forEach(event => {
    (event.teams || []).forEach(team => {
      (team.players || []).forEach(name => {
        known.set(normalize(name), name);
      });
    });
  });

  // Historical score normalisation.
  const baseline = new Map();
  const factors = new Map();

  events
    .filter(event =>
      isCanon(event) &&
      Array.isArray(event.teams) &&
      Array.isArray(event.games)
    )
    .forEach(event => {
      event.games.forEach((game, index) => {
        const key = `${event.teams.length}:${gameId(game)}`;

        if (!baseline.has(key)) {
          baseline.set(key, { sum: 0, count: 0 });
        }

        Object.entries(event.scores || {}).forEach(([name, scores]) => {
          if (!full(event, name)) return;
          if (!Number.isFinite(scores?.[index])) return;

          const entry = baseline.get(key);
          entry.sum += scores[index];
          entry.count++;
        });
      });
    });

  games.forEach(game => {
    const ref = baseline.get(`5:${game.id}`);
    if (!ref?.count) return;

    [4, 5, 6, 7, 8].forEach(count => {
      const other = baseline.get(`${count}:${game.id}`);

      if (other?.count && other.sum > 0) {
        factors.set(
          `${count}:${game.id}`,
          game.id === 'hole_in_the_wall'
            ? 1
            : (ref.sum / ref.count) / (other.sum / other.count)
        );
      }
    });
  });

  function score(name) {
    const key = normalize(name);

    if (Object.prototype.hasOwnProperty.call(state.guests, key)) {
      return Number(state.guests[key]) || 0;
    }

    const range = $('tb-range').value;
    const mode = $('tb-score').value;

    const eligible = [...events]
      .filter(event =>
        ($('tb-noncanon').checked || isCanon(event)) &&
        (
          (range !== 's1' && range !== 's2') ||
          Number(
            event.season ??
            (Number(event.id) <= 10 ? 1 : 2)
          ) === Number(range.slice(1))
        )
      )
      .sort((a, b) => Number(b.id) - Number(a.id));

    const values = [];

    for (const event of eligible) {
      if (!$('tb-incomplete').checked && !full(event, name)) {
        continue;
      }

      const scores = getScores(event, name);
      if (!Array.isArray(scores)) continue;

      const total = (event.games || []).reduce((sum, game, i) => {
        const factor =
          mode === 'normalized' && event.teams?.length !== 5
            ? factors.get(`${event.teams?.length}:${gameId(game)}`) ?? 1
            : 1;

        return sum + (Number(scores[i]) || 0) * factor;
      }, 0);

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

  function initTeams(count) {
    state.teams = Array.from({ length: count }, (_, i) => {
      const colour = teamColours.find(c => c.name === defaults[i]);

      return {
        name: `${defaults[i]} Team`,
        color: colour.hex,
        players: []
      };
    });
  }

  function inRoster(name) {
    return state.roster.some(n => normalize(n) === normalize(name));
  }

  function findTeam(name) {
    return state.teams.findIndex(team =>
      team.players.some(n => normalize(n) === normalize(name))
    );
  }

  function findPosition(name) {
    const teamIndex = findTeam(name);

    if (teamIndex < 0) {
      return { teamIndex: -1, playerIndex: -1 };
    }

    const playerIndex = state.teams[teamIndex].players
      .findIndex(n => normalize(n) === normalize(name));

    return { teamIndex, playerIndex };
  }

  function move(name, target) {
    if (!inRoster(name)) return;

    const destination = Number(target);
    const current = findTeam(name);

    if (destination === current) return;

    if (destination >= 0) {
      const team = state.teams[destination];

      if (!team || team.players.length >= teamSize()) {
        notify('That team is full. Drag onto a player to swap.');
        return;
      }
    }

    if (current >= 0) {
      state.teams[current].players = state.teams[current].players
        .filter(n => normalize(n) !== normalize(name));
    }

    if (destination >= 0) {
      state.teams[destination].players.push(name);
    }

    render();
  }

  // Swap exact positions, even between different teams.
  function swapPlayers(first, second) {
    if (!inRoster(first) || !inRoster(second)) return;
    if (normalize(first) === normalize(second)) return;

    const a = findPosition(first);
    const b = findPosition(second);

    if (a.teamIndex < 0 && b.teamIndex < 0) return;

    if (a.teamIndex < 0 || b.teamIndex < 0) {
      // A pool player replaces an assigned player.
      const assigned = a.teamIndex >= 0 ? a : b;
      const incoming = a.teamIndex < 0 ? first : second;

      state.teams[assigned.teamIndex]
        .players[assigned.playerIndex] = incoming;
    } else {
      const teamA = state.teams[a.teamIndex];
      const teamB = state.teams[b.teamIndex];

      [
        teamA.players[a.playerIndex],
        teamB.players[b.playerIndex]
      ] = [
        teamB.players[b.playerIndex],
        teamA.players[a.playerIndex]
      ];
    }

    notify(`${first} and ${second} swapped.`);
    render();
  }

  function addPlayer(name, guest = false) {
    name = String(name).trim();
    if (!name) return;

    const key = normalize(name);

    if (inRoster(name)) {
      notify(`${name} is already in your roster.`);
      return;
    }

    if (state.roster.length >= capacity()) {
      notify('The roster is full.');
      return;
    }

    if (guest) {
      if (known.has(key)) {
        notify('This player is in the database. Search for them instead.');
        return;
      }

      state.guests[key] = Math.max(
        0,
        Number($('tb-guest-score').value) || 0
      );
    }

    state.roster.push(known.get(key) || name);
    $('tb-guest-name').value = '';

    notify(`${name} added.`);
    render();
  }

  function removePlayer(name) {
    state.roster = state.roster.filter(
      n => normalize(n) !== normalize(name)
    );

    state.teams.forEach(team => {
      team.players = team.players.filter(
        n => normalize(n) !== normalize(name)
      );
    });

    delete state.guests[normalize(name)];
    render();
  }

  function coinScore(name) {
    const coins = document.createElement('span');
    coins.className = 'tb-person-score';
    coins.textContent = fmt(score(name));

    const icon = document.createElement('img');
    icon.src = 'assets/stats/coin.webp';
    icon.alt = '';
    icon.className = 'tb-coin-icon';

    coins.append(' ', icon);
    return coins;
  }

  function playerFace(name) {
    const img = document.createElement('img');
    img.src = avatar(name);
    img.alt = '';
    img.loading = 'lazy';

    img.onerror = () => {
      img.style.visibility = 'hidden';
    };

    return img;
  }

  function person(name, assigned = false) {
    const el = document.createElement('div');
    el.className = 'tb-person';
    el.draggable = true;

    el.addEventListener('dragstart', event => {
      event.dataTransfer.setData('text/plain', name);
      event.dataTransfer.effectAllowed = 'move';
    });

    el.addEventListener('dragover', event => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'move';
      el.classList.add('tb-over');
    });

    el.addEventListener('dragleave', event => {
      if (!el.contains(event.relatedTarget)) {
        el.classList.remove('tb-over');
      }
    });

    el.addEventListener('drop', event => {
      event.preventDefault();
      event.stopPropagation();
      el.classList.remove('tb-over');

      const dragged = event.dataTransfer.getData('text/plain');
      if (dragged) swapPlayers(dragged, name);
    });

    const label = document.createElement('span');
    label.className = 'tb-person-name';
    label.textContent = name;

    el.append(playerFace(name), label, coinScore(name));

    if (!assigned) {
      const remove = document.createElement('button');
      remove.textContent = '×';
      remove.title = `Remove ${name} from roster`;

      remove.addEventListener('click', () => removePlayer(name));
      el.append(remove);
    }

    return el;
  }

  function dropzone(el, index) {
    el.addEventListener('dragover', event => {
      event.preventDefault();
      el.classList.add('tb-over');
    });

    el.addEventListener('dragleave', event => {
      if (!el.contains(event.relatedTarget)) {
        el.classList.remove('tb-over');
      }
    });

    el.addEventListener('drop', event => {
      event.preventDefault();
      el.classList.remove('tb-over');

      const name = event.dataTransfer.getData('text/plain');
      if (name) move(name, index);
    });
  }

  dropzone($('tb-pool-list'), -1);

  // Scroll the page when dragging near the top or bottom.
  let dragScrollDirection = 0;
  let dragScrollFrame = null;

  function autoScrollStep() {
    if (dragScrollDirection === 0) {
      dragScrollFrame = null;
      return;
    }

    window.scrollBy(0, dragScrollDirection * 12);
    dragScrollFrame = requestAnimationFrame(autoScrollStep);
  }

  document.addEventListener('dragover', event => {
    const edge = 110;
    let direction = 0;

    if (event.clientY < edge) {
      direction = -1;
    } else if (event.clientY > window.innerHeight - edge) {
      direction = 1;
    }

    dragScrollDirection = direction;

    if (direction && dragScrollFrame === null) {
      dragScrollFrame = requestAnimationFrame(autoScrollStep);
    }
  });

  function stopDragScroll() {
    dragScrollDirection = 0;

    if (dragScrollFrame !== null) {
      cancelAnimationFrame(dragScrollFrame);
      dragScrollFrame = null;
    }
  }

  document.addEventListener('drop', stopDragScroll);
  document.addEventListener('dragend', stopDragScroll);

  // Keep search open while focused.
  let searchOpen = false;

  function render() {
    const cap = capacity();
    $('tb-roster-count').textContent =
      `${state.roster.length} / ${cap}`;

    const pool = $('tb-pool-list');
    pool.replaceChildren();

    state.roster
      .filter(name => findTeam(name) < 0)
      .sort((a, b) => score(b) - score(a))
      .forEach(name => pool.append(person(name)));

    const grid = $('tb-team-grid');
    grid.replaceChildren();

    const totals = [];
    let filled = 0;

    state.teams.forEach((team, index) => {
      const card = document.createElement('article');
      card.className = 'tb-team';
      card.style.setProperty('--team-color', team.color);
      dropzone(card, index);

      const head = document.createElement('div');
      head.className = 'tb-team-header';

      const logo = document.createElement('img');

      
const updateLogo = () => {
  const chosen = teamColours.find(c =>
    c.hex.toLowerCase() === team.color.toLowerCase()
  ) || teamColours[0];

  logo.src = `assets/teams/${chosen.icon}.webp`;
};


      updateLogo();
      logo.alt = '';
      logo.onerror = () => {
        logo.style.display = 'none';
      };

      const name = document.createElement('input');
      name.value = team.name;
      name.setAttribute('aria-label', `Team ${index + 1} name`);

      name.addEventListener('input', () => {
        team.name = name.value;
      });

      const colour = document.createElement('select');
      colour.className = 'tb-colour-select';
      colour.setAttribute('aria-label', `Team ${index + 1} colour`);

      teamColours.forEach(c => {
        const option = document.createElement('option');
        option.value = c.hex;
        option.textContent = c.name;
        colour.append(option);
      });

      colour.value = team.color;

      
colour.addEventListener('change', () => {
  const oldColour = teamColours.find(c =>
    c.hex.toLowerCase() === team.color.toLowerCase()
  );

  const newColour = teamColours.find(c =>
    c.hex.toLowerCase() === colour.value.toLowerCase()
  );

  if (!newColour) return;

  // Automatically rename the team when its colour changes.
  const oldDefaultName = `${oldColour?.name || ''} Team`;

  if (
    team.name === oldDefaultName ||
    team.name.endsWith(' Team')
  ) {
    team.name = `${newColour.name} Team`;
    name.value = team.name;
  }

  team.color = newColour.hex;
  card.style.setProperty('--team-color', team.color);

  logo.style.display = '';
  updateLogo();
});


      head.append(logo, name, colour);
      card.append(head);

      for (let slot = 0; slot < teamSize(); slot++) {
        const wrap = document.createElement('div');
        wrap.className = 'tb-team-slot';

        const player = team.players[slot];

        if (player) {
          wrap.append(person(player, true));
        } else {
          wrap.classList.add('tb-empty');
          wrap.textContent = '+ Empty slot';
        }

        card.append(wrap);
      }

      const total = team.players.reduce(
        (sum, player) => sum + score(player), 0
      );

      filled += team.players.length;
      totals.push(total);

      const foot = document.createElement('div');
      foot.className = 'tb-team-total';

      const countLabel = document.createElement('span');
      countLabel.textContent =
        `${team.players.length} / ${teamSize()} players`;

      const totalLabel = document.createElement('strong');
      totalLabel.textContent = fmt(total);

      foot.append(countLabel, totalLabel);
      card.append(foot);
      grid.append(card);
    });

    $('tb-filled').textContent = `${filled} / ${cap}`;

    $('tb-spread').textContent =
      filled === cap && totals.length
        ? fmt(Math.max(...totals) - Math.min(...totals))
        : '—';

    $('tb-average').textContent =
      state.roster.length === cap
        ? fmt(
            state.roster.reduce((sum, n) => sum + score(n), 0) /
            state.teams.length
          )
        : '—';

    renderSearch();
  }

  function renderSearch() {
    const result = $('tb-search-results');
    result.replaceChildren();

    if (!searchOpen) return;

    const search = normalize($('tb-search').value);

    const available = [...known.values()]
      .filter(name =>
        normalize(name).includes(search) && !inRoster(name)
      )
      .sort((a, b) => a.localeCompare(b));

    available.forEach(name => {
      const line = document.createElement('div');
      line.className = 'tb-person';

      const label = document.createElement('span');
      label.className = 'tb-person-name';
      label.textContent = name;

      const add = document.createElement('button');
      add.textContent = 'Add';

      // Prevent search from closing before clicking Add.
      add.addEventListener('mousedown', event => {
        event.preventDefault();
      });

      add.addEventListener('click', () => addPlayer(name));

      line.append(
        playerFace(name),
        label,
        coinScore(name),
        add
      );

      result.append(line);
    });
  }

  function balance() {
    const cap = capacity();

    if (state.roster.length !== cap) {
      notify(
        `Select exactly ${cap} players before balancing ` +
        `(${state.roster.length} selected).`
      );
      return;
    }

    const sorted = [...state.roster]
      .sort((a, b) => score(b) - score(a));

    const groups = state.teams.map(() => []);
    const sums = state.teams.map(() => 0);

    sorted.forEach(name => {
      const candidates = groups
        .map((group, i) => i)
        .filter(i => groups[i].length < teamSize())
        .sort((a, b) =>
          sums[a] - sums[b] ||
          groups[a].length - groups[b].length
        );

      const i = candidates[0];
      groups[i].push(name);
      sums[i] += score(name);
    });

    const spread = () =>
      Math.max(...sums) - Math.min(...sums);

    // Improve initial assignment by swapping players.
    for (let step = 0; step < 400; step++) {
      let best = spread();
      let pair = null;

      for (let a = 0; a < groups.length; a++) {
        for (let b = a + 1; b < groups.length; b++) {
          for (let x = 0; x < teamSize(); x++) {
            for (let y = 0; y < teamSize(); y++) {
              const delta =
                score(groups[b][y]) - score(groups[a][x]);

              const next = sums.map((value, i) =>
                i === a ? value + delta :
                i === b ? value - delta : value
              );

              const width =
                Math.max(...next) - Math.min(...next);

              if (width < best - 0.0001) {
                best = width;
                pair = [a, b, x, y, delta];
              }
            }
          }
        }
      }

      if (!pair) break;

      const [a, b, x, y, delta] = pair;

      [groups[a][x], groups[b][y]] =
        [groups[b][y], groups[a][x]];

      sums[a] += delta;
      sums[b] -= delta;
    }

    state.teams.forEach((team, i) => {
      team.players = groups[i];
    });

    notify('Balanced teams generated. Drag players to adjust them.');
    render();
  }

  // Format changes preserve assignments where possible.
  function changeFormat() {
    const count = Number($('tb-count').value);
    const size = teamSize();
    const oldTeams = state.teams;

    const overflow = [];

    initTeams(count);

    oldTeams.forEach((oldTeam, i) => {
      if (i < count) {
        state.teams[i].name = oldTeam.name;
        state.teams[i].color = oldTeam.color;

        state.teams[i].players = oldTeam.players.slice(0, size);
        overflow.push(...oldTeam.players.slice(size));
      } else {
        overflow.push(...oldTeam.players);
      }
    });

    state.currentSize = size;

    notify(
      overflow.length
        ? `${overflow.length} player(s) returned to the pool.`
        : 'Team format updated.'
    );

    render();
  }

  $('tb-search').addEventListener('focus', () => {
    searchOpen = true;
    renderSearch();
  });

  $('tb-search').addEventListener('input', () => {
    searchOpen = true;
    renderSearch();
  });

  // Close only when focus moves outside search and its results.
  document.addEventListener('pointerdown', event => {
    if (
      !$('tb-search').contains(event.target) &&
      !$('tb-search-results').contains(event.target)
    ) {
      searchOpen = false;
      renderSearch();
    }
  });

  $('tb-add-guest').addEventListener('click', () => {
    addPlayer($('tb-guest-name').value, true);
  });

  $('tb-guest-name').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      addPlayer(event.target.value, true);
    }
  });

  $('tb-count').addEventListener('change', changeFormat);
  $('tb-size').addEventListener('change', changeFormat);

  [
    'tb-range',
    'tb-score',
    'tb-noncanon',
    'tb-incomplete'
  ].forEach(id => {
    $(id).addEventListener('change', render);
  });

  $('tb-balance').addEventListener('click', balance);

  $('tb-clear').addEventListener('click', () => {
    state.teams.forEach(team => {
      team.players = [];
    });

    notify('Team assignments cleared; roster kept.');
    render();
  });

  $('tb-reset').addEventListener('click', () => {
    if (!confirm('Clear all players and teams?')) return;

    state.roster = [];
    state.guests = {};

    initTeams(Number($('tb-count').value));
    state.currentSize = teamSize();

    localStorage.removeItem(KEY);

    notify('Builder reset.');
    render();
  });

  $('tb-save').addEventListener('click', () => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          teams: state.teams,
          roster: state.roster,
          guests: state.guests,
          settings: {
            count: $('tb-count').value,
            size: $('tb-size').value,
            range: $('tb-range').value,
            score: $('tb-score').value,
            noncanon: $('tb-noncanon').checked,
            incomplete: $('tb-incomplete').checked
          }
        })
      );

      notify('Saved in this browser.');
    } catch {
      notify('Could not save in this browser.');
    }
  });

  $('tb-export').addEventListener('click', async () => {
    const text = state.teams.map(team =>
      `${team.name} (${fmt(
        team.players.reduce((sum, name) => sum + score(name), 0)
      )}):\n` +
      team.players.map(name =>
        `• ${name} (${fmt(score(name))})`
      ).join('\n')
    ).join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      notify('Teams copied to clipboard.');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.append(textarea);
      textarea.select();

      const copied = document.execCommand('copy');
      textarea.remove();

      notify(copied ? 'Teams copied.' : 'Could not copy teams.');
    }
  });

  // Restore saved roster and team configuration.
  initTeams(5);

  try {
    const saved = JSON.parse(
      localStorage.getItem(KEY) || 'null'
    );

    if (Array.isArray(saved?.teams) && Array.isArray(saved.roster)) {
      const count = [4, 5, 6, 7, 8].includes(saved.teams.length)
        ? saved.teams.length
        : 5;

      const size = [2, 3, 4, 5, 6, 7, 8].includes(
        Number(saved.settings?.size)
      ) ? Number(saved.settings.size) : 4;

      $('tb-count').value = String(count);
      $('tb-size').value = String(size);

      state.currentSize = size;
      initTeams(count);

      // Preserve unique players, including overflow from old saves.
      const unique = new Map();

      saved.roster.forEach(name => {
        unique.set(normalize(name), name);
      });

      state.roster = [...unique.values()];
      state.guests = saved.guests || {};

      const used = new Set();

      saved.teams.slice(0, count).forEach((oldTeam, i) => {
        state.teams[i].name =
          String(oldTeam.name || `${defaults[i]} Team`);

        const colour = teamColours.find(c =>
          c.hex.toLowerCase() ===
          String(oldTeam.color).toLowerCase()
        );

        if (colour) {
          state.teams[i].color = colour.hex;
        }

        state.teams[i].players = (oldTeam.players || [])
          .filter(name => {
            const key = normalize(name);

            if (
              used.has(key) ||
              !state.roster.some(n => normalize(n) === key)
            ) {
              return false;
            }

            used.add(key);
            return true;
          })
          .slice(0, size);
      });

      const settings = saved.settings || {};

      if (
        ['1', '2', '3', '5', 's1', 's2', 'all']
          .includes(settings.range)
      ) {
        $('tb-range').value = settings.range;
      }

      if (['raw', 'normalized'].includes(settings.score)) {
        $('tb-score').value = settings.score;
      }

      $('tb-noncanon').checked = !!settings.noncanon;
      $('tb-incomplete').checked = !!settings.incomplete;
    }
  } catch (error) {
    console.warn('Could not restore Team Builder:', error);
  }

  render();
});
