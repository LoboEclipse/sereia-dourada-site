(function () {
  'use strict';

  var APP_VERSION = '1.0.0';
  var PREFS_KEY = 'sereia_smarttv_web_prefs_v1';
  var VERSION_URL = 'https://loboeclipse.github.io/sereia-dourada-site/smarttv-version.json';
  var HOSTED_TV_URL = 'https://loboeclipse.github.io/sereia-dourada-site/tv/';
  var OTA_POLL_MS = 5 * 60 * 1000;

  var FIREBASE_CONFIG = {
    apiKey: 'AIzaSyCH5WkqpW4DmFE9oBuDK74O9cA8T8OnJ9Y',
    authDomain: 'sereiradourada-818d2.firebaseapp.com',
    projectId: 'sereiradourada-818d2',
    storageBucket: 'sereiradourada-818d2.firebasestorage.app',
    messagingSenderId: '228021638854',
    appId: '1:228021638854:web:fdf098f86d7cba21aae9c7',
    measurementId: 'G-R6DNH00BTL'
  };

  var DEFAULT_CATALOG = [
    { code: '101', name: 'Camarão Dourado na Manteiga', category: 'Restaurante', unit: 'Porção 450g', price: 128.0, promoPrice: 109.9, badge: 'OFERTA DO DIA', description: 'Camarões selecionados salteados na manteiga de ervas e toque cítrico.' },
    { code: '102', name: 'Moqueca Sereia Dourada', category: 'Restaurante', unit: 'Serve 2 pessoas', price: 154.0, promoPrice: 134.9, badge: 'DESTAQUE', description: 'Peixe nobre, camarões rosa, leite de coco artesanal, pirão e arroz.' },
    { code: '103', name: 'Filé Mignon ao Molho Imperial', category: 'Restaurante', unit: 'Prato Executivo', price: 119.0, promoPrice: null, badge: '', description: 'Corte alto grelhado com redução de vinho tinto e purê trufado.' },
    { code: '104', name: 'Porção Isca de Peixe Crocante', category: 'Restaurante', unit: 'Porção 500g', price: 74.0, promoPrice: 59.9, badge: 'RELÂMPAGO', description: 'Iscas frescas empanadas na hora com molho tártaro da casa.' },
    { code: '105', name: 'Lagosta Grelhada na Brasa', category: 'Restaurante', unit: 'Prato Especial', price: 215.0, promoPrice: 189.9, badge: 'PREMIUM', description: 'Cauda de lagosta fresca com manteiga dourada e legumes salteados.' },
    { code: '106', name: 'Risoto de Frutos do Mar', category: 'Restaurante', unit: 'Prato Individual', price: 112.0, promoPrice: null, badge: '', description: 'Arroz arbóreo cremoso com lula, polvo, camarão e parmesão maturado.' },
    { code: '201', name: 'Drink Brisa Dourada', category: 'Drinks & Bebidas', unit: 'Taça 350ml', price: 38.0, promoPrice: 29.9, badge: 'OFERTA DO DIA', description: 'Gin artesanal, maracujá fresco, especiarias e espuma cítrica.' },
    { code: '202', name: 'Caipirinha Especial Frutas', category: 'Drinks & Bebidas', unit: 'Copo 300ml', price: 29.0, promoPrice: 22.9, badge: 'PROMOÇÃO', description: 'Limão siciliano, morango ou kiwi com cachaça premium ou vodka.' },
    { code: '203', name: 'Água de Coco Natural Gelada', category: 'Drinks & Bebidas', unit: 'Unidade', price: 14.0, promoPrice: null, badge: '', description: 'Servida trincando direto do coco verde selecionado.' },
    { code: '204', name: 'Refrigerante Lata Gelada', category: 'Drinks & Bebidas', unit: 'Lata 350ml', price: 9.0, promoPrice: null, badge: '', description: 'Diversos sabores tradicionais e zero açúcar.' },
    { code: '205', name: 'Balde 5 Cervejas Long Neck', category: 'Drinks & Bebidas', unit: 'Combo 5 Unid.', price: 85.0, promoPrice: 69.9, badge: 'SUPER OFERTA', description: 'Balde com gelo e 5 long necks premium bem geladas.' },
    { code: '206', name: 'Jarra de Suco Tropical 1L', category: 'Drinks & Bebidas', unit: 'Jarra 1 Litro', price: 32.0, promoPrice: null, badge: '', description: 'Abacaxi com hortelã, manga, acerola ou laranja natural.' },
    { code: '301', name: 'Diária Suíte Pousada Luxo', category: 'Pousada & Lazer', unit: 'Diária Casal', price: 420.0, promoPrice: 369.0, badge: 'OFERTA', description: 'Café da manhã incluso, vista privilegiada e acesso ao Beach Club.' },
    { code: '302', name: 'Diária Área Camping VIP', category: 'Pousada & Lazer', unit: 'Diária / Pessoa', price: 160.0, promoPrice: null, badge: '', description: 'Área arborizada com ponto de energia, duchas e segurança 24h.' },
    { code: '303', name: 'Day Use Beach Club + Piscina', category: 'Pousada & Lazer', unit: 'Passaporte Dia', price: 120.0, promoPrice: 95.0, badge: 'FIM DE SEMANA', description: 'Acesso completo ao lounge, espreguiçadeiras e área de lazer.' },
    { code: '304', name: 'Sessão Golden Spa Relax', category: 'Pousada & Lazer', unit: '60 Minutos', price: 180.0, promoPrice: null, badge: '', description: 'Massagem relaxante com óleos essenciais aromáticos.' },
    { code: '401', name: 'Colar Pérola Dourada', category: 'Boutique & Empório', unit: 'Peça Exclusiva', price: 189.9, promoPrice: 159.9, badge: 'DESTAQUE', description: 'Acessório exclusivo da coleção Sereia Dourada.' },
    { code: '402', name: 'Bolsa Palha Maré Alta', category: 'Boutique & Empório', unit: 'Unidade', price: 229.9, promoPrice: null, badge: '', description: 'Trama artesanal com acabamento dourado e forro interno.' },
    { code: '403', name: 'Kit Praia Sereia (Saída + Chapéu)', category: 'Boutique & Empório', unit: 'Combo 2 Peças', price: 249.0, promoPrice: 199.9, badge: 'COMBO', description: 'Conjunto exclusivo verão com desconto especial na loja.' },
    { code: '404', name: 'Azeite & Temperos Artesanais', category: 'Boutique & Empório', unit: 'Kit Empório', price: 68.0, promoPrice: null, badge: '', description: 'Seleção gourmet para levar o sabor do restaurante para casa.' }
  ];

  var COUNTERS = ['CAIXA 01', 'CAIXA 02', 'CAIXA 03', 'BALCÃO RESTAURANTE', 'RETIRADA RÁPIDA'];
  var MODES = ['mercado', 'tabela', 'senhas'];
  var MODE_LABELS = {
    mercado: 'OFERTAS & PREÇOS',
    tabela: 'TABELA DE PREÇOS',
    senhas: 'PAINEL DE SENHAS'
  };

  var state = {
    platform: detectPlatform(),
    catalog: DEFAULT_CATALOG.slice(),
    online: false,
    support: { whatsapp: '', horario: '' },
    mode: 'mercado',
    selectedSector: 'TODOS',
    rotationSec: 10,
    paused: false,
    autoOta: true,
    menuOpen: false,
    offerIdx: 0,
    boardStep: 0,
    elapsedMs: 0,
    ticketNum: 1,
    counterIdx: 0,
    ticketHistory: [],
    pendingOtaUrl: ''
  };

  function detectPlatform() {
    if (typeof window.tizen !== 'undefined') return 'SAMSUNG TIZEN';
    if (typeof window.webOS !== 'undefined' || /Web0S|webOS/i.test(navigator.userAgent)) return 'LG WEBOS';
    if (/Tizen/i.test(navigator.userAgent)) return 'SAMSUNG TIZEN';
    return 'SMART TV WEB';
  }

  function $(id) {
    return document.getElementById(id);
  }

  function fmtBRL(val) {
    var num = Number(val) || 0;
    var parts = num.toFixed(2).split('.');
    var reais = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return { reais: reais, centavos: parts[1], full: 'R$ ' + reais + ',' + parts[1] };
  }

  function parsePrice(raw) {
    if (typeof raw === 'number' && !isNaN(raw)) return raw;
    var clean = String(raw || '').replace(/R\$/gi, '').replace(/\s+/g, '').replace(/\./g, '').replace(',', '.');
    var n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  }

  function normalizeCategory(raw) {
    var val = String(raw || '').trim();
    if (!val) return 'Restaurante';
    var low = val.toLowerCase();
    if (low.indexOf('bebida') >= 0 || low.indexOf('drink') >= 0) return 'Drinks & Bebidas';
    if (low.indexOf('pousada') >= 0 || low.indexOf('camping') >= 0 || low.indexOf('spa') >= 0 || low.indexOf('lazer') >= 0) return 'Pousada & Lazer';
    if (low.indexOf('boutique') >= 0 || low.indexOf('empório') >= 0 || low.indexOf('emporio') >= 0) return 'Boutique & Empório';
    if (low.indexOf('entrada') >= 0 || low.indexOf('principal') >= 0 || low.indexOf('sobremesa') >= 0) return 'Restaurante';
    return val;
  }

  function isNewerVersion(remote, current) {
    var r = String(remote || '0.0.0').split('.').map(function (n) { return parseInt(n, 10) || 0; });
    var c = String(current || '0.0.0').split('.').map(function (n) { return parseInt(n, 10) || 0; });
    var len = Math.max(r.length, c.length);
    for (var i = 0; i < len; i++) {
      if ((r[i] || 0) > (c[i] || 0)) return true;
      if ((r[i] || 0) < (c[i] || 0)) return false;
    }
    return false;
  }

  function loadPrefs() {
    try {
      var raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return;
      var p = JSON.parse(raw);
      if (MODES.indexOf(p.mode) >= 0) state.mode = p.mode;
      if (typeof p.selectedSector === 'string') state.selectedSector = p.selectedSector;
      if ([6, 10, 15, 30].indexOf(p.rotationSec) >= 0) state.rotationSec = p.rotationSec;
      if (typeof p.autoOta === 'boolean') state.autoOta = p.autoOta;
    } catch (e) {}
  }

  function savePrefs() {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          mode: state.mode,
          selectedSector: state.selectedSector,
          rotationSec: state.rotationSec,
          autoOta: state.autoOta
        })
      );
    } catch (e) {}
  }

  // Samsung Tizen APIs: manter tela 100% acesa 24/7 + registrar teclas do controle remoto
  function initPlatformHardware() {
    try {
      if (window.webapis && window.webapis.appcommon && window.webapis.appcommon.setScreenSaver) {
        window.webapis.appcommon.setScreenSaver(
          window.webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF
        );
      }
    } catch (e) {}

    try {
      if (window.tizen && window.tizen.tvinputdevice) {
        var keys = ['ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue', 'MediaPlayPause', 'MediaPlay', 'MediaPause'];
        for (var i = 0; i < keys.length; i++) {
          try {
            window.tizen.tvinputdevice.registerKey(keys[i]);
          } catch (err) {}
        }
      }
    } catch (e) {}
  }

  function getSectors() {
    var list = [];
    for (var i = 0; i < state.catalog.length; i++) {
      var c = state.catalog[i].category;
      if (c && list.indexOf(c) === -1) list.push(c);
    }
    return list;
  }

  function getPromoItems() {
    var promos = state.catalog.filter(function (i) {
      return i.promoPrice && i.promoPrice < i.price;
    });
    return promos.length > 0 ? promos : state.catalog;
  }

  function getBoardPages() {
    var perPage = state.mode === 'tabela' ? 12 : 6;
    var sectors = getSectors();
    var activeSectors =
      state.selectedSector !== 'TODOS' && sectors.indexOf(state.selectedSector) >= 0
        ? [state.selectedSector]
        : sectors;

    var pages = [];
    for (var s = 0; s < activeSectors.length; s++) {
      var sec = activeSectors[s];
      var secItems = state.catalog.filter(function (item) {
        return item.category === sec;
      });
      var totalPages = Math.max(1, Math.ceil(secItems.length / perPage));
      for (var p = 0; p < totalPages; p++) {
        pages.push({
          sectorName: sec,
          pageIndex: p,
          totalPages: totalPages,
          items: secItems.slice(p * perPage, (p + 1) * perPage)
        });
      }
    }
    return pages.length > 0 ? pages : [{ sectorName: 'GERAL', pageIndex: 0, totalPages: 1, items: state.catalog.slice(0, perPage) }];
  }

  function renderClock() {
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');
    $('clock-time').textContent = hh + ':' + mm + ':' + ss;
    try {
      $('clock-date').textContent = now
        .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
        .toUpperCase();
    } catch (e) {
      $('clock-date').textContent = now.getDate() + '/' + (now.getMonth() + 1);
    }
  }

  function renderSyncStatus() {
    var dot = $('sync-dot');
    dot.classList.toggle('online', state.online);
    $('sync-label').textContent =
      (state.online ? 'SINCRONIZADO FIREBASE' : 'CATÁLOGO LOCAL') +
      ' • ' +
      state.platform +
      ' v' +
      APP_VERSION;
    $('modal-subtitle').textContent =
      state.platform + ' • Sereia Dourada TV v' + APP_VERSION + ' • Use as setas e OK do controle';
  }

  function renderSpotlight() {
    var promos = getPromoItems();
    var idx = state.offerIdx % promos.length;
    var item = promos[idx];
    if (!item) return;

    var hasPromo = Boolean(item.promoPrice && item.promoPrice < item.price);
    var displayPrice = hasPromo ? item.promoPrice : item.price;
    var parts = fmtBRL(displayPrice);
    var discount = hasPromo ? Math.round(((item.price - item.promoPrice) / item.price) * 100) : 0;

    $('spot-badge').textContent = '⚡ ' + (item.badge || 'OFERTA DO DIA');
    $('spot-discount').textContent = discount > 0 ? '-' + discount + '% OFF' : 'CÓD #' + item.code;
    $('spot-category').textContent = String(item.category || '').toUpperCase();
    $('spot-code').textContent = '#' + item.code;
    $('spot-name').textContent = item.name;
    $('spot-desc').textContent = item.description || '';

    var oldEl = $('spot-old-price');
    if (hasPromo) {
      oldEl.textContent = 'DE ' + fmtBRL(item.price).full;
      oldEl.style.textDecoration = 'line-through';
      $('spot-save').textContent = 'ECONOMIZE ' + fmtBRL(item.price - item.promoPrice).full;
    } else {
      oldEl.textContent = 'PREÇO ESPECIAL';
      oldEl.style.textDecoration = 'none';
      $('spot-save').textContent = '';
    }

    $('spot-unit').textContent = item.unit || 'Unidade';
    $('spot-reais').textContent = parts.reais;
    $('spot-cents').textContent = ',' + parts.centavos;
    $('spot-counter').textContent =
      'OFERTA ' + (idx + 1) + ' DE ' + promos.length + (state.paused ? ' • PAUSADO' : '');

    // Atualiza mini-oferta do modo Senhas
    $('queue-offer-name').textContent = item.name;
    $('queue-offer-price').textContent = parts.full;
  }

  function createPriceRowHtml(item, idx) {
    var hasPromo = Boolean(item.promoPrice && item.promoPrice < item.price);
    var p = fmtBRL(hasPromo ? item.promoPrice : item.price);
    var oldHtml = hasPromo ? '<span class="row-old">' + fmtBRL(item.price).full + '</span>' : '';
    var promoTag = hasPromo ? '<span class="row-promo-tag">OFERTA</span>' : '';
    return (
      '<div class="price-row ' +
      (idx % 2 === 1 ? 'striped ' : '') +
      (hasPromo ? 'promo' : '') +
      '">' +
      '<div class="row-left">' +
      '<div class="row-name-line">' +
      '<span class="row-code">#' +
      item.code +
      '</span>' +
      '<span class="row-name">' +
      escapeHtml(item.name) +
      '</span>' +
      promoTag +
      '</div>' +
      '<div class="row-unit">' +
      escapeHtml(item.unit || item.category) +
      '</div>' +
      '</div>' +
      '<div class="row-right">' +
      oldHtml +
      '<div class="row-price-pill ' +
      (hasPromo ? 'promo' : '') +
      '">' +
      '<span class="row-cur">R$</span>' +
      '<span class="row-reais">' +
      p.reais +
      '</span>' +
      '<span class="row-cents">,' +
      p.centavos +
      '</span>' +
      '</div></div></div>'
    );
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderBoard() {
    var pages = getBoardPages();
    var active = pages[state.boardStep % pages.length];
    var sectors = getSectors();

    var chipsHtml = sectors
      .map(function (s) {
        return '<span class="sector-chip ' + (s === active.sectorName ? 'active' : '') + '">' + escapeHtml(s) + '</span>';
      })
      .join('');

    var pageText = active.totalPages > 1 ? 'PÁG ' + (active.pageIndex + 1) + '/' + active.totalPages : '';

    if (state.mode === 'tabela') {
      $('full-sector-title').textContent = active.sectorName.toUpperCase();
      $('full-sector-chips').innerHTML = chipsHtml;
      $('full-page').textContent = pageText;
      var mid = Math.ceil(active.items.length / 2);
      $('full-col-left').innerHTML = active.items.slice(0, mid).map(createPriceRowHtml).join('');
      $('full-col-right').innerHTML = active.items.slice(mid).map(createPriceRowHtml).join('');
    } else {
      $('board-sector-title').textContent = active.sectorName.toUpperCase();
      $('board-sector-chips').innerHTML = chipsHtml;
      $('board-page').textContent = pageText;
      $('board-list').innerHTML = active.items.map(createPriceRowHtml).join('');
    }
  }

  function formatTicket(num) {
    return 'A-' + String(num).padStart(3, '0');
  }

  function renderQueue(pulse) {
    $('queue-ticket-code').textContent = formatTicket(state.ticketNum);
    $('queue-counter-name').textContent = COUNTERS[state.counterIdx % COUNTERS.length];

    if (pulse) {
      var box = $('queue-ticket-box');
      box.classList.remove('pulse');
      void box.offsetWidth;
      box.classList.add('pulse');
      setTimeout(function () {
        box.classList.remove('pulse');
      }, 450);
    }

    var listEl = $('queue-history-list');
    if (state.ticketHistory.length === 0) {
      listEl.innerHTML =
        '<p class="queue-empty">Pressione "CHAMAR PRÓXIMA SENHA" ou o botão VERDE do controle remoto.</p>';
      return;
    }

    listEl.innerHTML = state.ticketHistory
      .slice(0, 5)
      .map(function (h) {
        return (
          '<div class="history-row">' +
          '<span class="history-code">' +
          escapeHtml(h.code) +
          '</span>' +
          '<span class="history-counter">' +
          escapeHtml(h.counter) +
          '</span>' +
          '<span class="history-time">' +
          escapeHtml(h.time) +
          '</span>' +
          '</div>'
        );
      })
      .join('');
  }

  function renderTicker() {
    var msgs = [
      'BEM-VINDO À SEREIA DOURADA — OFERTAS ESPECIAIS TODOS OS DIAS!',
      'ACEITAMOS PIX, CARTÃO DE CRÉDITO, DÉBITO E DINHEIRO NO CAIXA',
      'CONSULTE NOSSO CARDÁPIO E RESERVAS EM SEREIA DOURADA'
    ];
    var promos = getPromoItems().slice(0, 4);
    for (var i = 0; i < promos.length; i++) {
      var p = promos[i];
      msgs.push('⚡ OFERTA: ' + p.name.toUpperCase() + ' POR APENAS ' + fmtBRL(p.promoPrice || p.price).full);
    }
    if (state.support.horario) msgs.push('HORÁRIO: ' + state.support.horario.toUpperCase());
    if (state.support.whatsapp) msgs.push('WHATSAPP: ' + state.support.whatsapp);
    $('ticker-content').textContent = msgs.join('   ★   ');
  }

  function renderModeViews() {
    $('mode-badge').textContent = MODE_LABELS[state.mode] || 'PAINEL TV';
    $('view-mercado').classList.toggle('hidden', state.mode !== 'mercado');
    $('view-tabela').classList.toggle('hidden', state.mode !== 'tabela');
    $('view-senhas').classList.toggle('hidden', state.mode !== 'senhas');
    $('btn-pause').textContent = state.paused ? '🟡 RETOMAR' : '🟡 PAUSAR';
    $('btn-pause').classList.toggle('active', state.paused);
    renderSpotlight();
    renderBoard();
    renderQueue(false);
    renderMenuSelections();
  }

  function renderMenuSelections() {
    var modeBtns = document.querySelectorAll('[data-set-mode]');
    for (var i = 0; i < modeBtns.length; i++) {
      modeBtns[i].classList.toggle('active', modeBtns[i].getAttribute('data-set-mode') === state.mode);
    }

    var speedBtns = document.querySelectorAll('[data-set-speed]');
    for (var j = 0; j < speedBtns.length; j++) {
      speedBtns[j].classList.toggle(
        'active',
        parseInt(speedBtns[j].getAttribute('data-set-speed'), 10) === state.rotationSec
      );
    }

    var otaBtn = $('btn-toggle-auto-ota');
    otaBtn.textContent = state.autoOta ? '✓ OTA AUTOMÁTICO: LIGADO' : 'OTA AUTOMÁTICO: DESLIGADO';
    otaBtn.classList.toggle('tv-btn-success', state.autoOta);

    var sectors = ['TODOS'].concat(getSectors());
    var secRow = $('modal-sector-row');
    secRow.innerHTML = sectors
      .map(function (sec) {
        var label = sec === 'TODOS' ? 'TODOS (ROTAÇÃO)' : sec.toUpperCase();
        var cls = 'tv-btn tv-btn-sm ' + (state.selectedSector === sec ? 'active' : '');
        return '<button type="button" class="' + cls + '" data-tv-focus data-set-sector="' + escapeHtml(sec) + '">' + escapeHtml(label) + '</button>';
      })
      .join('');

    var secBtns = secRow.querySelectorAll('[data-set-sector]');
    for (var k = 0; k < secBtns.length; k++) {
      secBtns[k].addEventListener('click', function () {
        state.selectedSector = this.getAttribute('data-set-sector');
        state.boardStep = 0;
        savePrefs();
        renderModeViews();
      });
    }
  }

  function openMenu() {
    state.menuOpen = true;
    $('menu-modal').classList.remove('hidden');
    renderMenuSelections();
    var first = document.querySelector('#menu-modal [data-tv-focus]');
    if (first) first.focus();
  }

  function closeMenu() {
    state.menuOpen = false;
    $('menu-modal').classList.add('hidden');
    var target = $('btn-mode');
    if (target) target.focus();
  }

  function callNextTicket() {
    var now = new Date();
    var time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    state.ticketHistory.unshift({
      code: formatTicket(state.ticketNum),
      counter: COUNTERS[state.counterIdx % COUNTERS.length],
      time: time
    });
    state.ticketHistory = state.ticketHistory.slice(0, 6);
    state.ticketNum += 1;
    renderQueue(true);
  }

  // Firebase Firestore em tempo real (leitura pública)
  function initFirebase() {
    try {
      if (typeof window.firebase === 'undefined') return;
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(FIREBASE_CONFIG);
      }
      var db = window.firebase.firestore();

      db.collection('configuracoes')
        .doc('cardapio')
        .onSnapshot(
          function (snap) {
            state.online = true;
            if (snap.exists) {
              var data = snap.data() || {};
              var pratos = Array.isArray(data.pratos) ? data.pratos : [];
              if (pratos.length > 0) {
                var mapped = pratos
                  .map(function (p, idx) {
                    var price = parsePrice(p.preco || p.price || p.valor);
                    var promo = parsePrice(p.precoPromocional || p.promoPrice || p.oferta);
                    return {
                      code: String(p.codigo || p.code || 500 + idx),
                      name: String(p.nome || p.name || '').trim(),
                      category: normalizeCategory(p.categoria || p.category),
                      unit: String(p.unidade || p.unit || 'Unidade').trim(),
                      price: price > 0 ? price : 49.9,
                      promoPrice: promo > 0 && promo < price ? promo : null,
                      badge: String(p.badge || p.destaque || (promo > 0 ? 'OFERTA DO DIA' : '')).trim(),
                      description: String(p.descricao || p.desc || '').trim()
                    };
                  })
                  .filter(function (i) {
                    return i.name.length > 0;
                  });

                if (mapped.length > 0) {
                  var merged = mapped.slice();
                  DEFAULT_CATALOG.forEach(function (def) {
                    var exists = merged.some(function (m) {
                      return m.name.toLowerCase() === def.name.toLowerCase() || m.code === def.code;
                    });
                    if (!exists) merged.push(def);
                  });
                  state.catalog = merged;
                }
              }
            }
            renderSyncStatus();
            renderModeViews();
            renderTicker();
          },
          function () {
            state.online = false;
            renderSyncStatus();
          }
        );

      db.collection('configuracoes')
        .doc('suporte')
        .onSnapshot(
          function (snap) {
            if (snap.exists) {
              var d = snap.data() || {};
              state.support = { whatsapp: d.whatsapp || '', horario: d.horario || '' };
              renderTicker();
            }
          },
          function () {}
        );
    } catch (e) {}
  }

  // OTA Automático (Tizen / webOS / Web TV)
  function showOtaBanner(text, showApplyBtn) {
    $('ota-banner-text').textContent = text;
    $('btn-ota-apply').classList.toggle('hidden', !showApplyBtn);
    $('ota-banner').classList.remove('hidden');
  }

  function applyWebOtaUpdate() {
    var target = state.pendingOtaUrl || HOSTED_TV_URL;
    var sep = target.indexOf('?') >= 0 ? '&' : '?';
    window.location.href = target + sep + 'ota=' + Date.now();
  }

  function checkOtaUpdates(silent) {
    if (!silent) showOtaBanner('Verificando atualizações OTA para ' + state.platform + '...', false);

    fetch(VERSION_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var remoteVer = data.webVersion || data.version || APP_VERSION;
        var remoteUrl = data.webTvUrl || HOSTED_TV_URL;

        if (isNewerVersion(remoteVer, APP_VERSION)) {
          state.pendingOtaUrl = remoteUrl;
          if (state.autoOta) {
            showOtaBanner(
              'Nova versão v' + remoteVer + ' encontrada! Atualizando painel automaticamente em 3s...',
              true
            );
            setTimeout(applyWebOtaUpdate, 3000);
          } else {
            showOtaBanner('Nova versão v' + remoteVer + ' disponível! Pressione "ATUALIZAR AGORA".', true);
          }
        } else if (!silent) {
          showOtaBanner(
            'Sereia Dourada TV (' + state.platform + ' v' + APP_VERSION + ') já está na versão mais recente!',
            false
          );
          setTimeout(function () {
            $('ota-banner').classList.add('hidden');
          }, 5000);
        }
      })
      .catch(function () {
        if (!silent) showOtaBanner('Não foi possível verificar atualizações agora (sem conexão).', false);
      });
  }

  // Navegação espacial por controle remoto (D-pad Samsung Tizen & LG webOS)
  function getFocusableButtons() {
    var scope = state.menuOpen ? $('menu-modal') : $('tv-root');
    var all = scope.querySelectorAll('[data-tv-focus]');
    var visible = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].offsetParent !== null) visible.push(all[i]);
    }
    return visible;
  }

  function moveFocus(delta) {
    var list = getFocusableButtons();
    if (!list.length) return;
    var activeIdx = list.indexOf(document.activeElement);
    var nextIdx = activeIdx < 0 ? 0 : (activeIdx + delta + list.length) % list.length;
    list[nextIdx].focus();
  }

  function bindEvents() {
    $('btn-mode').addEventListener('click', function () {
      var idx = (MODES.indexOf(state.mode) + 1) % MODES.length;
      state.mode = MODES[idx];
      state.boardStep = 0;
      savePrefs();
      renderModeViews();
    });

    $('btn-pause').addEventListener('click', function () {
      state.paused = !state.paused;
      renderModeViews();
    });

    $('btn-menu').addEventListener('click', openMenu);
    $('btn-close-menu').addEventListener('click', closeMenu);

    $('btn-prev-offer').addEventListener('click', function () {
      var len = getPromoItems().length;
      state.offerIdx = (state.offerIdx - 1 + len) % len;
      state.elapsedMs = 0;
      renderSpotlight();
    });

    $('btn-next-offer').addEventListener('click', function () {
      var len = getPromoItems().length;
      state.offerIdx = (state.offerIdx + 1) % len;
      state.elapsedMs = 0;
      renderSpotlight();
    });

    $('btn-call-next').addEventListener('click', callNextTicket);
    $('btn-next-counter').addEventListener('click', function () {
      state.counterIdx = (state.counterIdx + 1) % COUNTERS.length;
      renderQueue(false);
    });
    $('btn-repeat-ticket').addEventListener('click', function () {
      renderQueue(true);
    });
    $('btn-reset-tickets').addEventListener('click', function () {
      state.ticketNum = 1;
      state.ticketHistory = [];
      renderQueue(false);
    });

    var modeBtns = document.querySelectorAll('[data-set-mode]');
    for (var i = 0; i < modeBtns.length; i++) {
      modeBtns[i].addEventListener('click', function () {
        state.mode = this.getAttribute('data-set-mode');
        state.boardStep = 0;
        savePrefs();
        renderModeViews();
      });
    }

    var speedBtns = document.querySelectorAll('[data-set-speed]');
    for (var j = 0; j < speedBtns.length; j++) {
      speedBtns[j].addEventListener('click', function () {
        state.rotationSec = parseInt(this.getAttribute('data-set-speed'), 10) || 10;
        state.elapsedMs = 0;
        savePrefs();
        renderMenuSelections();
      });
    }

    $('btn-toggle-auto-ota').addEventListener('click', function () {
      state.autoOta = !state.autoOta;
      savePrefs();
      renderMenuSelections();
    });

    $('btn-check-ota').addEventListener('click', function () {
      closeMenu();
      checkOtaUpdates(false);
    });
    $('btn-ota-apply').addEventListener('click', applyWebOtaUpdate);
    $('btn-ota-close').addEventListener('click', function () {
      $('ota-banner').classList.add('hidden');
    });

    // Teclas de Controle Remoto Samsung Tizen + LG webOS + Teclado
    window.addEventListener('keydown', function (e) {
      var code = e.keyCode || e.which;

      // Voltar (Tizen 10009, LG webOS 461, Escape 27, Backspace 8)
      if (code === 10009 || code === 461 || code === 27 || code === 8) {
        if (state.menuOpen) {
          e.preventDefault();
          closeMenu();
          return;
        }
        if (code === 10009 && window.tizen && window.tizen.application) {
          try {
            window.tizen.application.getCurrentApplication().exit();
          } catch (err) {}
        }
        return;
      }

      // Teclas coloridas do controle Samsung/LG
      if (code === 403) {
        e.preventDefault();
        $('btn-mode').click();
        return;
      }
      if (code === 404) {
        e.preventDefault();
        if (state.mode === 'senhas') callNextTicket();
        else $('btn-next-offer').click();
        return;
      }
      if (code === 405 || code === 10252 || code === 19 || code === 415) {
        e.preventDefault();
        $('btn-pause').click();
        return;
      }
      if (code === 406) {
        e.preventDefault();
        if (state.menuOpen) closeMenu();
        else openMenu();
        return;
      }

      // Navegação setas D-pad
      if (code === 37 || code === 38) {
        e.preventDefault();
        moveFocus(-1);
      } else if (code === 39 || code === 40) {
        e.preventDefault();
        moveFocus(1);
      } else if (code === 13) {
        if (document.activeElement && document.activeElement.hasAttribute('data-tv-focus')) {
          e.preventDefault();
          document.activeElement.click();
        }
      }
    });
  }

  // Loop de rotação automática
  function startTimers() {
    renderClock();
    setInterval(renderClock, 1000);

    setInterval(function () {
      if (state.paused || state.menuOpen) return;
      state.elapsedMs += 200;
      var totalMs = state.rotationSec * 1000;
      var pct = Math.min(100, Math.round((state.elapsedMs / totalMs) * 100));
      $('spot-progress').style.width = Math.max(4, pct) + '%';

      if (state.elapsedMs >= totalMs) {
        state.elapsedMs = 0;
        state.offerIdx = (state.offerIdx + 1) % getPromoItems().length;
        state.boardStep = (state.boardStep + 1) % getBoardPages().length;
        renderSpotlight();
        renderBoard();
      }
    }, 200);

    checkOtaUpdates(true);
    setInterval(function () {
      checkOtaUpdates(true);
    }, OTA_POLL_MS);
  }

  window.addEventListener('DOMContentLoaded', function () {
    loadPrefs();
    initPlatformHardware();
    bindEvents();
    renderSyncStatus();
    renderModeViews();
    renderTicker();
    initFirebase();
    startTimers();
    var initial = $('btn-next-offer');
    if (initial) initial.focus();
  });
})();
