// Inscription Firebase
document.addEventListener('DOMContentLoaded', function() {
    console.log('Register.js chargé');

    // Test de connexion à Firebase
    try {
        if (typeof firebase === 'undefined' || !firebase.apps.length) {
            throw new Error('Firebase non chargé ou mal configuré. Vérifiez la configuration dans js/firebase-config.js');
        }
        if (!firebase.auth || !firebase.firestore) {
            throw new Error('Firebase Auth ou Firestore non disponible.');
        }
    } catch (e) {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.innerHTML = `<div class='error'>Erreur de configuration Firebase : ${e.message}</div>`;
        }
        alert('Erreur de configuration Firebase : ' + e.message);
        return;
    }

    // Gestion de l'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Tentative d\'inscription Firebase');
            
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
            
            // Afficher un message de chargement
            messageDiv.innerHTML = '<div class="info">Création du compte en cours...</div>';
            
            try {
                const result = await firebaseAuth.registerWithEmail(email, password, displayName);
                
                if (result.success) {
                    messageDiv.innerHTML = '<div class="success">Compte créé avec succès ! Redirection...</div>';
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    messageDiv.innerHTML = `<div class="error">Erreur d'inscription: ${result.error}</div>`;
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="error">Erreur lors de la création du compte</div>';
                console.error('Erreur inscription:', error);
            }
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