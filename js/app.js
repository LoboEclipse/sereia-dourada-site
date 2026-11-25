/**
 * SEREIA DOURADA - SCRIPT OFICIAL
 * Canvas de Partículas Douradas & Modal de Autenticação VIP
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initAuthModal();
  initTilt();
  initSpaceInfoModal();
  initFirebaseAuthListener();
  initMobileAndPWA();
});

function initTilt() {
  const card = document.getElementById('hero-logo-tilt');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

/* Partículas Douradas Flutuantes */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 45;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class GoldParticle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2.2 + 0.8;
      this.speedY = -(Math.random() * 0.45 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.hue = 42 + Math.random() * 8; // Tons dourados
      this.lightness = 55 + Math.random() * 25;
      this.pulse = Math.random() * 0.02 + 0.01;
      this.pulseDir = 1;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;

      this.alpha += this.pulse * this.pulseDir;
      if (this.alpha > 0.85) this.pulseDir = -1;
      if (this.alpha < 0.15) this.pulseDir = 1;

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 85%, ${this.lightness}%, ${this.alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${this.hue}, 100%, 65%, 0.8)`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new GoldParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* Modal Interativo de Autenticação */
function initAuthModal() {
  const modal = document.getElementById('auth-modal');
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const closeBtn = document.getElementById('auth-close-btn');

  const tabLogin = document.getElementById('tab-login-btn');
  const tabRegister = document.getElementById('tab-register-btn');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  if (!modal) return;

  // Inicializa botões de ver/ocultar senha
  initPasswordVisibilityToggles(modal);

  // Garante o bloco de login social (Google e Facebook) caso algum modal não tenha no HTML
  const card = modal.querySelector('.auth-modal-card, .modal-container');
  if (card && !card.querySelector('#auth-social-wrap')) {
    const socialWrap = document.createElement('div');
    socialWrap.id = 'auth-social-wrap';
    socialWrap.className = 'auth-social-wrap';
    socialWrap.innerHTML =
      '<div class="auth-social-divider"><span>ou continue com</span></div>' +
      '<div class="auth-social-buttons">' +
        '<button type="button" class="btn-social-auth btn-social-google" id="btn-login-google">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"/>' +
            '<path fill="#34A853" d="M3.5 7.3l3.2 2.3C7.6 7.6 9.6 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 8.3 2.4 5.1 4.5 3.5 7.3z" opacity="0"/>' +
            '<path fill="#4285F4" d="M21.2 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4c-.3 1.3-1 2.4-2.2 3.1l3.4 2.6c2-1.8 2.6-4.5 2.6-7.6z"/>' +
            '<path fill="#FBBC05" d="M6.7 14.4c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L3.5 7.1C2.8 8.6 2.4 10.2 2.4 12s.4 3.4 1.1 4.9l3.2-2.5z"/>' +
            '<path fill="#34A853" d="M12 21.6c2.6 0 4.8-.9 6.4-2.4l-3.4-2.6c-.9.6-2 .9-3 .9-2.4 0-4.4-1.6-5.1-3.8l-3.2 2.5C5.2 19.4 8.3 21.6 12 21.6z"/>' +
          '</svg>' +
          '<span>Google</span>' +
        '</button>' +
        '<button type="button" class="btn-social-auth btn-social-facebook" id="btn-login-facebook">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z"/>' +
          '</svg>' +
          '<span>Facebook</span>' +
        '</button>' +
      '</div>';
    card.appendChild(socialWrap);
  }

  // Cria elemento de feedback dinamicamente se não existir no modal
  let feedbackEl = document.getElementById('auth-feedback');
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.id = 'auth-feedback';
    feedbackEl.className = 'auth-feedback-msg';
    if (card) card.appendChild(feedbackEl);
  }

  function setFeedback(msg, type = 'error') {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg;
    feedbackEl.className = `auth-feedback-msg ${type}`;
  }

  function clearFeedback() {
    if (!feedbackEl) return;
    feedbackEl.textContent = '';
    feedbackEl.className = 'auth-feedback-msg';
  }

  function openModal(mode) {
    clearFeedback();
    modal.classList.add('active');
    if (mode === 'register') {
      showRegister();
    } else {
      showLogin();
    }
  }

  function closeModal() {
    clearFeedback();
    modal.classList.remove('active');
    resetPasswordVisibility(modal);
  }

  function showLogin() {
    clearFeedback();
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.style.display = 'flex';
    formRegister.style.display = 'none';
  }

  function showRegister() {
    clearFeedback();
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formRegister.style.display = 'flex';
    formLogin.style.display = 'none';
  }

  const heroBookBtn = document.getElementById('hero-book-btn');
  // hero-book-btn navega diretamente para /reserva

  if (btnLogin) btnLogin.addEventListener('click', () => openModal('login'));
  if (btnRegister) btnRegister.addEventListener('click', () => openModal('register'));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (tabLogin) tabLogin.addEventListener('click', showLogin);
  if (tabRegister) tabRegister.addEventListener('click', showRegister);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Sistema de Proteção contra Força Bruta & Credential Stuffing (OWASP A07)
  const AuthRateLimiter = {
    getStorageKey(em) {
      return 'sereia_auth_rate_' + (em ? em.toLowerCase().trim().replace(/[^a-z0-9]/g, '_') : 'global');
    },
    getRecord(em) {
      try {
        return JSON.parse(sessionStorage.getItem(this.getStorageKey(em))) || { count: 0, lockUntil: 0 };
      } catch(e) {
        return { count: 0, lockUntil: 0 };
      }
    },
    isLocked(em) {
      const rec = this.getRecord(em);
      const now = Date.now();
      if (rec.lockUntil && rec.lockUntil > now) {
        return Math.ceil((rec.lockUntil - now) / 1000);
      }
      return 0;
    },
    recordFail(em) {
      const rec = this.getRecord(em);
      rec.count = (rec.count || 0) + 1;
      const now = Date.now();
      if (rec.count >= 5) {
        const lockSeconds = rec.count >= 8 ? 120 : (rec.count >= 6 ? 60 : 30);
        rec.lockUntil = now + (lockSeconds * 1000);
      }
      try {
        sessionStorage.setItem(this.getStorageKey(em), JSON.stringify(rec));
      } catch(e) {}
    },
    recordSuccess(em) {
      try {
        sessionStorage.removeItem(this.getStorageKey(em));
      } catch(e) {}
    }
  };

  // Conectar Formulário de Login com Firebase Auth
  if (formLogin) {
    formLogin.onsubmit = async (e) => {
      e.preventDefault();
      clearFeedback();
      const email = (document.getElementById('login-email')?.value || '').trim();
      const pass = document.getElementById('login-password')?.value || '';
      const submitBtn = formLogin.querySelector('button[type="submit"]');

      if (!email || !pass) {
        setFeedback("Por favor, preencha todos os campos.", "error");
        return;
      }

      // 1. Verificação de Bloqueio por Força Bruta
      const lockSeconds = AuthRateLimiter.isLocked(email);
      if (lockSeconds > 0) {
        setFeedback(`Muitas tentativas incorretas. Por segurança, aguarde ${lockSeconds} segundos.`, "error");
        return;
      }

      // 2. Validação de Formato de E-mail
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
        setFeedback("Formato de e-mail inválido.", "error");
        return;
      }

      const origText = submitBtn.textContent;
      submitBtn.textContent = "Acessando...";
      submitBtn.classList.add('auth-btn-loading');

      try {
        if (typeof window.loginUsuarioVIP !== 'function') {
          throw new Error("Sistema de autenticação inicializando...");
        }
        await window.loginUsuarioVIP(email, pass);
        AuthRateLimiter.recordSuccess(email);
        setFeedback("✦ Acesso autorizado com sucesso!", "success");
        setTimeout(() => {
          closeModal();
          formLogin.reset();
        }, 1200);
      } catch (err) {
        AuthRateLimiter.recordFail(email);
        const msg = typeof window.traduzirErroFirebase === 'function' 
          ? window.traduzirErroFirebase(err) 
          : (err.message || "Erro ao entrar.");
        setFeedback(msg, "error");
      } finally {
        submitBtn.textContent = origText;
        submitBtn.classList.remove('auth-btn-loading');
      }
    };
  }

  // Conectar Formulário de Registro com Firebase Auth e Firestore
  if (formRegister) {
    formRegister.onsubmit = async (e) => {
      e.preventDefault();
      clearFeedback();
      const name = (document.getElementById('reg-name')?.value || '').trim().slice(0, 100);
      const email = (document.getElementById('reg-email')?.value || '').trim().toLowerCase().slice(0, 120);
      const pass = document.getElementById('reg-password')?.value || '';
      const submitBtn = formRegister.querySelector('button[type="submit"]');

      if (!name || !email || !pass) {
        setFeedback("Por favor, preencha todos os campos.", "error");
        return;
      }

      // Validação de E-mail
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFeedback("Por favor, insira um e-mail válido.", "error");
        return;
      }

      // Validação de Senha Forte (mínimo 8 caracteres, letras e números)
      if (pass.length < 8 || !/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) {
        setFeedback("A senha deve ter no mínimo 8 caracteres e conter letras e números.", "error");
        return;
      }

      const origText = submitBtn.textContent;
      submitBtn.textContent = "Cadastrando...";
      submitBtn.classList.add('auth-btn-loading');

      try {
        if (typeof window.cadastrarUsuarioVIP !== 'function') {
          throw new Error("Sistema de autenticação inicializando...");
        }
        await window.cadastrarUsuarioVIP(name, email, pass);
        setFeedback("✦ Conta criada com sucesso! Enviamos um e-mail de boas-vindas oficial para você.", "success");
        setTimeout(() => {
          closeModal();
          formRegister.reset();
        }, 1400);
      } catch (err) {
        const msg = typeof window.traduzirErroFirebase === 'function' 
          ? window.traduzirErroFirebase(err) 
          : (err.message || "Erro ao criar conta.");
        setFeedback(msg, "error");
      } finally {
        submitBtn.textContent = origText;
        submitBtn.classList.remove('auth-btn-loading');
      }
    };
  }

  // Conectar Login Social com Google e Facebook
  async function handleSocialAuth(providerName, btnEl, authFn) {
    clearFeedback();
    if (typeof authFn !== 'function') {
      setFeedback("Sistema de autenticação inicializando...", "error");
      return;
    }

    const labelSpan = btnEl ? btnEl.querySelector('span') : null;
    const origLabel = labelSpan ? labelSpan.textContent : providerName;
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.classList.add('auth-btn-loading');
    }
    if (labelSpan) labelSpan.textContent = "Conectando...";

    try {
      const user = await authFn();
      if (user) {
        setFeedback(`✦ Conectado com ${providerName} com sucesso!`, "success");
        setTimeout(() => {
          closeModal();
        }, 1000);
      }
    } catch (err) {
      const msg = typeof window.traduzirErroFirebase === 'function'
        ? window.traduzirErroFirebase(err)
        : (err.message || `Erro ao entrar com ${providerName}.`);
      setFeedback(msg, "error");
    } finally {
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.classList.remove('auth-btn-loading');
      }
      if (labelSpan) labelSpan.textContent = origLabel;
    }
  }

  const btnGoogle = modal.querySelector('#btn-login-google');
  const btnFacebook = modal.querySelector('#btn-login-facebook');

  if (btnGoogle) {
    btnGoogle.onclick = () => handleSocialAuth('Google', btnGoogle, window.loginComGoogleVIP);
  }
  if (btnFacebook) {
    btnFacebook.onclick = () => handleSocialAuth('Facebook', btnFacebook, window.loginComFacebookVIP);
  }
}

/**
 * Controla os botões de alternância de visibilidade da senha (olho mágico)
 */
function initPasswordVisibilityToggles(root = document) {
  root.querySelectorAll('.btn-toggle-password').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';

      const iconShow = btn.querySelector('.eye-icon-show');
      const iconHide = btn.querySelector('.eye-icon-hide');

      if (isPass) {
        if (iconShow) iconShow.style.display = 'none';
        if (iconHide) iconHide.style.display = 'block';
        btn.setAttribute('title', 'Ocultar senha');
        btn.setAttribute('aria-label', 'Ocultar senha');
      } else {
        if (iconShow) iconShow.style.display = 'block';
        if (iconHide) iconHide.style.display = 'none';
        btn.setAttribute('title', 'Ver senha');
        btn.setAttribute('aria-label', 'Ver senha');
      }
    };
  });
}

/**
 * Reseta todos os campos de senha para o estado oculto padrão
 */
function resetPasswordVisibility(root = document) {
  root.querySelectorAll('.btn-toggle-password').forEach(btn => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (input) input.type = 'password';

    const iconShow = btn.querySelector('.eye-icon-show');
    const iconHide = btn.querySelector('.eye-icon-hide');
    if (iconShow) iconShow.style.display = 'block';
    if (iconHide) iconHide.style.display = 'none';
    btn.setAttribute('title', 'Ver senha');
    btn.setAttribute('aria-label', 'Ver senha');
  });
}

window.initPasswordVisibilityToggles = initPasswordVisibilityToggles;
window.resetPasswordVisibility = resetPasswordVisibility;

/* Observador de Estado de Autenticação em Tempo Real */
function initFirebaseAuthListener() {
  if (typeof firebase === 'undefined' || !firebase.auth) {
    setTimeout(initFirebaseAuthListener, 300);
    return;
  }

  firebase.auth().onAuthStateChanged((user) => {
    const headerActions = document.querySelector('.header-actions');

    if (user) {
      document.documentElement.classList.add('auth-session-active');

      // Helper para extrair apenas o primeiro nome (deixando a barra compacta)
      function extrairPrimeiroNome(nomeCompleto) {
        if (!nomeCompleto) return 'CLIENTE';
        const partes = nomeCompleto.trim().split(/\s+/);
        return (partes[0] || 'CLIENTE').toUpperCase();
      }

      // Função para salvar sessão localmente para carregamento instantâneo sem flash
      function salvarSessaoCache(uData) {
        try {
          const sessAtual = JSON.parse(localStorage.getItem('sereia_auth_session') || '{}');
          const merged = Object.assign({}, sessAtual, uData);
          localStorage.setItem('sereia_auth_session', JSON.stringify(merged));
        } catch(e) {}
      }

      // 1. Tenta pegar nome e foto do cache imediato do localStorage
      let cachedName = localStorage.getItem('sereia_vip_nome_' + user.uid);
      let cachedFoto = localStorage.getItem('sereia_vip_foto_' + user.uid);
      let isUserAdmin = localStorage.getItem('sereia_admin_' + user.uid) === 'true';

      let rawName = cachedName || user.displayName || (user.email ? user.email.split('@')[0] : 'Cliente');
      let primeiroNome = extrairPrimeiroNome(rawName);
      let safeCachedFoto = typeof sanitizarUrlImagem === 'function' ? sanitizarUrlImagem(cachedFoto) : (cachedFoto ? String(cachedFoto).replace(/"/g, '&quot;') : '');
      let avatarHtml = safeCachedFoto 
        ? `<img src="${safeCachedFoto}" alt="Foto de perfil">` 
        : `<span style="font-size: 1rem;">👑</span>`;


      // Salva sessão localmente para evitar qualquer piscada de tela ao mudar de página
      salvarSessaoCache({
        uid: user.uid,
        email: user.email || '',
        nome: rawName,
        primeiroNome: primeiroNome,
        foto: cachedFoto || '',
        isAdmin: isUserAdmin
      });

      if (headerActions) {
        // Renderiza o componente com Sino de Notificações e Dropdown do Perfil
        headerActions.innerHTML = `
          <div class="header-user-actions-group">
            <!-- Sino de Notificações VIP -->
            <div class="notif-menu-container" id="notif-menu-container">
              <button class="notif-bell-btn" id="notif-bell-btn" type="button" aria-expanded="false" title="Notificações">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="notif-badge-count" id="notif-badge-count" style="display: none;">0</span>
              </button>

              <div class="notif-dropdown-card" id="notif-dropdown-card">
                <div class="notif-dropdown-header">
                  <span class="notif-header-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    NOTIFICAÇÕES
                  </span>
                  <button class="btn-clear-notifs" id="btn-mark-all-read" type="button">Marcar lidas</button>
                </div>
                <div class="notif-list-body" id="notif-dropdown-list">
                  <div class="notif-empty-state">
                    <div class="notif-empty-icon">⚜</div>
                    <p class="notif-empty-text">Nenhuma notificação no momento.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Menu de Usuário Dropdown -->
            <div class="user-menu-container" id="user-menu-container">
              <button class="user-menu-trigger" id="user-menu-trigger" type="button" aria-expanded="false" title="Menu da Conta">
                <span class="user-menu-name" id="header-user-display-name">${primeiroNome}</span>
                <span class="user-menu-avatar" id="header-avatar-wrap">${avatarHtml}</span>
                <span class="user-menu-chevron" id="user-menu-chevron">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>

              <div class="user-dropdown-card" id="user-dropdown-card">
                <div class="user-dropdown-header">
                  <div class="user-dropdown-name" id="dropdown-user-name">${rawName}</div>
                  <div class="user-dropdown-email">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span id="dropdown-user-email">${user.email || 'cliente@sereiadourada.com'}</span>
                  </div>
                </div>

                <div class="user-dropdown-divider"></div>

                <div class="user-dropdown-items">
                  <a href="/sereia-dourada-site/perfil" class="user-dropdown-item" id="dropdown-link-reservas">
                    <span class="dropdown-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                    </span>
                    <span class="dropdown-item-text">Minhas Reservas</span>
                  </a>

                  <a href="/sereia-dourada-site/perfil" class="user-dropdown-item" id="dropdown-link-perfil">
                    <span class="dropdown-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <span class="dropdown-item-text">Meu Perfil</span>
                  </a>

                  <div id="dropdown-admin-wrapper" style="${isUserAdmin ? 'display: block;' : 'display: none;'}">
                    <a href="/sereia-dourada-site/admin" class="user-dropdown-item dropdown-item-admin" id="dropdown-link-admin">
                      <span class="dropdown-item-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </span>
                      <span class="dropdown-item-text">Painel Admin</span>
                      <span class="admin-tag-pill">ADM</span>
                    </a>
                  </div>
                </div>

                <div class="user-dropdown-divider"></div>

                <button class="user-dropdown-item dropdown-item-logout" id="btn-logout" type="button">
                  <span class="dropdown-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </span>
                  <span class="dropdown-item-text">Sair</span>
                </button>
              </div>
            </div>
          </div>
        `;

        // Controle de abertura/fechamento do menu dropdown do perfil
        const menuContainer = document.getElementById('user-menu-container');
        const menuTrigger = document.getElementById('user-menu-trigger');

        if (menuTrigger && menuContainer) {
          menuTrigger.onclick = (e) => {
            e.stopPropagation();
            const notifContainer = document.getElementById('notif-menu-container');
            if (notifContainer) notifContainer.classList.remove('active');
            menuContainer.classList.toggle('active');
          };

          document.addEventListener('click', (e) => {
            if (!menuContainer.contains(e.target)) {
              menuContainer.classList.remove('active');
            }
          });
        }

        // Inicializa o sistema de notificações em tempo real
        iniciarSistemaNotificacoes(user, isUserAdmin);
      }

      // 2. Consulta Firestore para obter Nome Completo, Foto e Privilégio Admin reais
      if (window.obterPerfilUsuarioVIP) {
        window.obterPerfilUsuarioVIP(user.uid).then(perfil => {
          if (perfil) {
            let nomeFinal = perfil.nome || rawName;
            let primeiroNomeFinal = extrairPrimeiroNome(nomeFinal);
            let fotoFinal = perfil.fotoUrl || cachedFoto || '';

            if (perfil.nome) {
              const nameEl = document.getElementById('header-user-display-name');
              if (nameEl) nameEl.textContent = primeiroNomeFinal;
              const dropNameEl = document.getElementById('dropdown-user-name');
              if (dropNameEl) dropNameEl.textContent = nomeFinal;
            }
            if (perfil.fotoUrl) {
              const wrap = document.getElementById('header-avatar-wrap');
              const safeFoto = typeof sanitizarUrlImagem === 'function' ? sanitizarUrlImagem(perfil.fotoUrl) : null;
              if (wrap && safeFoto) wrap.innerHTML = `<img src="${safeFoto}" alt="Foto">`;
            }
            // Verifica privilégio de Administrador estritamente pelo documento do Firestore
            const isAdm = typeof window.verificarUsuarioAdmin === 'function' 
              ? window.verificarUsuarioAdmin(user, perfil) 
              : (perfil && (perfil.isAdmin === true || perfil.perfil === 'admin' || perfil.role === 'admin'));
            const adminWrapper = document.getElementById('dropdown-admin-wrapper');
            if (adminWrapper) {
              adminWrapper.style.display = isAdm ? 'block' : 'none';
            }

            if (isAdm) {
              localStorage.setItem('sereia_admin_' + user.uid, 'true');
            } else {
              localStorage.removeItem('sereia_admin_' + user.uid);
            }

            // Atualiza sessão persistida com os dados confirmados do Firestore
            salvarSessaoCache({
              nome: nomeFinal,
              primeiroNome: primeiroNomeFinal,
              foto: fotoFinal,
              isAdmin: isAdm
            });

            // Re-sincroniza notificações com o papel de admin confirmado
            iniciarSistemaNotificacoes(user, isAdm);
          }
        }).catch(() => {});
      }

      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
          try {
            if (unsubNotificacoes) {
              unsubNotificacoes();
              unsubNotificacoes = null;
            }
            localStorage.removeItem('sereia_auth_session');
            localStorage.removeItem('sereia_admin_' + user.uid);
            document.documentElement.classList.remove('auth-session-active');
          } catch(e) {}
          if (window.logoutUsuarioVIP) {
            await window.logoutUsuarioVIP();
            window.location.reload();
          }
        });
      }
    } else {
      try {
        if (unsubNotificacoes) {
          unsubNotificacoes();
          unsubNotificacoes = null;
        }
        localStorage.removeItem('sereia_auth_session');
        document.documentElement.classList.remove('auth-session-active');
      } catch(e) {}

      if (headerActions) {
        headerActions.innerHTML = `
          <button class="btn-auth-login" id="btn-login" type="button">Entrar</button>
        `;
      }
      const btnLogin = document.getElementById('btn-login');
      const btnRegister = document.getElementById('btn-register');
      const modal = document.getElementById('auth-modal');
      if (modal && btnLogin) {
        btnLogin.addEventListener('click', () => {
          modal.classList.add('active');
          const tabLogin = document.getElementById('tab-login-btn');
          if (tabLogin) tabLogin.click();
        });
      }
      if (modal && btnRegister) {
        btnRegister.addEventListener('click', () => {
          modal.classList.add('active');
          const tabRegister = document.getElementById('tab-register-btn');
          if (tabRegister) tabRegister.click();
        });
      }
    }
  });
}

/**
 * ============================================================================
 * MOTOR DE NOTIFICAÇÕES EM TEMPO REAL NO FRONT-END
 * ============================================================================
 */

let unsubNotificacoes = null;
let notificacoesCarregadasInicialmente = false;
let idsNotificacoesConhecidas = new Set();

function iniciarSistemaNotificacoes(user, isAdmin) {
  if (unsubNotificacoes) {
    unsubNotificacoes();
    unsubNotificacoes = null;
  }
  notificacoesCarregadasInicialmente = false;
  idsNotificacoesConhecidas.clear();

  if (!user) return;

  // Lista unificada de alvos autorizados pelas regras do Firestore (UID, e-mail e 'admin' se ADM)
  const alvos = [user.uid];
  if (user.email) {
    const cleanEmail = user.email.toLowerCase().trim();
    if (!alvos.includes(cleanEmail)) alvos.push(cleanEmail);
  }
  if (isAdmin && !alvos.includes('admin')) {
    alvos.push('admin');
  }

  // Ouvinte de abertura do menu do sino
  const notifContainer = document.getElementById('notif-menu-container');
  const notifBtn = document.getElementById('notif-bell-btn');
  const btnMarkAll = document.getElementById('btn-mark-all-read');

  if (notifBtn && notifContainer) {
    notifBtn.onclick = (e) => {
      e.stopPropagation();
      const userMenu = document.getElementById('user-menu-container');
      if (userMenu) userMenu.classList.remove('active');
      notifContainer.classList.toggle('active');
    };

    document.addEventListener('click', (e) => {
      if (!notifContainer.contains(e.target)) {
        notifContainer.classList.remove('active');
      }
    });
  }

  if (btnMarkAll) {
    btnMarkAll.onclick = async (e) => {
      e.stopPropagation();
      btnMarkAll.textContent = 'Limpando...';
      if (typeof window.marcarTodasNotificacoesComoLidas === 'function') {
        await window.marcarTodasNotificacoesComoLidas(alvos);
      }
      btnMarkAll.textContent = 'Marcar lidas';
    };
  }

  // Escuta notificações em tempo real do Firestore para todos os alvos do usuário
  if (typeof window.escutarNotificacoes === 'function') {
    unsubNotificacoes = window.escutarNotificacoes(alvos, (notifs) => {
      renderizarNotificacoesHeader(notifs, alvos);

      // Exibe toast flutuante e toca sino para notificações que chegam ao vivo enquanto navega
      if (notificacoesCarregadasInicialmente) {
        notifs.forEach(n => {
          if (!n.lida && !idsNotificacoesConhecidas.has(n.id)) {
            exibirToastNotificacaoAoVivo(n);
          }
        });
      } else {
        notificacoesCarregadasInicialmente = true;
      }

      notifs.forEach(n => idsNotificacoesConhecidas.add(n.id));
    });
  }
}

function renderizarNotificacoesHeader(notifs, destinatario) {
  const badge = document.getElementById('notif-badge-count');
  const list = document.getElementById('notif-dropdown-list');

  const unreadCount = notifs.filter(n => !n.lida).length;

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  if (list) {
    if (!notifs || notifs.length === 0) {
      list.innerHTML = `
        <div class="notif-empty-state">
          <div class="notif-empty-icon">⚜</div>
          <p class="notif-empty-text">Nenhuma notificação no momento.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = notifs.map(n => {
      const isUnread = !n.lida;
      const icon = n.tipo === 'nova_reserva' ? '🛎️' : (n.tipo === 'reserva_aprovada' ? '⚜️' : '📌');
      const tempoRelativo = formatarTempoNotificacao(n.criadoEm);

      return `
        <div class="notif-item ${isUnread ? 'unread' : ''}" onclick="clicarNotificacao('${n.id}', '${n.link || '/'}')">
          <div class="notif-item-icon-wrap">${icon}</div>
          <div class="notif-item-content">
            <div class="notif-item-top">
              <span class="notif-item-title">${escapeHtml(n.titulo || 'Notificação')}</span>
              ${isUnread ? '<span class="notif-unread-dot" title="Não lida"></span>' : ''}
            </div>
            <p class="notif-item-msg">${escapeHtml(n.mensagem || '')}</p>
            <span class="notif-item-time">${tempoRelativo}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

window.clicarNotificacao = async function(notifId, link) {
  if (typeof window.marcarNotificacaoComoLida === 'function') {
    await window.marcarNotificacaoComoLida(notifId);
  }
  if (link && link !== '#') {
    window.location.href = link;
  }
};

function formatarTempoNotificacao(timestamp) {
  if (!timestamp) return 'Recentemente';
  let date = null;
  if (timestamp.toDate) date = timestamp.toDate();
  else if (timestamp.toMillis) date = new Date(timestamp.toMillis());
  else date = new Date(timestamp);

  const agora = new Date();
  const diffSeg = Math.floor((agora - date) / 1000);

  if (diffSeg < 60) return 'Agora mesmo';
  const diffMin = Math.floor(diffSeg / 60);
  if (diffMin < 60) return `Há ${diffMin} min`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `Há ${diffHoras}h`;
  const diffDias = Math.floor(diffHoras / 24);
  return `Há ${diffDias} dias`;
}

function tocarSinoDourado() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

function exibirToastNotificacaoAoVivo(notif) {
  tocarSinoDourado();

  const bell = document.getElementById('notif-bell-btn');
  if (bell) {
    bell.classList.remove('ringing');
    void bell.offsetWidth;
    bell.classList.add('ringing');
  }

  let container = document.getElementById('notif-live-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notif-live-toast-container';
    container.className = 'notif-live-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'notif-live-toast';

  const icon = notif.tipo === 'nova_reserva' ? '🛎️' : '⚜️';
  const actionText = notif.link === '/sereia-dourada-site/admin' ? 'Ver no Painel Admin' : 'Ver em Minhas Reservas';

  toast.innerHTML = `
    <div class="notif-toast-icon">${icon}</div>
    <div class="notif-toast-body">
      <div class="notif-toast-title">${escapeHtml(notif.titulo || 'Nova Notificação')}</div>
      <div class="notif-toast-desc">${escapeHtml(notif.mensagem || '')}</div>
      <a href="${notif.link || '/'}" class="notif-toast-action-btn" onclick="clicarNotificacao('${notif.id}', '${notif.link || '/'}')">${actionText}</a>
    </div>
    <button class="notif-toast-close" type="button" aria-label="Fechar">&times;</button>
  `;

  const closeBtn = toast.querySelector('.notif-toast-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    };
  }

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }
  }, 7000);
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

function sanitizarUrlImagem(url) {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(clean)) {
    return clean;
  }
  if (/^https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/i.test(clean)) {
    if (!clean.includes('"') && !clean.includes("'") && !clean.includes('<') && !clean.includes('>')) {
      return clean;
    }
  }
  if (/^assets\/[a-zA-Z0-9_\-\.\/]+$/i.test(clean)) {
    return clean;
  }
  return null;
}
window.sanitizarUrlImagem = sanitizarUrlImagem;

/* Modal de Informações dos Espaços (Pousada, Camping e Restaurante) */
function initSpaceInfoModal() {
  const modal = document.getElementById('space-info-modal');
  const closeBtn = document.getElementById('space-info-close-btn');
  const openButtons = document.querySelectorAll('.btn-open-space-modal');

  const imgEl = document.getElementById('modal-space-img');
  const badgeEl = document.getElementById('modal-space-badge');
  const iconEl = document.getElementById('modal-space-icon');
  const categoryEl = document.getElementById('modal-space-category');
  const titleEl = document.getElementById('modal-space-title');
  const descEl = document.getElementById('modal-space-desc');
  const listEl = document.getElementById('modal-space-list');
  const ctaBtn = document.getElementById('modal-space-cta');

  if (!modal) return;

  const spacesData = {
    pousada: {
      badge: 'Pousada',
      icon: '🏡',
      category: 'Hospedagem de Charme & Descanso',
      title: 'Quartos Aconchegantes na Natureza',
      desc: 'Um refúgio exclusivo de tranquilidade e sofisticação rústica, pensado nos mínimos detalhes para o seu bem-estar, lazer e descanso revigorante.',
      img: 'assets/pousada.jpg',
      features: [
        'Quartos amplos e climatizados com arquitetura em madeira nobre e acabamento premium.',
        'Cama king-size confortável com enxoval de alto padrão e travesseiros macios.',
        'Grandes janelas panorâmicas com vista privilegiada para os jardins verdes privativos.',
        'Banheiro privativo completo com ducha aquecida e amenidades de banho artesanais.',
        'Café da manhã artesanal incluso, com delícias regionais frescas preparadas diariamente.',
        'Wi-Fi de alta velocidade, frigobar silencioso e serviço de quarto com hospitalidade acolhedora.'
      ],
      ctaText: 'RESERVAR MEU QUARTO',
      ctaAction: 'auth'
    },
    camping: {
      badge: 'Camping',
      icon: '⛺',
      category: 'Ecoturismo & Contato com a Natureza',
      title: 'Área de Camping & Glamping sob as Estrelas',
      desc: 'Viva a autêntica liberdade de acampar cercado pela flora nativa, com segurança total e estrutura de apoio completa para você e sua família.',
      img: 'assets/camping.jpg',
      features: [
        'Espaço arborizado, gramado e bem nivelado para barracas e equipamentos de acampamento.',
        'Iluminação charmosa com cordões de luzes, decks de madeira e pontos de energia elétrica.',
        'Vestiários e banheiros completos e higienizados, com duchas quentes 24 horas por dia.',
        'Área de convivência com fogueira central ao entardecer sob o céu estrelado.',
        'Pia comunitária, pontos de água potável e área de descarte ecológico consciente.',
        'Segurança 24 horas no local, estacionamento privativo e trilhas verdes para caminhada.'
      ],
      ctaText: 'RESERVAR ESPAÇO DE CAMPING',
      ctaAction: 'auth'
    },
    restaurante: {
      badge: 'Restaurante',
      icon: '🍽️',
      category: 'Alta Gastronomia & Experiência Culinária',
      title: 'Restaurante Exclusivo Sereia Dourada',
      desc: 'Culinária autoral e afetiva em ambiente intimista à luz de velas e lareira rústica, celebrando os melhores sabores da culinária selecionada.',
      img: 'assets/restaurante.jpg',
      features: [
        'Cardápio autoral elaborado com ingredientes frescos e cortes especiais de alta culinária.',
        'Carta de vinhos nobres e destilados selecionados para harmonizações perfeitas.',
        'Drinks autorais e coquetelaria artesanal com essências naturais e botânicos.',
        'Ambiente intimista acolhedor com lareira rústica de pedra e iluminação dourada.',
        'Atendimento especial para almoços, jantares românticos e celebrações inesquecíveis.',
        'Opções vegetarianas, sobremesas exclusivas e menu degustação sob reserva.'
      ],
      ctaText: 'CONHECER CARDÁPIO & EXPERIÊNCIAS',
      ctaAction: 'link',
      ctaLink: '/sereia-dourada-site/cardapio'
    }
  };

  function openSpaceModal(spaceKey) {
    const data = spacesData[spaceKey];
    if (!data) return;

    imgEl.src = data.img;
    imgEl.alt = data.title;
    badgeEl.textContent = data.badge;
    iconEl.textContent = data.icon;
    categoryEl.textContent = data.category;
    titleEl.textContent = data.title;
    descEl.textContent = data.desc;
    ctaBtn.textContent = data.ctaText;

    listEl.innerHTML = '';
    data.features.forEach(feat => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="info-feature-bullet">✦</span><span>${feat}</span>`;
      listEl.appendChild(li);
    });

    ctaBtn.onclick = () => {
      closeSpaceModal();
      if (data.ctaAction === 'link') {
        window.location.href = data.ctaLink;
      } else {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
          authModal.classList.add('active');
          const tabRegister = document.getElementById('tab-register-btn');
          if (tabRegister) tabRegister.click();
        }
      }
    };

    const card = modal.querySelector('.info-modal-card');
    if (card) card.scrollTop = 0;

    modal.classList.add('active');
  }

  function closeSpaceModal() {
    modal.classList.remove('active');
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const spaceKey = btn.getAttribute('data-space');
      openSpaceModal(spaceKey);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeSpaceModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSpaceModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeSpaceModal();
    }
  });
}

