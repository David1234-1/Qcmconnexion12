import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const displayName = document.getElementById('displayName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            const messageDiv = document.getElementById('message');
            if (!displayName || !email || !password || !confirmPassword) {
                messageDiv.innerHTML = '<div class="error">Veuillez remplir tous les champs</div>';
                return;
            }
            if (password !== confirmPassword) {
                messageDiv.innerHTML = '<div class="error">Les mots de passe ne correspondent pas</div>';
                return;
            }
            if (password.length < 6) {
                messageDiv.innerHTML = '<div class="error">Le mot de passe doit contenir au moins 6 caractères</div>';
                return;
            }
            if (!terms) {
                messageDiv.innerHTML = '<div class="error">Vous devez accepter les conditions d\'utilisation</div>';
                return;
            }
            messageDiv.innerHTML = '<div class="info">Création du compte en cours...</div>';
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                messageDiv.innerHTML = `<div class='error'>${error.message}</div>`;
            } else {
                messageDiv.innerHTML = '<div class="success">Compte créé avec succès ! Vérifiez vos emails pour valider votre compte.</div>';
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            }
        });
    }

    // Validation en temps réel du mot de passe
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const hint = this.parentNode.querySelector('.password-hint');
            if (hint) {
                if (password.length < 6) {
                    hint.style.color = '#ef4444';
                } else {
                    hint.style.color = '#10b981';
                }
            }
        });
    }
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            const confirmPassword = this.value;
            if (confirmPassword && password !== confirmPassword) {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#10b981';
            }
        });
    }
});