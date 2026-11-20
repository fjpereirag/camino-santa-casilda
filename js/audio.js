// El camino de las rosas · voz y música
// Voz femenina en español con la síntesis de voz del propio navegador (gratuita, sin servicios externos)
// y música de fondo que baja de volumen mientras habla la voz.
(function () {
  const synth = window.speechSynthesis;
  const music = document.getElementById('musica');
  const MUSIC_VOL = .32, MUSIC_DUCK = .1;
  const state = { voz: false, musica: false, current: null, queue: [], timer: 0 };

  /* ---------- Elegir una voz femenina en español ---------- */
  const FEMALE = /(elvira|helena|laura|lucia|lucía|m[oó]nica|paulina|sabina|dalia|conchita|esperanza|marisol|paloma|ximena|elena|carmen|isabel|irene|female|mujer|google espa)/i;
  const MALE = /(pablo|jorge|[aá]lvaro|ra[uú]l|diego|enrique|juan|carlos|miguel|gonzalo|male\b|hombre)/i;
  let voice = null;
  function pickVoice() {
    if (!synth) return null;
    const vs = synth.getVoices().filter(v => /^es/i.test(v.lang));
    if (!vs.length) return null;
    const score = v => (/^es-ES/i.test(v.lang) ? 4 : 0) + (FEMALE.test(v.name) ? 6 : 0) - (MALE.test(v.name) ? 10 : 0) + (/natural|neural|online|premium|enhanced/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1);
    return vs.sort((a, b) => score(b) - score(a))[0];
  }
  if (synth) { voice = pickVoice(); synth.addEventListener?.('voiceschanged', () => { voice = pickVoice(); }); }

  /* ---------- Texto que lee cada sección ---------- */
  const dot = s => /[.!?…:;]$/.test(s.trim()) ? s.trim() : s.trim() + '.';
  const clean = s => s.replace(/[«»“”"]/g, '').replace(/\[…\]|…/g, ', ').replace(/([?!])\s*\./g, '$1').replace(/\s+/g, ' ').trim();
  const refTxt = r => r.replace(/(\d+),\s*(\d+)-(\d+)/, '$1, versículos $2 al $3').replace(/(\d+),\s*(\d+)/, '$1, versículo $2');
  function textFor(el) {
    const q = s => el.querySelector(s), qa = s => [...el.querySelectorAll(s)];
    if (el.classList.contains('etapa')) {
      const parts = [`Etapa ${q('.etapa__rn').textContent}. ${q('.etapa__lugar').textContent.replace('·', '.')}.`, dot(q('.panel__title').textContent)];
      qa('.panel > p:not(.panel__kicker):not(.eco)').forEach(p => parts.push(p.textContent));
      const c = q('.cita');
      if (c) parts.push('Escucha la Palabra de Dios. ' + c.querySelector('p').textContent + ' ' + refTxt(c.querySelector('cite').textContent) + '.');
      parts.push('Para la oración. ' + q('.pausa__q').textContent);
      return parts.map(clean);
    }
    if (el.id === 'prologo') return qa('.prologo__inner > p:not(.muted)').map(p => clean(p.textContent));
    if (el.id === 'final') {
      const parts = [dot(q('.final__title').textContent), ...qa('.final__inner > p.reveal').map(p => p.textContent)];
      const o = q('.oracion p:last-child'); if (o) parts.push('Oración a santa Casilda. ' + o.textContent);
      return parts.map(clean);
    }
    return [clean(el.textContent)];
  }
  // frases cortas: algunos navegadores cortan las locuciones largas
  const sentences = arr => arr.flatMap(t => t.match(/[^.!?;:]+[.!?;:]*/g) || [t]).map(s => s.trim()).filter(Boolean);

  /* ---------- Reproducción ---------- */
  function duck(on) { if (!music || !state.musica) return; fadeTo(on ? MUSIC_DUCK : MUSIC_VOL, 600); }
  let fadeRaf = 0;
  function fadeTo(v, ms) {
    cancelAnimationFrame(fadeRaf); const v0 = music.volume, t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / ms); music.volume = Math.min(1, Math.max(0, v0 + (v - v0) * k)); if (k < 1) fadeRaf = requestAnimationFrame(step); };
    fadeRaf = requestAnimationFrame(step);
  }
  // Locuciones grabadas (audio/voz/*.mp3, creadas con generar-audio.bat). Si faltan, se usa la voz del navegador.
  const vozMp3 = new Audio(); vozMp3.preload = 'none';
  let piezas = new Set();
  fetch('audio/voz/manifest.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(m => { if (m && m.piezas) { piezas = new Set(m.piezas); if (piezas.size) document.documentElement.classList.remove('no-voz'); } }).catch(() => {});
  vozMp3.addEventListener('ended', () => { setPlaying(null); duck(false); });
  function stopVoice() { vozMp3.pause(); if (synth) { state.queue = []; synth.cancel(); } setPlaying(null); duck(false); }
  function speakNext() {
    if (!state.queue.length) { setPlaying(null); duck(false); return; }
    const u = new SpeechSynthesisUtterance(state.queue.shift());
    u.lang = voice ? voice.lang : 'es-ES'; if (voice) u.voice = voice;
    u.rate = .92; u.pitch = 1.04; u.volume = 1;
    u.onend = speakNext; u.onerror = e => { if (e.error !== 'interrupted' && e.error !== 'canceled') speakNext(); };
    synth.speak(u);
  }
  function read(el) {
    if (el.id && piezas.has(el.id)) {
      if (synth) { state.queue = []; synth.cancel(); }
      vozMp3.src = 'audio/voz/' + el.id + '.mp3'; vozMp3.currentTime = 0;
      setPlaying(el); duck(true);
      const p = vozMp3.play(); if (p && p.catch) p.catch(() => { setPlaying(null); duck(false); });
      return;
    }
    if (!synth) return;
    vozMp3.pause(); synth.cancel(); state.queue = sentences(textFor(el)); state.current = el;
    setPlaying(el); duck(true);
    setTimeout(speakNext, 120);
  }
  function setPlaying(el) {
    state.current = el;
    document.querySelectorAll('[data-leer]').forEach(b => {
      const on = el && b.closest('section') === el;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      const sp = b.querySelector('span'); if (!b.dataset.label) b.dataset.label = sp.textContent; sp.textContent = on ? 'Detener la voz' : b.dataset.label;
    });
  }

  /* ---------- Controles ---------- */
  const modoBtns = [...document.querySelectorAll('[data-modo]')], ctl = document.querySelector('.audio-ctl');
  function sync() {
    modoBtns.forEach(b => b.setAttribute('aria-pressed', state[b.dataset.modo] ? 'true' : 'false'));
  }
  function setVoz(on) {
    state.voz = on && (!!synth || piezas.size > 0);
    if (!state.voz) stopVoice();
    else { const v = visibleSection(); if (v) read(v); }
    sync();
  }
  function setMusica(on) {
    state.musica = on && !!music;
    if (!music) return sync();
    if (state.musica) { music.volume = 0; const p = music.play(); if (p && p.catch) p.catch(() => {}); fadeTo((synth && synth.speaking) || !vozMp3.paused ? MUSIC_DUCK : MUSIC_VOL, 1500); }
    else { fadeTo(0, 700); setTimeout(() => { if (!state.musica) music.pause(); }, 750); }
    sync();
  }
  modoBtns.forEach(b => b.addEventListener('click', () => b.dataset.modo === 'voz' ? setVoz(!state.voz) : setMusica(!state.musica)));
  document.querySelectorAll('[data-leer]').forEach(b => b.addEventListener('click', () => {
    const sec = b.closest('section');
    if (state.current === sec && (!vozMp3.paused || (synth && (synth.speaking || synth.pending)))) { stopVoice(); return; }
    read(sec);
  }));
  if (!synth) { document.documentElement.classList.add('no-voz'); }

  /* ---------- Ocultar los textos para ver solo el mapa ---------- */
  const ojo = document.querySelector('[data-textos]');
  if (ojo) ojo.addEventListener('click', () => {
    const on = document.body.classList.toggle('sin-textos');
    ojo.setAttribute('aria-pressed', on ? 'true' : 'false');
    ojo.setAttribute('aria-label', on ? 'Mostrar los textos' : 'Ocultar los textos para ver el mapa');
    ojo.title = on ? 'Mostrar los textos' : 'Ocultar los textos';
  });

  /* ---------- Con la voz activada, cada etapa se lee al llegar a ella ---------- */
  const sections = [document.getElementById('prologo'), ...document.querySelectorAll('.etapa'), document.getElementById('final')].filter(Boolean);
  let inView = null;
  function visibleSection() { return inView || sections.find(s => { const r = s.getBoundingClientRect(); return r.top < innerHeight * .6 && r.bottom > innerHeight * .4; }); }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    inView = e.target;
    if (!state.voz || state.current === e.target) return;
    clearTimeout(state.timer);
    state.timer = setTimeout(() => { if (inView === e.target && state.voz) read(e.target); }, 900);
  }), { rootMargin: '-40% 0px -40% 0px' });
  sections.forEach(s => io.observe(s));

  // al cambiar de pestaña, pausar; al volver, la música sigue
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { vozMp3.pause(); if (synth) synth.pause(); if (music && state.musica) music.pause(); }
    else { if (state.current && vozMp3.src && vozMp3.paused && !vozMp3.ended) vozMp3.play().catch(() => {}); if (synth) synth.resume(); if (music && state.musica) music.play().catch(() => {}); }
  });
  sync();
})();

// Acuarelas: movimiento lento (zoom suave) al aparecer cada panel
(function () {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -20% 0px' });
  document.querySelectorAll('.panel').forEach(p => io.observe(p));
})();