/**
 * ==============================================================================
 * SISTEMA MOBILE & PROGRESSIVE WEB APP (PWA)
 * Controle do Menu Drawer Lateral, Registro do Service Worker e Instalação
 * ==============================================================================
 */
function initMobileAndPWA() {
  // 1. Menu Lateral Mobile (Off-Canvas Drawer)
  const hamburgerBtn = document.getElementById('mobile-hamburger-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const closeBtn = document.getElementById('mobile-drawer-close');
  const drawerLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer() {
    if (drawer) {
      const userMenu = document.getElementById('user-menu-container');
      if (userMenu) userMenu.classList.remove('active');
      const notifMenu = document.getElementById('notif-menu-container');
      if (notifMenu) notifMenu.classList.remove('active');

      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeDrawer() {
    if (drawer) {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });


  // 2. Registro e Ciclo de Atualização Automática do Service Worker (PWA)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sereia-dourada-site/sw.js', { scope: '/' })
        .then(reg => {
          console.log('👑 [PWA] Service Worker Sereia Dourada registrado com sucesso:', reg.scope);
          initAutoUpdateSystem(reg);
        })
        .catch(err => {
          console.warn('⚠️ [PWA] Aviso no registro do Service Worker:', err);
        });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('🔄 [PWA] Novo Service Worker ativo. Recarregando página com a versão mais recente...');
        window.location.reload();
      }
    });
  }

  function initAutoUpdateSystem(reg) {
    // Escuta quando uma nova versão do site for encontrada no servidor
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('✨ [PWA] Nova versão detectada! Atualizando automaticamente...');
          showAutoUpdateBanner(newWorker);
        }
      });
    });

    // Função de verificação contínua
    const checkUpdates = () => {
      try {
        reg.update().catch(() => {});
      } catch (e) {}
    };

    // Atualiza automaticamente quando o usuário retorna ao aplicativo no celular (Android ou iPhone)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkUpdates();
      }
    });
    window.addEventListener('focus', checkUpdates);

    // Checagem periódica em segundo plano a cada 15 minutos
    setInterval(checkUpdates, 15 * 60 * 1000);
  }

  function showAutoUpdateBanner(worker) {
    // Notifica o usuário e aplica imediatamente a atualização
    const banner = document.createElement('div');
    banner.className = 'notif-live-toast';
    banner.style.position = 'fixed';
    banner.style.bottom = '20px';
    banner.style.top = 'auto';
    banner.style.right = '20px';
    banner.style.zIndex = '99999';
    banner.style.maxWidth = '360px';
    banner.style.boxShadow = '0 10px 40px rgba(0,0,0,0.9), 0 0 25px rgba(212,175,55,0.4)';
    banner.innerHTML = `
      <div class="notif-toast-icon">✨</div>
      <div class="notif-toast-body">
        <div class="notif-toast-title">Atualização Automática</div>
        <div class="notif-toast-desc">Uma nova versão do Sereia Dourada foi instalada. Atualizando seu aplicativo...</div>
        <button type="button" class="notif-toast-action-btn" id="btn-apply-update">Atualizar Agora</button>
      </div>
    `;
    document.body.appendChild(banner);

    const applyBtn = banner.querySelector('#btn-apply-update');
    if (applyBtn) {
      applyBtn.onclick = () => {
        worker.postMessage({ type: 'SKIP_WAITING' });
      };
    }

    // Auto-aplica após 3.5 segundos se o usuário não clicar
    setTimeout(() => {
      try {
        worker.postMessage({ type: 'SKIP_WAITING' });
      } catch (e) {}
    }, 3500);
  }

  // 3. Sistema Adaptativo para Android e iOS (iPhone)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const installButtons = document.querySelectorAll('.btn-pwa-install, #btn-pwa-install-mobile');
  let deferredInstallPrompt = null;

  // Se já estiver rodando instalado em modo tela cheia / standalone, esconde botões de instalar
  if (isStandalone) {
    installButtons.forEach(btn => btn.style.display = 'none');
  } else if (isIOS) {
    // No iOS (Safari), não existe o evento beforeinstallprompt nativo do Chrome
    installButtons.forEach(btn => {
      btn.style.display = 'inline-flex';
      btn.innerHTML = '<span>📲</span> Instalar no iPhone';
      btn.onclick = (e) => {
        e.preventDefault();
        showIOSInstallInstructions();
      };
    });
  }

  // Android / Chrome: Captura do evento de instalação
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (!isStandalone) {
      installButtons.forEach(btn => {
        btn.style.display = 'inline-flex';
        btn.innerHTML = '<span>📲</span> Instalar Aplicativo';
        btn.onclick = async () => {
          if (!deferredInstallPrompt) return;
          deferredInstallPrompt.prompt();
          const { outcome } = await deferredInstallPrompt.userChoice;
          console.log('[PWA] Instalação selecionada:', outcome);
          deferredInstallPrompt = null;
          installButtons.forEach(b => b.style.display = 'none');
        };
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Aplicativo instalado no dispositivo!');
    installButtons.forEach(btn => btn.style.display = 'none');
  });

  function showIOSInstallInstructions() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal-backdrop active';
    modal.style.zIndex = '99999';
    modal.innerHTML = `
      <div class="admin-modal-box" style="max-width: 420px; text-align: center;">
        <div class="admin-modal-header" style="justify-content: center; position: relative;">
          <h3 class="admin-modal-title" style="font-size: 1.15rem;">Instalar no iPhone (iOS)</h3>
          <button type="button" class="admin-modal-close" id="close-ios-modal" style="position: absolute; right: 0;">&times;</button>
        </div>
        <div style="padding: 10px 0 20px; color: #E2E8F0; font-size: 0.92rem; line-height: 1.6; text-align: left;">
          <p style="margin-bottom: 12px;">Para ter o <strong>Sereia Dourada</strong> como um aplicativo nativo em tela cheia no seu iPhone:</p>
          <ol style="margin-left: 20px; display: flex; flex-direction: column; gap: 10px;">
            <li>Toque no botão <strong>Compartilhar</strong> (<span style="font-size: 1.2rem;">⎋</span>) na barra inferior do Safari.</li>
            <li>Role a tela para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> (<span style="font-size: 1.2rem;">➕</span>).</li>
            <li>Toque em <strong>"Adicionar"</strong> no canto superior direito.</li>
          </ol>
        </div>
        <button type="button" class="btn-gold-action" id="btn-entendido-ios" style="width: 100%; padding: 12px;">Entendi</button>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#close-ios-modal').onclick = close;
    modal.querySelector('#btn-entendido-ios').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
  }
}

