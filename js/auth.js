// Version simplifiée de l'authentification
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js chargé');

    // Gestion de la connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Tentative de connexion');
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            // Validation basique
            if (!email || !password) {
                messageDiv.innerHTML = '<div class="error">Veuillez remplir tous les champs</div>';
                return;
            }
            
            // Simulation de connexion réussie
            const userData = {
                id: Date.now(),
                email: email,
                name: email.split('@')[0]
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            messageDiv.innerHTML = '<div class="success">Connexion réussie ! Redirection...</div>';
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
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
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value;
            const messageDiv = document.getElementById('message');
            
            if (!email) {
                messageDiv.innerHTML = '<div class="error">Veuillez entrer votre email</div>';
                return;
            }
            
            messageDiv.innerHTML = '<div class="success">Email de réinitialisation envoyé !</div>';
            document.getElementById('resetModal').style.display = 'none';
            document.getElementById('resetEmail').value = '';
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