
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


  const normalize = s => String(s).trim().toLowerCase();
  const fmt = n => Math.round(n).toLocaleString('en-IE');
  const isCanon = e => e.noncanon !== true && e.canon !== false;
  const gameId = g => typeof g === 'string' ? g : g.id;
  const state = { teams: [], roster: [], guests: {} };

  const teamSize = () => Number($('tb-size').value);
  const capacity = () => state.teams.length * teamSize();

  const specialHeads = [
    'creep1et',
    'fennecfox1247',
    'wailed_burrito61',
    'froopyloopidy',
    'sacred_bean'
  ];

  const avatar = name =>
    `https://mc-heads.net/avatar/${encodeURIComponent(normalize(name))}/` +
    (specialHeads.includes(normalize(name)) ? 64 : 32);

  const full = (e, name) => {
    const p = Object.entries(e.participation || {})
      .find(([n]) => normalize(n) === normalize(name))?.[1];

    return !p || (
      p.length === (e.games || []).length &&
      p.every(Boolean)
    );
  };

  const getScores = (e, name) => {
    const key = Object.keys(e.scores || {})
      .find(n => normalize(n) === normalize(name));

    return key ? e.scores[key] : null;
  };

  const known = new Map();

  events.forEach(e =>
    (e.teams || []).forEach(t =>
      (t.players || []).forEach(n =>
        known.set(normalize(n), n)
      )
    )
  );

  // Build normalisation factors from historical events.
  const baseline = new Map();
  const factors = new Map();

  events
    .filter(e =>
      isCanon(e) &&
      Array.isArray(e.teams) &&
      Array.isArray(e.games)
    )
    .forEach(e => e.games.forEach((g, i) => {
      const key = `${e.teams.length}:${gameId(g)}`;

      if (!baseline.has(key)) {
        baseline.set(key, { sum: 0, count: 0 });
      }

      Object.entries(e.scores || {}).forEach(([n, s]) => {
        if (!full(e, n) || !Number.isFinite(s?.[i])) return;

        const entry = baseline.get(key);
        entry.sum += s[i];
        entry.count++;
      });
    }));

  games.forEach(g => {
    const ref = baseline.get(`5:${g.id}`);
    if (!ref?.count) return;

    [4, 5, 6, 8].forEach(count => {
      const b = baseline.get(`${count}:${g.id}`);

      if (b?.count && b.sum > 0) {
        factors.set(
          `${count}:${g.id}`,
          g.id === 'hole_in_the_wall'
            ? 1
            : (ref.sum / ref.count) / (b.sum / b.count)
        );
      }
    });
  });

  function score(name) {
    const key = normalize(name);

    if (Object.prototype.hasOwnProperty.call(state.guests, key)) {
      return Number(state.guests[key]) || 0;
    }

    const count = $('tb-range').value;
    const mode = $('tb-score').value;

    const eligible = [...events]
      .filter(e =>
        ($('tb-noncanon').checked || isCanon(e)) &&
        (
          (count !== 's1' && count !== 's2') ||
          Number(
            e.season ?? (Number(e.id) <= 10 ? 1 : 2)
          ) === Number(count.slice(1))
        )
      )
      .sort((a, b) => Number(b.id) - Number(a.id));

    const values = [];

    for (const e of eligible) {
      if (!$('tb-incomplete').checked && !full(e, name)) {
        continue;
      }

      const scores = getScores(e, name);
      if (!Array.isArray(scores)) continue;

      const total = (e.games || []).reduce((sum, g, i) => {
        const factor =
          mode === 'normalized' && e.teams?.length !== 5
            ? (
                factors.get(
                  `${e.teams?.length}:${gameId(g)}`
                ) ?? 1
              )
            : 1;

        return sum + (Number(scores[i]) || 0) * factor;
      }, 0);

      values.push(total);

      if (
        /^\d+$/.test(count) &&
        values.length >= Number(count)
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
      const colour = teamColours.find(
        c => c.name === defaults[i]
      );

      return {
        name: `${defaults[i]} Team`,
        color: colour.hex,
        players: []
      };
    });
  }

  function findTeam(name) {
    return state.teams.findIndex(t =>
      t.players.some(n => normalize(n) === normalize(name))
    );
  }

  function inRoster(name) {
    return state.roster.some(n =>
      normalize(n) === normalize(name)
    );
  }

  function notify(msg) {
    $('tb-message').textContent = msg;
  }

  function move(name, target) {
    if (!inRoster(name)) return;

    const destination = Number(target);

    if (
      destination >= 0 &&
      (
        !state.teams[destination] ||
        (
          state.teams[destination].players.length >= teamSize() &&
          findTeam(name) !== destination
        )
      )
    ) {
      notify(`That team already has ${teamSize()} players.`);
      return;
    }

    state.teams.forEach(t => {
      t.players = t.players.filter(
        n => normalize(n) !== normalize(name)
      );
    });

    if (destination >= 0) {
      state.teams[destination].players.push(name);
    }

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
        notify(
          'This player is already in the event database. ' +
          'Search for them instead.'
        );
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

    state.teams.forEach(t => {
      t.players = t.players.filter(
        n => normalize(n) !== normalize(name)
      );
    });

    delete state.guests[normalize(name)];
    render();
  }

  function person(name, assigned = false) {
    const el = document.createElement('div');
    el.className = 'tb-person';
    el.draggable = true;

    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', name);
      e.dataTransfer.effectAllowed = 'move';
    });

    const img = document.createElement('img');
    img.src = avatar(name);
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => {
      img.style.visibility = 'hidden';
    };

    const label = document.createElement('span');
    label.className = 'tb-person-name';
    label.textContent = name;

    
