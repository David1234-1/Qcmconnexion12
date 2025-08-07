// Authentification Firebase
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js chargé');

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

    // Gestion de la connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Tentative de connexion Firebase');
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            // Validation basique
            if (!email || !password) {
                messageDiv.innerHTML = '<div class="error">Veuillez remplir tous les champs</div>';
                return;
            }
            
            // Afficher un message de chargement
            messageDiv.innerHTML = '<div class="info">Connexion en cours...</div>';
            
            try {
                const result = await firebaseAuth.loginWithEmail(email, password);
                
                if (result.success) {
                    messageDiv.innerHTML = '<div class="success">Connexion réussie ! Redirection...</div>';
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    messageDiv.innerHTML = `<div class="error">Erreur de connexion: ${result.error}</div>`;
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="error">Erreur de connexion</div>';
                console.error('Erreur connexion:', error);
            }
        });
    }

    // Connexion Google
    const googleLogin = document.getElementById('google-login');
    if (googleLogin) {
        googleLogin.addEventListener('click', function() {
            console.log('Connexion Google');
            document.getElementById('message').innerHTML = '<div class="info">Fonctionnalité Google en cours de développement</div>';
        });
    }

    // Gestion du mot de passe oublié
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Mot de passe oublié');
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
            
            try {
                const result = await firebaseAuth.resetPassword(email);
                
                if (result.success) {
                    messageDiv.innerHTML = '<div class="success">Email de réinitialisation envoyé !</div>';
                    document.getElementById('resetModal').style.display = 'none';
                    document.getElementById('resetEmail').value = '';
                } else {
                    messageDiv.innerHTML = `<div class="error">Erreur: ${result.error}</div>`;
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="error">Erreur lors de l\'envoi de l\'email</div>';
                console.error('Erreur réinitialisation:', error);
            }
        });
    }

    // Fermer le modal en cliquant à l'extérieur
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('resetModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});