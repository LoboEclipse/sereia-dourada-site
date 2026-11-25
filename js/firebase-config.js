/**
 * ==============================================================================
 * SEREIA DOURADA - CONFIGURAÇÃO & CONEXÃO OFICIAL COM O FIREBASE
 * Cloud Firestore Database & Autenticação VIP
 * ==============================================================================
 */

const firebaseConfig = {
  apiKey: "AIzaSyCH5WkqpW4DmFE9oBuDK74O9cA8T8OnJ9Y",
  authDomain: "sereiradourada-818d2.firebaseapp.com",
  projectId: "sereiradourada-818d2",
  storageBucket: "sereiradourada-818d2.firebasestorage.app",
  messagingSenderId: "228021638854",
  appId: "1:228021638854:web:fdf098f86d7cba21aae9c7",
  measurementId: "G-R6DNH00BTL"
};

const ALLOWED_HOSTS = new Set([
  'loboeclipse.github.io',
  'localhost',
  '127.0.0.1',
  'sereiradourada-818d2.web.app',
  'sereiradourada-818d2.firebaseapp.com'
]);

const currentHost = (typeof window !== 'undefined' && window.location && window.location.hostname)
  ? window.location.hostname.toLowerCase()
  : '';
const isAuthorizedHost = !currentHost || ALLOWED_HOSTS.has(currentHost);

// Inicializa o Firebase apenas se o SDK estiver carregado em um domínio autorizado
if (typeof firebase !== 'undefined' && isAuthorizedHost) {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Firebase App Check (ativado automaticamente quando a chave reCAPTCHA v3 estiver configurada)
  if (typeof firebase.appCheck === 'function' && window.SEREIA_APP_CHECK_SITE_KEY) {
    try {
      firebase.appCheck().activate(window.SEREIA_APP_CHECK_SITE_KEY, true);
    } catch (e) {
      console.warn("⚠️ [Sereia Dourada] Aviso ao iniciar App Check:", e);
    }
  }

  window.db = firebase.firestore();
  window.auth = firebase.auth();
  // Garante persistência permanente local em Android e iOS
  if (window.auth && typeof window.auth.setPersistence === 'function') {
    window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(e) {
      console.warn("Aviso ao definir persistência Auth:", e);
    });
  }
  console.log("👑 [Sereia Dourada] Conectado com sucesso ao Firebase!");
} else if (!isAuthorizedHost) {
  console.error("🛡️ [Sereia Dourada] Domínio não autorizado para conexão com o Firebase:", currentHost);
} else {
  console.warn("⚠️ [Sereia Dourada] SDK do Firebase não encontrado. Verifique as tags de script.");
}

/**
 * Tradução de erros do Firebase Auth para mensagens amigáveis e elegantes
 */
function traduzirErroFirebase(erro) {
  if (!erro || !erro.code) return "Ocorreu um erro inesperado. Tente novamente.";
  switch (erro.code) {
    case 'auth/email-already-in-use':
      return "Este e-mail já possui cadastro. Faça login na aba Entrar.";
    case 'auth/invalid-email':
      return "O e-mail digitado não possui um formato válido.";
    case 'auth/operation-not-allowed':
      return "Este método de login ainda precisa ser ativado no Firebase Console.";
    case 'auth/popup-closed-by-user':
      return "Janela de login fechada antes da conclusão. Tente novamente.";
    case 'auth/popup-blocked':
      return "O navegador bloqueou a janela de login. Permita pop-ups e tente novamente.";
    case 'auth/cancelled-popup-request':
      return "Outra janela de login já está aberta.";
    case 'auth/account-exists-with-different-credential':
      return "Já existe uma conta cadastrada com este e-mail usando outro método de login.";
    case 'auth/unauthorized-domain':
      return "Domínio ainda não autorizado no Firebase Console (Authentication → Authorized domains).";
    case 'auth/weak-password':
      return "A senha deve conter no mínimo 6 caracteres para sua segurança.";
    case 'auth/user-not-found':
      return "Nenhuma conta localizada com este e-mail.";
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return "E-mail ou senha incorretos. Por favor, confira os dados digitados.";
    case 'auth/too-many-requests':
      return "Muitas tentativas recentes. Aguarde alguns instantes e tente novamente.";
    case 'auth/network-request-failed':
      return "Falha de conexão com a rede. Verifique sua internet.";
    default:
      return erro.message || "Não foi possível completar a operação.";
  }
}

/**
 * Gerar ID humanizado e seguro para o documento de Usuário baseado no nome completo
 * Ex: "Mateus Moreira de Siqueira" -> "mateus_moreira_de_siqueira"
 */
function gerarIdUsuario(nome) {
  if (!nome) return 'usuario_' + Date.now();
  return nome
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Gerar ID humanizado e seguro para o documento de Reserva baseado no espaço e primeiro nome do cliente
 * Ex: espaco: "pousada", nome: "Mateus Moreira..." -> "pousada_mateus"
 */
async function gerarIdReservaUnico(espaco, nome) {
  const espacoLimpo = (espaco || 'pousada')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '');

  const primeiroNome = (nome || 'cliente')
    .toString()
    .trim()
    .split(/\s+/)[0]
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

  const baseId = `${espacoLimpo}_${primeiroNome || 'cliente'}`;
  
  if (!window.db) return baseId + '_' + Date.now();

  // Verifica se o ID base já existe no Firestore para evitar colisões
  try {
    const docSnap = await window.db.collection('reservas').doc(baseId).get();
    if (!docSnap.exists) {
      return baseId;
    }

    // Se já existir, busca um sufixo sequencial livre (ex: pousada_mateus_2, pousada_mateus_3...)
    let counter = 2;
    while (counter < 50) {
      const candidatoId = `${baseId}_${counter}`;
      const snap = await window.db.collection('reservas').doc(candidatoId).get();
      if (!snap.exists) {
        return candidatoId;
      }
      counter++;
    }
  } catch (e) {
    console.warn("Aviso ao checar unicidade do ID de reserva:", e);
  }

  return baseId + '_' + Date.now();
}

/**
 * Cadastrar novo usuário VIP no Auth e salvar perfil na coleção 'usuarios' com o Nome do Cliente como ID
 */