const coins = document.createElement('span');
coins.className = 'tb-person-score';
coins.textContent = fmt(score(name));

const coinIcon = document.createElement('img');
coinIcon.src = 'assets/stats/coin.webp';
coinIcon.alt = '';
coinIcon.className = 'tb-coin-icon';

coins.append(' ', coinIcon);

el.append(img, label, coins);


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
    el.addEventListener('dragover', e => {
      e.preventDefault();
      el.classList.add('tb-over');
    });

    el.addEventListener('dragleave', () => {
      el.classList.remove('tb-over');
    });

    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('tb-over');

      const name = e.dataTransfer.getData('text/plain');
      if (name) move(name, index);
    });
  }

  dropzone($('tb-pool-list'), -1);

  function render() {
    const rosterCount = state.roster.length;
    const cap = capacity();

    $('tb-roster-count').textContent = `${rosterCount} / ${cap}`;

    const pool = $('tb-pool-list');
    pool.replaceChildren();

    state.roster
      .filter(n => findTeam(n) < 0)
      .sort((a, b) => score(b) - score(a))
      .forEach(n => pool.append(person(n)));

    const grid = $('tb-team-grid');
    grid.replaceChildren();

    const totals = [];
    let filled = 0;

    state.teams.forEach((t, i) => {
      const card = document.createElement('article');
      card.className = 'tb-team';
      card.style.setProperty('--team-color', t.color);
      dropzone(card, i);

      const head = document.createElement('div');
      head.className = 'tb-team-header';

      const logo = document.createElement('img');

      const updateLogo = () => {
        const chosen = teamColours.find(c =>
          c.hex.toLowerCase() === t.color.toLowerCase()
        ) || teamColours[0];

        logo.src = `assets/teams/${chosen.icon}.webp`;
      };

      updateLogo();
      logo.alt = '';
      logo.onerror = () => {
        logo.style.display = 'none';
      };

      const name = document.createElement('input');
      name.value = t.name;
      name.setAttribute('aria-label', `Team ${i + 1} name`);

      name.addEventListener('input', () => {
        t.name = name.value;
      });

      const color = document.createElement('select');
      color.className = 'tb-colour-select';
      color.setAttribute('aria-label', `Team ${i + 1} colour`);

      teamColours.forEach(c => {
        const option = document.createElement('option');
        option.value = c.hex;
        option.textContent = c.name;
        color.append(option);
      });

      color.value = t.color;

      color.addEventListener('change', () => {
        t.color = color.value;
        card.style.setProperty('--team-color', t.color);
        logo.style.display = '';
        updateLogo();
      });

      head.append(logo, name, color);
      card.append(head);

      for (let slot = 0; slot < teamSize(); slot++) {
        const wrap = document.createElement('div');
        wrap.className = 'tb-team-slot';

        const player = t.players[slot];

        if (player) {
          wrap.append(person(player, true));
        } else {
          wrap.classList.add('tb-empty');
          wrap.textContent = '+ Empty slot';
        }

        card.append(wrap);
      }

      const total = t.players.reduce(
        (sum, n) => sum + score(n), 0
      );

      filled += t.players.length;
      totals.push(total);

      const foot = document.createElement('div');
      foot.className = 'tb-team-total';

      const label = document.createElement('span');
      label.textContent = `${t.players.length} / ${teamSize()} players`;

      const value = document.createElement('strong');
      value.textContent = fmt(total);

      foot.append(label, value);
      card.append(foot);
      grid.append(card);
    });

    $('tb-filled').textContent = `${filled} / ${cap}`;

    $('tb-spread').textContent =
      totals.length && filled === cap
        ? fmt(Math.max(...totals) - Math.min(...totals))
        : '—';

    $('tb-average').textContent =
      state.roster.length === cap
        ? fmt(
            state.roster.reduce((sum, n) => sum + score(n), 0) /
            state.teams.length
          )
        : '—';

    const search = normalize($('tb-search').value);
    const result = $('tb-search-results');
    result.replaceChildren();

    if (search) {
      [...known.values()]
        .filter(n =>
          normalize(n).includes(search) && !inRoster(n)
        )
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 30)
        .forEach(n => {
          const line = document.createElement('div');
          line.className = 'tb-person';

          const img = document.createElement('img');
          img.src = avatar(n);
          img.alt = '';
          img.loading = 'lazy';

          const label = document.createElement('span');
          label.className = 'tb-person-name';
          label.textContent = n;

          
const s = document.createElement('span');
s.className = 'tb-person-score';
s.textContent = fmt(score(n));

const coinIcon = document.createElement('img');
coinIcon.src = 'assets/stats/coin.webp';
coinIcon.alt = '';
coinIcon.className = 'tb-coin-icon';

s.append(' ', coinIcon);


          const btn = document.createElement('button');
          btn.textContent = 'Add';
          btn.addEventListener('click', () => addPlayer(n));

          line.append(img, label, s, btn);
          result.append(line);
        });
    }
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

    const sorted = [...state.roster].sort(
      (a, b) => score(b) - score(a)
    );

    // Assign players, then swap them to reduce team-score spread.
    const groups = state.teams.map(() => []);
    const sums = state.teams.map(() => 0);

    sorted.forEach(name => {
      const candidates = groups
        .map((g, i) => i)
        .filter(i => groups[i].length < teamSize())
        .sort((a, b) =>
          sums[a] - sums[b] ||
          groups[a].length - groups[b].length
        );

      const i = candidates[0];
      groups[i].push(name);
      sums[i] += score(name);
    });

    const spread = () => Math.max(...sums) - Math.min(...sums);

    for (let step = 0; step < 400; step++) {
      let best = spread();
      let pair = null;

      for (let a = 0; a < groups.length; a++) {
        for (let b = a + 1; b < groups.length; b++) {
          for (let x = 0; x < teamSize(); x++) {
            for (let y = 0; y < teamSize(); y++) {
              const delta =
                score(groups[b][y]) - score(groups[a][x]);

              const next = sums.map((v, i) =>
                i === a ? v + delta :
                i === b ? v - delta : v
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

    state.teams.forEach((t, i) => {
      t.players = groups[i];
    });

    notify(
      'Balanced teams generated. Drag players to make adjustments.'
    );
    render();
  }

  $('tb-search').addEventListener('input', render);

  $('tb-add-guest').addEventListener('click', () => {
    addPlayer($('tb-guest-name').value, true);
  });

  $('tb-guest-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      addPlayer(e.target.value, true);
    }
  });

  function changeFormat() {
    const count = Number($('tb-count').value);
    const size = teamSize();

    if (state.roster.length > count * size) {
      $('tb-count').value = String(state.teams.length);
      $('tb-size').value = String(state.currentSize || 4);
      notify('Remove players before reducing the roster capacity.');
      return;
    }

    const old = state.teams;
    const assigned = old.flatMap(t => t.players);

    initTeams(count);

    state.teams.forEach((t, i) => {
      if (old[i]) {
        t.name = old[i].name;
        t.color = old[i].color;
      }
    });

    assigned.forEach((n, i) => {
      const index = Math.floor(i / size);

      if (index < count) {
        state.teams[index].players.push(n);
      }
    });

    state.currentSize = size;
    render();
  }

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
    state.teams.forEach(t => t.players = []);
    notify('Team assignments cleared; roster kept.');
    render();
  });

  $('tb-reset').addEventListener('click', () => {
    if (!confirm('Clear all players and teams?')) return;

    state.roster = [];
    state.guests = {};
    initTeams(Number($('tb-count').value));
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
    const text = state.teams.map(t =>
      `${t.name} (${fmt(
        t.players.reduce((a, n) => a + score(n), 0)
      )}):\n` +
      t.players.map(n =>
        `• ${n} (${fmt(score(n))})`
      ).join('\n')
    ).join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      notify('Teams copied to clipboard.');
    } catch {
      const a = document.createElement('textarea');
      a.value = text;
      document.body.append(a);
      a.select();
      document.execCommand('copy');
      a.remove();
      notify('Teams copied.');
    }
  });

  // Restore saved teams and settings.
  initTeams(5);
  state.currentSize = 4;

  try {
    const saved = JSON.parse(
      localStorage.getItem(KEY) || 'null'
    );

    if (saved?.teams && Array.isArray(saved.roster)) {
      
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

      state.roster = [
        ...new Map(
          saved.roster.map(n => [normalize(n), n])
        ).values()
      ].slice(0, count * size);

      state.guests = saved.guests || {};

      const used = new Set();

      state.teams = saved.teams.slice(0, count).map((t, i) => ({
        name: String(t.name || `${defaults[i]} Team`),
        color: teamColours.some(c =>
          c.hex.toLowerCase() === String(t.color).toLowerCase()
        ) ? t.color : teamColours.find(
          c => c.name === defaults[i]
        ).hex,
        players: (t.players || [])
          .filter(n => {
            const key = normalize(n);

            if (
              !state.roster.some(p => normalize(p) === key) ||
              used.has(key)
            ) {
              return false;
            }

            used.add(key);
            return true;
          })
          .slice(0, size)
      }));

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
