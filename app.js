const state = { data: null, game: 'Todos' };

const formatDate = value => new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));

function aggregate(events) {
  const totals = new Map();
  events.forEach(event => event.results.forEach(result => {
    totals.set(result.player, (totals.get(result.player) || 0) + result.wins);
  }));
  return [...totals].map(([player, wins]) => ({ player, wins })).sort((a, b) => b.wins - a.wins || a.player.localeCompare(b.player));
}

function render() {
  const events = state.game === 'Todos' ? state.data.events : state.data.events.filter(event => event.game === state.game);
  const ranking = aggregate(events);
  const totalWins = ranking.reduce((sum, player) => sum + player.wins, 0);
  const games = [...new Set(state.data.events.map(event => event.game))];
  const leader = ranking[0];

  document.querySelector('#stats').innerHTML = [
    [totalWins, 'Victorias registradas'], [ranking.length, 'Jugadores con gloria'], [events.length, 'Jornadas disputadas'], [games.length, 'Juegos en rotación']
  ].map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('');

  document.querySelector('#game-filters').innerHTML = ['Todos', ...games].map(game => `<button class="filter ${state.game === game ? 'active' : ''}" data-game="${game}">${game}</button>`).join('');
  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { state.game = button.dataset.game; render(); }));

  const maxWins = leader?.wins || 1;
  document.querySelector('#leaderboard').innerHTML = ranking.length ? ranking.map((entry, index) => `<div class="leader-row"><span class="rank">${String(index + 1).padStart(2, '0')}</span><span class="player">${entry.player}</span><div class="bar-track"><div class="bar" style="width:${entry.wins / maxWins * 100}%"></div></div><span class="wins"><strong>${entry.wins}</strong> ${entry.wins === 1 ? 'win' : 'wins'}</span></div>`).join('') : '<p>Sin resultados todavía.</p>';

  const avg = ranking.length ? (totalWins / ranking.length).toFixed(1).replace('.0', '') : 0;
  const lastEvent = [...events].sort((a,b) => b.date.localeCompare(a.date))[0];
  document.querySelector('#insights').innerHTML = [
    ['Líder actual', leader?.player || '—'], ['Récord de victorias', leader ? `${leader.wins} · ${leader.player}` : '—'], ['Media por jugador', `${avg} victorias`], ['Último juego', lastEvent?.game || '—']
  ].map(([label, value]) => `<div class="insight"><span>${label}</span><strong>${value}</strong></div>`).join('');

  document.querySelector('#mvp').innerHTML = leader ? `<div class="mvp-name">${leader.player}</div><div class="mvp-score"><strong>${leader.wins}</strong><br>VICTORIAS TOTALES</div>` : '<p>El trono está vacío.</p>';

  document.querySelector('#history').innerHTML = [...events].sort((a,b) => b.date.localeCompare(a.date)).map(event => {
    const [day, month] = formatDate(event.date).split(' ');
    const podium = [...event.results].sort((a,b) => b.wins - a.wins).map((result, index) => `<span><b>${index + 1}.</b> ${result.player} · ${result.wins}</span>`).join('');
    return `<article class="event"><div class="event-date"><strong>${day}</strong>${month} ${event.date.slice(0,4)}</div><div><div class="event-top"><span class="game">${event.game}</span><span class="game-tag">${event.mode}</span></div><div class="podium">${podium}</div></div></article>`;
  }).join('');
}

document.body.classList.add('loading');
fetch('data/results.json')
  .then(response => { if (!response.ok) throw new Error('No se pudieron cargar los resultados'); return response.json(); })
  .then(data => { state.data = data; render(); document.body.classList.remove('loading'); })
  .catch(error => { document.querySelector('main').innerHTML = `<p class="error">${error.message}</p>`; document.body.classList.remove('loading'); });
