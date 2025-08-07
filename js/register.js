import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
    'https://xggnrnwyvqslxigblhih.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwd21lemtsaXZmcWVnc2tjemx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTczODksImV4cCI6MjA2OTUzMzM4OX0.ylmGI6yUfZtEtgIaS4FYQqAI6vJsIblAeYsob9ECXBY'
)

// Version simplifiée de l'inscription
document.addEventListener('DOMContentLoaded', function() {
    console.log('Register.js chargé');

    // Gestion de l'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Tentative d\'inscription');
            
            const displayName = document.getElementById('displayName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            const messageDiv = document.getElementById('message');
            
            // Validation
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
            
            // Simulation d'inscription réussie
            const userData = {
                id: Date.now(),
                email: email,
                name: displayName
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            messageDiv.innerHTML = '<div class="success">Compte créé avec succès ! Redirection...</div>';
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        });
    }

    // Inscription Google
    const googleRegister = document.getElementById('googleRegister');
    if (googleRegister) {
        googleRegister.addEventListener('click', function() {
            console.log('Inscription Google');
            document.getElementById('message').innerHTML = '<div class="info">Fonctionnalité Google en cours de développement</div>';
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

    // Validation de la confirmation du mot de passe
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