async function cadastrarUsuarioVIP(nome, email, senha) {
  if (!window.auth || !window.db) {
    throw new Error("Sistema de banco de dados offline.");
  }
  
  const userCredential = await window.auth.createUserWithEmailAndPassword(email.trim(), senha);
  const user = userCredential.user;

  // Atualiza nome no perfil do Firebase Auth
  if (nome && user.updateProfile) {
    await user.updateProfile({ displayName: nome.trim() });
  }

  // Gera o ID humanizado baseado no nome do cliente (ex: mateus_moreira_de_siqueira)
  const docId = gerarIdUsuario(nome);
  const cleanEmail = email.trim().toLowerCase().slice(0, 120);
  const cleanNome = (nome || '').trim().slice(0, 100);

  // 1. Grava PRIMEIRO e SEMPRE no doc(user.uid) - 100% garantido e sem conflitos de chave
  const userPayload = {
    uid: user.uid,
    docId: user.uid,
    nomeId: docId,
    nome: cleanNome,
    email: cleanEmail,
    perfil: 'cliente_vip',
    role: 'cliente',
    isAdmin: false,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
  };

  await window.db.collection('usuarios').doc(user.uid).set(userPayload, { merge: true });

  // 2. Grava também no ID humanizado se estiver disponível ou pertencer a este usuário
  if (docId && docId !== user.uid) {
    try {
      const snapDoc = await window.db.collection('usuarios').doc(docId).get();
      if (!snapDoc.exists || (snapDoc.data() && snapDoc.data().uid === user.uid)) {
        await window.db.collection('usuarios').doc(docId).set({
          ...userPayload,
          docId: docId
        }, { merge: true });
        localStorage.setItem('sereia_user_doc_id_' + user.uid, docId);
      } else {
        localStorage.setItem('sereia_user_doc_id_' + user.uid, user.uid);
      }
    } catch(e) {
      localStorage.setItem('sereia_user_doc_id_' + user.uid, user.uid);
    }
  } else {
    localStorage.setItem('sereia_user_doc_id_' + user.uid, user.uid);
  }

  await window.db.collection('roles').doc(user.uid).set({
    isAdmin: false,
    email: cleanEmail,
    docId: user.uid,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).catch(() => {});

  localStorage.setItem('sereia_vip_nome_' + user.uid, cleanNome);
  localStorage.setItem('sereia_vip_email_' + user.uid, cleanEmail);

  // Disparo automático de e-mail de boas-vindas do Gmail da Sereia Dourada (contato.sereiadourada@gmail.com)
  try {
    enviarEmailBoasVindasVIP(nome, email, user);
  } catch (mailErr) {
    console.warn('Aviso: envio de boas-vindas:', mailErr);
  }

  return user;
}

/**
 * Envia e-mail de boas-vindas oficial do Gmail da Sereia Dourada (contato.sereiadourada@gmail.com)
 * para o e-mail do cliente recém-cadastrado.
 */
async function enviarEmailBoasVindasVIP(nome, email, user) {
  const cleanNome = (nome || 'Cliente VIP').toString().trim().slice(0, 100);
  const cleanEmail = (email || '').toString().trim().toLowerCase().slice(0, 120);

  if (!cleanEmail) return;

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <style>
        body { margin: 0; padding: 0; background-color: #040816; font-family: Arial, sans-serif; color: #FFFFFF; }
        .email-wrapper { max-width: 600px; margin: 0 auto; background: #091733; border: 1.5px solid #D4AF37; border-radius: 16px; overflow: hidden; }
        .email-header { text-align: center; padding: 32px 20px 20px 20px; background: #040816; border-bottom: 1px solid rgba(212, 175, 55, 0.3); }
        .email-logo-text { color: #D4AF37; font-size: 24px; font-weight: bold; letter-spacing: 3px; font-family: Georgia, serif; margin: 10px 0 0 0; }
        .email-subtitle { color: #A0B2D4; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
        .email-body { padding: 32px 28px; line-height: 1.6; }
        .email-title { font-size: 20px; color: #FFFFFF; font-weight: bold; margin-bottom: 16px; }
        .email-text { color: #CBD5E1; font-size: 15px; margin-bottom: 20px; line-height: 1.7; }
        .email-card { background: #050c1e; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 12px; padding: 18px 20px; margin: 24px 0; }
        .email-card-item { margin: 8px 0; font-size: 14px; color: #E2E8F0; }
        .email-card-label { color: #D4AF37; font-weight: bold; }
        .email-btn-wrap { text-align: center; margin: 32px 0 20px 0; }
        .email-btn { display: inline-block; background: #D4AF37; color: #040816 !important; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-size: 14px; letter-spacing: 1px; }
        .email-footer { text-align: center; padding: 22px; background: #020612; border-top: 1px solid rgba(212, 175, 55, 0.2); font-size: 12px; color: #7E93B8; }
      </style>
    </head>
    <body>
      <div style="padding: 24px 12px; background-color: #040816;">
        <div class="email-wrapper">
          <div class="email-header">
            <div style="font-size: 32px;">👑</div>
            <div class="email-logo-text">SEREIA DOURADA</div>
            <div class="email-subtitle">Resort & Gastronomia Exclusiva</div>
          </div>
          <div class="email-body">
            <div class="email-title">Olá, ${cleanNome}!</div>
            <p class="email-text">
              É com imensa alegria que damos as boas-vindas a você à <strong>Sereia Dourada</strong>. Sua conta VIP oficial foi criada com sucesso em nosso portal!
            </p>
            <div class="email-card">
              <div class="email-card-item"><span class="email-card-label">✦ Titular da Conta:</span> ${cleanNome}</div>
              <div class="email-card-item"><span class="email-card-label">✦ E-mail Cadastrado:</span> ${cleanEmail}</div>
              <div class="email-card-item"><span class="email-card-label">✦ Categoria:</span> Cliente VIP Sereia Dourada</div>
              <div class="email-card-item"><span class="email-card-label">✦ Status:</span> Ativo & Confirmado</div>
            </div>
            <p class="email-text">
              Agora você tem acesso antecipado e exclusivo a reservas de pousada, área de camping e mesas em nosso restaurante de alta gastronomia à beira-mar.
            </p>
            <div class="email-btn-wrap">
              <a href="https://loboeclipse.github.io/sereia-dourada-site/reserva" class="email-btn">FAZER MINHA PRIMEIRA RESERVA</a>
            </div>
            <p class="email-text" style="font-size: 13px; color: #94A3B8; text-align: center; margin-top: 24px;">
              Precisa de auxílio ou atendimento personalizado? Responda diretamente a este e-mail ou fale com nossa equipe em <strong>contato.sereiadourada@gmail.com</strong>.
            </p>
          </div>
          <div class="email-footer">
            © 2026 Sereia Dourada. Resort & Gastronomia. Todos os direitos reservados.<br>
            E-mail Oficial: contato.sereiadourada@gmail.com
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Grava na fila de e-mails do Cloud Firestore (Trigger Email Extension)
  if (window.db) {
    window.db.collection('mail').add({
      to: [cleanEmail],
      from: 'Sereia Dourada <contato.sereiadourada@gmail.com>',
      replyTo: 'contato.sereiadourada@gmail.com',
      message: {
        subject: '👑 Bem-vindo(a) à Sereia Dourada Resort & Gastronomia!',
        text: `Olá, ${cleanNome}!\n\nSeja muito bem-vindo(a) à Sereia Dourada Resort & Gastronomia! Sua conta VIP foi criada com sucesso com o e-mail: ${cleanEmail}.\n\nAcesse nosso portal exclusivo: https://loboeclipse.github.io/sereia-dourada-site/reserva\n\nQualquer dúvida, estamos à disposição em contato.sereiadourada@gmail.com.\n\nAtenciosamente,\nEquipe Sereia Dourada`,
        html: emailHtml
      },
      status: 'pending',
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.warn('Aviso: fila de email firestore:', err));
  }

  // 2. Disparo para API do servidor Node.js (Gmail SMTP com nodemailer)
  try {
    fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: cleanNome, email: cleanEmail })
    }).catch(() => {});
  } catch (e) {}

  // 3. Verificação nativa do Firebase Auth (se disponível)
  if (user && typeof user.sendEmailVerification === 'function') {
    user.sendEmailVerification().catch(() => {});
  }
}

/**
 * Realizar login de usuário VIP
 */
async function loginUsuarioVIP(email, senha) {
  if (!window.auth) {
    throw new Error("Sistema de autenticação offline.");
  }
  const userCredential = await window.auth.signInWithEmailAndPassword(email.trim(), senha);
  
  // Atualiza data de último acesso no Firestore
  if (window.db && userCredential.user) {
    window.db.collection('usuarios').doc(userCredential.user.uid).set({
      ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(() => {});
  }

  return userCredential.user;
}

/**
 * Sincronizar perfil do usuário autenticado via Google ou Facebook no Firestore
 */
async function sincronizarPerfilSocialVIP(user) {
  if (!window.db || !user) return;

  const cleanEmail = (user.email || '').toLowerCase().trim().slice(0, 120);
  const cleanNome = (user.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Cliente VIP'))
    .toString()
    .trim()
    .slice(0, 100) || 'Cliente VIP';
  const safeFoto = (typeof sanitizarUrlImagem === 'function' && user.photoURL && user.photoURL.length <= 500)
    ? sanitizarUrlImagem(user.photoURL)
    : null;

  try {
    const docRef = window.db.collection('usuarios').doc(user.uid);
    const snap = await docRef.get();

    if (!snap.exists) {
      const payload = {
        uid: user.uid,
        docId: user.uid,
        nomeId: gerarIdUsuario(cleanNome),
        nome: cleanNome,
        email: cleanEmail,
        perfil: 'cliente_vip',
        role: 'cliente',
        isAdmin: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (safeFoto) payload.fotoUrl = safeFoto;

      if (cleanEmail) {
        await docRef.set(payload);
      }

      window.db.collection('roles').doc(user.uid).set({
        isAdmin: false,
        email: cleanEmail,
        docId: user.uid,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(() => {});
    } else {
      const updateData = {
        ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp(),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      };
      const existing = snap.data() || {};
      if (!existing.fotoUrl && safeFoto) updateData.fotoUrl = safeFoto;
      if (!existing.nome && cleanNome) updateData.nome = cleanNome;
      await docRef.update(updateData).catch(() => {});
    }
  } catch (e) {
    console.warn("Aviso ao sincronizar perfil social no Firestore:", e);
  }

  localStorage.setItem('sereia_user_doc_id_' + user.uid, user.uid);
  localStorage.setItem('sereia_vip_nome_' + user.uid, cleanNome);
  if (cleanEmail) localStorage.setItem('sereia_vip_email_' + user.uid, cleanEmail);
  if (safeFoto) localStorage.setItem('sereia_vip_foto_' + user.uid, safeFoto);
}

/**
 * Login com Conta Google (Firebase Auth)
 */
async function loginComGoogleVIP() {
  if (!window.auth || typeof firebase === 'undefined' || !firebase.auth) {
    throw new Error("Sistema de autenticação offline.");
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await window.auth.signInWithPopup(provider);
    if (result && result.user) {
      await sincronizarPerfilSocialVIP(result.user);
      return result.user;
    }
    return null;
  } catch (err) {
    if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment')) {
      await window.auth.signInWithRedirect(provider);
      return null;
    }
    throw err;
  }
}

/**
 * Login com Conta Facebook (Firebase Auth)
 */
async function loginComFacebookVIP() {
  if (!window.auth || typeof firebase === 'undefined' || !firebase.auth) {
    throw new Error("Sistema de autenticação offline.");
  }
  const provider = new firebase.auth.FacebookAuthProvider();
  provider.addScope('email');
  provider.addScope('public_profile');

  try {
    const result = await window.auth.signInWithPopup(provider);
    if (result && result.user) {
      await sincronizarPerfilSocialVIP(result.user);
      return result.user;
    }
    return null;
  } catch (err) {
    if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment')) {
      await window.auth.signInWithRedirect(provider);
      return null;
    }
    throw err;
  }
}

// Processa retorno de login social por redirecionamento (fallback mobile)
if (typeof window !== 'undefined' && window.auth && typeof window.auth.getRedirectResult === 'function') {
  window.auth.getRedirectResult()
    .then(async (result) => {
      if (result && result.user) {
        await sincronizarPerfilSocialVIP(result.user);
      }
    })
    .catch((err) => {
      if (err && err.code) {
        console.warn("Aviso no retorno de login social:", err.code);
      }
    });
}

/**
 * Fazer logout da conta VIP
 */
async function logoutUsuarioVIP() {
  if (window.auth) {
    await window.auth.signOut();
  }
}

/**
 * Gravar solicitação oficial de reserva no Cloud Firestore com ID humanizado: [espaco]_[primeiro_nome]
 * Ex: pousada_mateus, camping_mariaclara, etc.
 */
async function salvarNovaReserva(dados) {
  if (!window.db) {
    throw new Error("Banco de dados não disponível no momento.");
  }

  let user = window.auth ? window.auth.currentUser : null;
  let uid = user ? user.uid : null;
  if (!uid) {
    try {
      const sess = JSON.parse(localStorage.getItem('sereia_auth_session'));
      if (sess && sess.uid) uid = sess.uid;
    } catch(e) {}
  }
  if (!uid && dados.email) {
    try {
      const uSnap = await window.db.collection('usuarios')
        .where('email', '==', (dados.email || '').toLowerCase().trim())
        .limit(1)
        .get();
      if (!uSnap.empty) {
        uid = uSnap.docs[0].data().uid || uSnap.docs[0].id;
      }
    } catch(e) {}
  }

  const reservaId = await gerarIdReservaUnico(dados.espaco, dados.nome);
  const cleanEmail = (dados.email || '').toLowerCase().trim().slice(0, 120);
  const cleanNome = (dados.nome || '').toString().trim().slice(0, 100);
  const cleanWhats = (dados.whatsapp || '').toString().trim().slice(0, 25);
  const cleanEspaco = ['pousada', 'camping', 'restaurante'].includes(dados.espaco) ? dados.espaco : 'pousada';
  const cleanCheckin = (dados.checkin || '').toString().trim().slice(0, 20);
  const cleanCheckout = (dados.checkout || '').toString().trim().slice(0, 20);
  const cleanHospedes = (dados.hospedes || '2').toString().trim().slice(0, 10);
  const cleanOcasiao = (dados.ocasiao || 'lazer').toString().trim().slice(0, 50);
  const cleanObs = (dados.observacoes || '').toString().trim().slice(0, 500);

  await window.db.collection('reservas').doc(reservaId).set({
    id: reservaId,
    nome: cleanNome,
    whatsapp: cleanWhats,
    email: cleanEmail,
    espaco: cleanEspaco,
    checkin: cleanCheckin,
    checkout: cleanCheckout,
    hospedes: cleanHospedes,
    ocasiao: cleanOcasiao,
    observacoes: cleanObs,
    status: 'pendente',
    usuarioId: uid || cleanEmail || 'visitante_anonimo',
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Notificar Administradores sobre nova solicitação de reserva/pedido
  try {
    const nomeEspaco = dados.espaco === 'camping' ? 'Camping & Glamping' : (dados.espaco === 'restaurante' ? 'Restaurante Exclusivo' : 'Quartos Aconchegantes');
    if (typeof criarNotificacao === 'function') {
      await criarNotificacao({
        destinatario: 'admin',
        tipo: 'nova_reserva',
        titulo: 'Nova Solicitação de Reserva 🛎️',
        mensagem: `${dados.nome || 'Um cliente'} enviou uma nova reserva para ${nomeEspaco}.`,
        reservaId: reservaId,
        espaco: dados.espaco || 'pousada',
        clienteNome: dados.nome || 'Cliente',
        clienteUid: uid || null,
        clienteEmail: cleanEmail,
        link: '/sereia-dourada-site/admin',
        lida: false
      });
    }
  } catch (errNotif) {
    console.warn("[Notificações] Falha ao notificar admin:", errNotif);
  }

  return reservaId;
}

/**
 * Obter dados do perfil do usuário VIP do Firestore
 * Compatível tanto com IDs humanizados (nome do cliente) quanto UIDs legados
 */
async function obterPerfilUsuarioVIP(uid) {
  if (!window.db || !uid) return null;
  try {
    // 1. Tenta buscar PRIMEIRO pelo doc(uid) (seguro, canônico e sem colisão)
    const docDirect = await window.db.collection('usuarios').doc(uid).get();
    if (docDirect.exists) {
      return processarDadosPerfil(uid, docDirect.data(), docDirect.id);
    }

    // 2. Busca por where('uid', '==', uid) na coleção 'usuarios'
    const snapUid = await window.db.collection('usuarios').where('uid', '==', uid).limit(1).get();
    if (!snapUid.empty) {
      const doc = snapUid.docs[0];
      return processarDadosPerfil(uid, doc.data(), doc.id);
    }

    // 3. Tenta buscar pelo docId humanizado em cache local SOMENTE se pertencer a este UID
    const cachedDocId = localStorage.getItem('sereia_user_doc_id_' + uid);
    if (cachedDocId && cachedDocId !== uid) {
      const docCached = await window.db.collection('usuarios').doc(cachedDocId).get();
      if (docCached.exists && docCached.data() && docCached.data().uid === uid) {
        return processarDadosPerfil(uid, docCached.data(), docCached.id);
      }
    }

    // 4. Se não encontrar por uid, tenta pelo email do currentUser atual do Auth
    if (window.auth && window.auth.currentUser && window.auth.currentUser.email) {
      const authEmail = window.auth.currentUser.email.toLowerCase().trim();
      const snapEmail = await window.db.collection('usuarios')
        .where('email', '==', authEmail)
        .limit(1)
        .get();
      if (!snapEmail.empty) {
        const doc = snapEmail.docs[0];
        return processarDadosPerfil(uid, doc.data(), doc.id);
      }
    }
  } catch (err) {
    console.error("Erro ao obter perfil VIP:", err);
  }
  return null;
}

function processarDadosPerfil(uid, data, docId) {
  if (!data) return null;
  if (docId) localStorage.setItem('sereia_user_doc_id_' + uid, docId);
  if (data.nome) localStorage.setItem('sereia_vip_nome_' + uid, data.nome);
  if (data.email) localStorage.setItem('sereia_vip_email_' + uid, data.email);
  if (data.fotoUrl) localStorage.setItem('sereia_vip_foto_' + uid, data.fotoUrl);

  const isAdm = verificarUsuarioAdmin({ uid }, data);
  if (isAdm) {
    localStorage.setItem('sereia_admin_' + uid, 'true');
  } else {
    localStorage.removeItem('sereia_admin_' + uid);
  }
  return { ...data, docId: docId || data.docId || uid };
}

/**
 * Sanitizar URL de imagem (rejeita esquemas javascript:, data:html e caracteres perigosos)
 */
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

/**
 * Atualizar dados do perfil do usuário VIP no Firestore
 */
async function atualizarPerfilUsuarioVIP(uid, novosDados) {
  if (!window.db || !uid) {
    throw new Error("Banco de dados indisponível.");
  }

  // Defesa contra Mass Assignment / Escalada de Privilégios:
  // Usuário comum NUNCA pode alterar isAdmin, role, perfil ou uid pelo perfil!
  const updatePayload = {
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (novosDados.nome) {
    updatePayload.nome = String(novosDados.nome).trim().slice(0, 100);
  }
  if (novosDados.whatsapp) {
    updatePayload.whatsapp = String(novosDados.whatsapp).trim().slice(0, 25);
  }
  if (novosDados.email) {
    updatePayload.email = String(novosDados.email).toLowerCase().trim().slice(0, 120);
  }
  if (novosDados.fotoUrl) {
    const safeFoto = sanitizarUrlImagem(novosDados.fotoUrl);
    if (safeFoto) {
      updatePayload.fotoUrl = safeFoto;
    }
  }

  // 1. Atualiza SEMPRE o documento com chave canônica doc(uid)
  await window.db.collection('usuarios').doc(uid).set(updatePayload, { merge: true });

  // 2. Se houver um targetDocId humanizado vinculado a este UID, atualiza também
  let targetDocId = localStorage.getItem('sereia_user_doc_id_' + uid);
  if (targetDocId && targetDocId !== uid) {
    try {
      const snap = await window.db.collection('usuarios').doc(targetDocId).get();
      if (snap.exists && snap.data() && snap.data().uid === uid) {
        await window.db.collection('usuarios').doc(targetDocId).set(updatePayload, { merge: true });
      }
    } catch(e) {}
  }

  if (novosDados.nome) {
    localStorage.setItem('sereia_vip_nome_' + uid, novosDados.nome);
    if (window.auth && window.auth.currentUser && window.auth.currentUser.updateProfile) {
      try {
        await window.auth.currentUser.updateProfile({ displayName: novosDados.nome });
      } catch (e) {}
    }
  }

  if (novosDados.email) {
    localStorage.setItem('sereia_vip_email_' + uid, novosDados.email);
    if (window.auth && window.auth.currentUser && window.auth.currentUser.email !== novosDados.email) {
      try {
        if (typeof window.auth.currentUser.updateEmail === 'function') {
          await window.auth.currentUser.updateEmail(novosDados.email);
        }
      } catch (authMailErr) {
        console.warn("Aviso: Auth updateEmail requer reautenticação recente:", authMailErr);
      }
    }
  }

  if (novosDados.fotoUrl) {
    localStorage.setItem('sereia_vip_foto_' + uid, novosDados.fotoUrl);
    if (window.auth && window.auth.currentUser && window.auth.currentUser.updateProfile) {
      try {
        await window.auth.currentUser.updateProfile({ photoURL: novosDados.fotoUrl });
      } catch (e) {}
    }
  }

  try {
    const sess = JSON.parse(localStorage.getItem('sereia_auth_session') || '{}');
    if (sess && sess.uid === uid) {
      if (novosDados.nome) sess.nome = novosDados.nome;
      if (novosDados.email) sess.email = novosDados.email;
      if (novosDados.fotoUrl) sess.fotoUrl = novosDados.fotoUrl;
      localStorage.setItem('sereia_auth_session', JSON.stringify(sess));
    }
  } catch(e) {}

  return true;
}

/**
 * Listar todas as reservas vinculadas ao usuário VIP
 */
async function obterReservasUsuarioVIP(uid, email) {
  if (!window.db) return [];
  const reservas = [];
  try {
    // Busca por UID
    if (uid) {
      const snapUid = await window.db.collection('reservas')
        .where('usuarioId', '==', uid)
        .get();
      snapUid.forEach(doc => {
        reservas.push({ id: doc.id, ...doc.data() });
      });
    }

    // Se nenhuma reserva por UID, tenta por e-mail
    if (reservas.length === 0 && email) {
      const snapEmail = await window.db.collection('reservas')
        .where('email', '==', email.trim().toLowerCase())
        .get();
      snapEmail.forEach(doc => {
        reservas.push({ id: doc.id, ...doc.data() });
      });
    }

    // Ordena do mais recente para o mais antigo
    reservas.sort((a, b) => {
      const timeA = a.criadoEm && a.criadoEm.toMillis ? a.criadoEm.toMillis() : 0;
      const timeB = b.criadoEm && b.criadoEm.toMillis ? b.criadoEm.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error("Erro ao buscar reservas do usuário:", err);
  }
  return reservas;
}

/**
 * Atualizar status da reserva (Admin: 'confirmada', 'cancelada', 'pendente')
 */
async function atualizarStatusReserva(reservaId, novoStatus) {
  if (!window.db || !reservaId) {
    throw new Error("Banco de dados indisponível.");
  }

  await window.db.collection('reservas').doc(reservaId).update({
    status: novoStatus,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Notificar cliente quando a reserva for aprovada (confirmada) ou cancelada
  try {
    const docRes = await window.db.collection('reservas').doc(reservaId).get();
    if (docRes.exists) {
      const resData = docRes.data();
      const nomeEspaco = resData.espaco === 'camping' ? 'Camping & Glamping' : (resData.espaco === 'restaurante' ? 'Restaurante Exclusivo' : 'Quartos Aconchegantes');
      
      let targetUid = resData.usuarioId;
      if (!targetUid || targetUid === 'visitante_anonimo') {
        if (resData.email) {
          try {
            const userSnap = await window.db.collection('usuarios')
              .where('email', '==', resData.email.toLowerCase().trim())
              .limit(1)
              .get();
            if (!userSnap.empty) {
              targetUid = userSnap.docs[0].data().uid || userSnap.docs[0].id;
            }
          } catch(e) {}
        }
      }

      const cleanEmail = resData.email ? resData.email.toLowerCase().trim() : null;
      const destinatarioFinal = (targetUid && targetUid !== 'visitante_anonimo') ? targetUid : (cleanEmail || 'cliente');

      if (novoStatus === 'confirmada') {
        if (typeof criarNotificacao === 'function') {
          await criarNotificacao({
            destinatario: destinatarioFinal,
            destinatarioEmail: cleanEmail,
            destinatarioUid: targetUid,
            tipo: 'reserva_aprovada',
            titulo: 'Sua Reserva foi Confirmada! ⚜️',
            mensagem: `Parabéns ${resData.nome || ''}! Sua solicitação #${reservaId} (${nomeEspaco}) foi aprovada pela nossa equipe. Estamos ansiosos para recebê-lo!`,
            reservaId: reservaId,
            espaco: resData.espaco || 'pousada',
            clienteNome: resData.nome || '',
            link: '/sereia-dourada-site/perfil',
            lida: false
          });
        }
      } else if (novoStatus === 'cancelada') {
        if (typeof criarNotificacao === 'function') {
          await criarNotificacao({
            destinatario: destinatarioFinal,
            destinatarioEmail: cleanEmail,
            destinatarioUid: targetUid,
            tipo: 'reserva_cancelada',
            titulo: 'Atualização na sua Reserva SD',
            mensagem: `Sua solicitação #${reservaId} (${nomeEspaco}) foi marcada como cancelada/recusada. Para mais detalhes, fale com nossa equipe de suporte.`,
            reservaId: reservaId,
            espaco: resData.espaco || 'pousada',
            clienteNome: resData.nome || '',
            link: '/sereia-dourada-site/perfil',
            lida: false
          });
        }
      }
    }
  } catch (errNotif) {
    console.warn("[Notificações] Falha ao notificar cliente:", errNotif);
  }

  return true;
}

/**
 * Obter todas as reservas em tempo real para o Painel Admin
 */
function escutarTodasReservasAdmin(callback) {
  if (!window.db) return () => {};

  return window.db.collection('reservas')
    .onSnapshot((snapshot) => {
      const reservas = [];
      snapshot.forEach(doc => {
        reservas.push({ id: doc.id, ...doc.data() });
      });

      // Ordena por data de criação desc
      reservas.sort((a, b) => {
        const timeA = a.criadoEm && a.criadoEm.toMillis ? a.criadoEm.toMillis() : 0;
        const timeB = b.criadoEm && b.criadoEm.toMillis ? b.criadoEm.toMillis() : 0;
        return timeB - timeA;
      });

      callback(reservas);
    }, (error) => {
      console.error("Erro ao escutar reservas:", error);
    });
}

/**
 * Verificar se o usuário autenticado possui privilégio de Administrador (ADM)
 * A validação é baseada 100% no documento do usuário no Cloud Firestore!
 */
function verificarUsuarioAdmin(user, perfilData) {
  if (!perfilData) {
    // Se perfilData ainda não carregou, consulta cache temporário do usuário
    if (user && user.uid && localStorage.getItem('sereia_admin_' + user.uid) === 'true') {
      return true;
    }
    return false;
  }
  
  let isAdm = false;
  // 1. Campo booleano isAdmin: true (ou string "true")
  if (perfilData.isAdmin === true || perfilData.isAdmin === 'true') {
    isAdm = true;
  }
  
  // 2. Campo perfil: "admin" ou "adm"
  if (perfilData.perfil) {
    const p = String(perfilData.perfil).toLowerCase().trim();
    if (p === 'admin' || p === 'adm') isAdm = true;
  }
  
  // 3. Campo role: "admin" ou "adm"
  if (perfilData.role) {
    const r = String(perfilData.role).toLowerCase().trim();
    if (r === 'admin' || r === 'adm') isAdm = true;
  }

  // Sincroniza role no Firestore (/roles) para reforço das regras de segurança
  if (isAdm && window.db && user && user.uid) {
    window.db.collection('roles').doc(user.uid).set({
      isAdmin: true,
      email: (user.email || (perfilData ? perfilData.email : '')).toLowerCase().trim(),
      docId: (perfilData ? (perfilData.docId || perfilData.id) : '') || user.uid,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(() => {});
  }
  
  return isAdm;
}

/**
 * Rotina para migrar registros existentes para IDs humanizados:
 * - 'usuarios': ID hash do Auth -> nome do cliente (ex: mateus_moreira_de_siqueira)
 * - 'reservas': ID hash -> [espaco]_[primeiro_nome] (ex: pousada_mateus)
 */
async function migrarDadosParaIdsLegiveis() {
  if (!window.db) return { ok: false, msg: "Banco de dados offline." };
  const log = { usuarios: [], reservas: [] };

  try {
    // 1. Migração de Usuários
    const snapUsers = await window.db.collection('usuarios').get();
    for (const doc of snapUsers.docs) {
      const data = doc.data();
      const currentId = doc.id;
      const nome = data.nome;
      if (nome) {
        const targetId = gerarIdUsuario(nome);
        if (targetId && currentId !== targetId) {
          // Copia para o novo documento com ID baseado no nome
          await window.db.collection('usuarios').doc(targetId).set({
            ...data,
            docId: targetId
          }, { merge: true });

          // Remove o documento com hash antigo
          await window.db.collection('usuarios').doc(currentId).delete();
          log.usuarios.push({ antigo: currentId, novo: targetId });
        }
      }
    }

    // 2. Migração de Reservas
    const snapReservas = await window.db.collection('reservas').get();
    for (const doc of snapReservas.docs) {
      const data = doc.data();
      const currentId = doc.id;
      const espaco = data.espaco || 'pousada';
      const nome = data.nome || 'cliente';
      
      // Se o ID atual for uma hash aleatória (mais de 15 caracteres sem underline)
      if (currentId.length > 15 && !currentId.includes('_')) {
        const targetId = await gerarIdReservaUnico(espaco, nome);
        await window.db.collection('reservas').doc(targetId).set({
          ...data,
          id: targetId
        }, { merge: true });

        await window.db.collection('reservas').doc(currentId).delete();
        log.reservas.push({ antigo: currentId, novo: targetId });
      }
    }

    console.log("✨ Migração de IDs do Firestore concluída com sucesso:", log);
    return { ok: true, log };
  } catch (err) {
    console.error("Erro na migração de IDs:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Escutar todas as contas de usuários cadastradas no Firestore em tempo real
 */
function escutarTodasContasAdmin(callback) {
  if (!window.db) return () => {};
  return window.db.collection('usuarios').onSnapshot(snapshot => {
    const contas = [];
    snapshot.forEach(doc => {
      contas.push({ id: doc.id, ...doc.data() });
    });
    // Ordena pelo nome ou por quem é admin primeiro
    contas.sort((a, b) => {
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      return (a.nome || '').localeCompare(b.nome || '');
    });
    callback(contas);
  }, err => {
    console.error("Erro ao escutar contas de usuários:", err);
  });
}

/**
 * Atualizar papel de usuário (Cliente <-> Admin)
 */
async function atualizarPapelUsuarioAdmin(docId, tornarAdmin) {
  if (!window.db) throw new Error("Banco de dados offline.");
  const payload = {
    isAdmin: tornarAdmin === true,
    perfil: tornarAdmin ? 'admin' : 'cliente',
    role: tornarAdmin ? 'admin' : 'cliente',
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  };
  await window.db.collection('usuarios').doc(docId).set(payload, { merge: true });

  try {
    const docSnap = await window.db.collection('usuarios').doc(docId).get();
    if (docSnap.exists) {
      const uData = docSnap.data();
      const targetUid = uData.uid || docId;
      if (targetUid) {
        await window.db.collection('roles').doc(targetUid).set({
          isAdmin: tornarAdmin === true,
          email: (uData.email || '').toLowerCase().trim(),
          docId: docId,
          atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    }
  } catch(e) {}

  return true;
}

/**
 * Atualizar dados cadastrais de uma conta pelo painel admin
 */
async function editarContaUsuarioAdmin(docId, dados) {
  if (!window.db) throw new Error("Banco de dados offline.");
  const payload = {
    nome: dados.nome ? String(dados.nome).trim().slice(0, 100) : '',
    whatsapp: dados.whatsapp ? String(dados.whatsapp).trim().slice(0, 25) : '',
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  };
  if (typeof dados.isAdmin === 'boolean') {
    payload.isAdmin = dados.isAdmin;
    payload.perfil = dados.isAdmin ? 'admin' : 'cliente';
    payload.role = dados.isAdmin ? 'admin' : 'cliente';

    try {
      const docSnap = await window.db.collection('usuarios').doc(docId).get();
      if (docSnap.exists) {
        const uData = docSnap.data();
        const targetUid = uData.uid || docId;
        if (targetUid) {
          await window.db.collection('roles').doc(targetUid).set({
            isAdmin: dados.isAdmin,
            email: (uData.email || '').toLowerCase().trim(),
            docId: docId,
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      }
    } catch(e) {}
  }
  await window.db.collection('usuarios').doc(docId).set(payload, { merge: true });
  return true;
}

/**
 * Obter configurações salvas no Firestore (ex: 'espacos', 'cardapio', 'suporte', 'avaliacoes')
 */
async function obterConfiguracoes(secao) {
  if (!window.db) return null;
  try {
    const docSnap = await window.db.collection('configuracoes').doc(secao).get();
    if (docSnap.exists) {
      return docSnap.data();
    }
  } catch (err) {
    console.warn(`[Configurações] Não foi possível carregar ${secao}:`, err);
  }
  return null;
}

/**
 * Salvar configurações no Firestore (exclusivo admin)
 */
async function salvarConfiguracoes(secao, dados) {
  if (!window.db) throw new Error("Banco de dados offline.");
  const payload = {
    ...dados,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  };
  await window.db.collection('configuracoes').doc(secao).set(payload, { merge: true });
  return true;
}

/**
 * ============================================================================
 * SISTEMA OFICIAL DE NOTIFICAÇÕES EM TEMPO REAL (CLIENTES & ADMIN)
 * ============================================================================
 */

/**
 * Grava uma nova notificação no Firestore
 */
async function criarNotificacao(dados) {
  if (!window.db) return null;
  try {
    const docRef = await window.db.collection('notificacoes').add({
      destinatario: dados.destinatario || 'admin',
      tipo: dados.tipo || 'nova_reserva',
      titulo: dados.titulo || 'Notificação Sereia Dourada',
      mensagem: dados.mensagem || '',
      reservaId: dados.reservaId || '',
      espaco: dados.espaco || '',
      clienteNome: dados.clienteNome || '',
      clienteUid: dados.clienteUid || '',
      link: dados.link || '/',
      lida: false,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.warn("[Notificações] Erro ao gravar notificação:", err);
    return null;
  }
}

/**
 * Escuta notificações em tempo real para um ou mais destinatários ('admin', UID, email)
 */
function escutarNotificacoes(destinatario, callback) {
  if (!window.db || !destinatario) return () => {};

  let query = window.db.collection('notificacoes');
  if (Array.isArray(destinatario)) {
    const limpos = destinatario.filter(Boolean);
    if (limpos.length === 0) return () => {};
    if (limpos.length === 1) {
      query = query.where('destinatario', '==', limpos[0]);
    } else {
      query = query.where('destinatario', 'in', limpos);
    }
  } else {
    query = query.where('destinatario', '==', destinatario);
  }

  return query.onSnapshot((snapshot) => {
    const notifs = [];
    snapshot.forEach(doc => {
      notifs.push({ id: doc.id, ...doc.data() });
    });

    // Ordenar decrescente pela data de criação
    notifs.sort((a, b) => {
      const tA = a.criadoEm && a.criadoEm.toMillis ? a.criadoEm.toMillis() : 0;
      const tB = b.criadoEm && b.criadoEm.toMillis ? b.criadoEm.toMillis() : 0;
      return tB - tA;
    });

    if (typeof callback === 'function') {
      callback(notifs);
    }
  }, (err) => {
    console.warn("[Notificações] Erro no listener:", err);
  });
}

/**
 * Marcar uma notificação específica como lida
 */
async function marcarNotificacaoComoLida(notifId) {
  if (!window.db || !notifId) return false;
  try {
    await window.db.collection('notificacoes').doc(notifId).update({
      lida: true,
      lidaEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn("[Notificações] Erro ao marcar como lida:", err);
    return false;
  }
}

/**
 * Marcar todas as notificações do(s) destinatário(s) como lidas
 */
async function marcarTodasNotificacoesComoLidas(destinatario) {
  if (!window.db || !destinatario) return false;
  try {
    let query = window.db.collection('notificacoes');
    if (Array.isArray(destinatario)) {
      const limpos = destinatario.filter(Boolean);
      if (limpos.length === 0) return true;
      if (limpos.length === 1) query = query.where('destinatario', '==', limpos[0]);
      else query = query.where('destinatario', 'in', limpos);
    } else {
      query = query.where('destinatario', '==', destinatario);
    }

    const snap = await query.where('lida', '==', false).get();
    if (snap.empty) return true;

    const batch = window.db.batch();
    snap.docs.forEach(doc => {
      batch.update(doc.ref, {
        lida: true,
        lidaEm: firebase.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    return true;
  } catch (err) {
    console.warn("[Notificações] Erro ao marcar todas como lidas:", err);
    return false;
  }
}

/**
 * ============================================================================
 * SISTEMA OFICIAL DE AVALIAÇÕES DOS CLIENTES
 * ============================================================================
 */

/**
 * Salvar nova avaliação de cliente no Firestore
 */
async function salvarNovaAvaliacao(dados) {
  if (!window.db) throw new Error("Banco de dados indisponível.");

  const estrelasNum = Math.min(5, Math.max(1, parseInt(dados.estrelas, 10) || 5));
  const safeNome = String(dados.nome || 'Hóspede').trim().slice(0, 100);
  const safeTexto = String(dados.texto || dados.comentario || '').trim().slice(0, 500);
  const safeEspaco = ['pousada', 'camping', 'restaurante'].includes(dados.espaco) ? dados.espaco : 'pousada';
  const safeBadge = String(dados.badge || 'Hóspede VIP').trim().slice(0, 50);
  const safeFoto = typeof sanitizarUrlImagem === 'function' ? sanitizarUrlImagem(dados.foto) : null;

  const docRef = await window.db.collection('avaliacoes').add({
    nome: safeNome,
    texto: safeTexto,
    estrelas: estrelasNum,
    espaco: safeEspaco,
    badge: safeBadge,
    foto: safeFoto || '',
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  return docRef.id;
}

/**
 * Escutar todas as avaliações salvas em tempo real
 */
function escutarTodasAvaliacoes(callback) {
  if (!window.db) return () => {};
  return window.db.collection('avaliacoes')
    .onSnapshot((snapshot) => {
      const lista = [];
      snapshot.forEach(doc => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      lista.sort((a, b) => {
        const tA = a.criadoEm && a.criadoEm.toMillis ? a.criadoEm.toMillis() : 0;
        const tB = b.criadoEm && b.criadoEm.toMillis ? b.criadoEm.toMillis() : 0;
        return tB - tA;
      });
      callback(lista);
    }, (err) => {
      console.warn("Erro ao carregar avaliações:", err);
      callback([]);
    });
}

/**
 * Remover uma avaliação específica (Admin)
 */
async function removerAvaliacao(avaliacaoId) {
  if (!window.db || !avaliacaoId) return false;
  await window.db.collection('avaliacoes').doc(avaliacaoId).delete();
  return true;
}

/**
 * Limpar todas as avaliações salvas no Firestore (Admin)
 */
async function limparTodasAvaliacoes() {
  if (!window.db) throw new Error("Banco de dados offline.");
  const snap = await window.db.collection('avaliacoes').get();
  if (snap.empty) return true;
  const batch = window.db.batch();
  snap.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  return true;
}

// Expõe funções auxiliares para acesso global
window.cadastrarUsuarioVIP = cadastrarUsuarioVIP;
window.loginUsuarioVIP = loginUsuarioVIP;
window.loginComGoogleVIP = loginComGoogleVIP;
window.loginComFacebookVIP = loginComFacebookVIP;
window.logoutUsuarioVIP = logoutUsuarioVIP;
window.salvarNovaReserva = salvarNovaReserva;
window.obterPerfilUsuarioVIP = obterPerfilUsuarioVIP;
window.atualizarPerfilUsuarioVIP = atualizarPerfilUsuarioVIP;
window.obterReservasUsuarioVIP = obterReservasUsuarioVIP;
window.atualizarStatusReserva = atualizarStatusReserva;
window.escutarTodasReservasAdmin = escutarTodasReservasAdmin;
window.verificarUsuarioAdmin = verificarUsuarioAdmin;
window.gerarIdUsuario = gerarIdUsuario;
window.gerarIdReservaUnico = gerarIdReservaUnico;
window.migrarDadosParaIdsLegiveis = migrarDadosParaIdsLegiveis;
window.traduzirErroFirebase = traduzirErroFirebase;
window.escutarTodasContasAdmin = escutarTodasContasAdmin;
window.atualizarPapelUsuarioAdmin = atualizarPapelUsuarioAdmin;
window.editarContaUsuarioAdmin = editarContaUsuarioAdmin;
window.obterConfiguracoes = obterConfiguracoes;
window.salvarConfiguracoes = salvarConfiguracoes;
window.criarNotificacao = criarNotificacao;
window.escutarNotificacoes = escutarNotificacoes;
window.marcarNotificacaoComoLida = marcarNotificacaoComoLida;
window.marcarTodasNotificacoesComoLidas = marcarTodasNotificacoesComoLidas;
window.salvarNovaAvaliacao = salvarNovaAvaliacao;
window.escutarTodasAvaliacoes = escutarTodasAvaliacoes;
window.removerAvaliacao = removerAvaliacao;
window.limparTodasAvaliacoes = limparTodasAvaliacoes;


