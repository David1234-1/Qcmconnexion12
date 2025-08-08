import { supabase } from './supabase-config.js';

// Rediriger si déjà connecté
supabase.auth.getUser().then(({ data }) => {
  if (data.user) window.location.href = 'dashboard.html';
});

// Sur login.html
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    if (!email || !password) {
      messageDiv.innerHTML = '<div class="error">Veuillez remplir tous les champs</div>';
      return;
    }
    messageDiv.innerHTML = '<div class="info">Connexion en cours...</div>';
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      messageDiv.innerHTML = `<div class='error'>${error.message}</div>`;
    } else {
      messageDiv.innerHTML = '<div class="success">Connexion réussie ! Redirection...</div>';
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
    }
  });
}

// Mot de passe oublié
const forgotPassword = document.getElementById('forgotPassword');
if (forgotPassword) {
  forgotPassword.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('resetModal').style.display = 'flex';
  });
}
const closeModal = document.getElementById('closeModal');
if (closeModal) {
  closeModal.addEventListener('click', function() {
    document.getElementById('resetModal').style.display = 'none';
  });
}
const resetForm = document.getElementById('resetForm');
if (resetForm) {
  resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    const messageDiv = document.getElementById('message');
    if (!email) {
      messageDiv.innerHTML = '<div class="error">Veuillez entrer votre email</div>';
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password.html' });
    if (error) {
      messageDiv.innerHTML = `<div class='error'>${error.message}</div>`;
    } else {
      messageDiv.innerHTML = '<div class="success">Email de réinitialisation envoyé !</div>';
      document.getElementById('resetModal').style.display = 'none';
      document.getElementById('resetEmail').value = '';
    }
  });
}

// Redirection automatique si déconnexion
supabase.auth.onAuthStateChange((event, session) => {
  if (!session && !window.location.pathname.endsWith('login.html')) {
    window.location.href = 'login.html';
  }
});