import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
    'https://xggnrnwyvqslxigblhih.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwd21lemtsaXZmcWVnc2tjemx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTczODksImV4cCI6MjA2OTUzMzM4OX0.ylmGI6yUfZtEtgIaS4FYQqAI6vJsIblAeYsob9ECXBY'
)

// Gestion de l'inscription
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const displayName = document.getElementById('displayName').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('confirmPassword').value
    const terms = document.getElementById('terms').checked
    const messageDiv = document.getElementById('message')
    
    // Validation
    if (password !== confirmPassword) {
        messageDiv.innerHTML = `<div class="error">Les mots de passe ne correspondent pas</div>`
        return
    }
    
    if (password.length < 6) {
        messageDiv.innerHTML = `<div class="error">Le mot de passe doit contenir au moins 6 caractères</div>`
        return
    }
    
    if (!terms) {
        messageDiv.innerHTML = `<div class="error">Vous devez accepter les conditions d'utilisation</div>`
        return
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: displayName
                }
            }
        })
        
        if (error) {
            messageDiv.innerHTML = `<div class="error">${error.message}</div>`
            return
        }
        
        if (data.user) {
            // Sauvegarder les informations utilisateur
            const userData = {
                id: data.user.id,
                email: data.user.email,
                name: displayName
            }
            localStorage.setItem('currentUser', JSON.stringify(userData))
            
            messageDiv.innerHTML = `<div class="success">Compte créé avec succès ! Redirection...</div>`
            setTimeout(() => {
                window.location.href = 'dashboard.html'
            }, 1000)
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="error">Erreur lors de l'inscription : ${error.message}</div>`
    }
})

// Inscription Google
document.getElementById('googleRegister').addEventListener('click', async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard.html'
            }
        })
        
        if (error) {
            document.getElementById('message').innerHTML = `<div class="error">${error.message}</div>`
        }
    } catch (error) {
        document.getElementById('message').innerHTML = `<div class="error">Erreur : ${error.message}</div>`
    }
})

// Validation en temps réel du mot de passe
document.getElementById('password').addEventListener('input', function() {
    const password = this.value
    const hint = this.parentNode.querySelector('.password-hint')
    
    if (password.length < 6) {
        hint.style.color = '#ef4444'
    } else {
        hint.style.color = '#10b981'
    }
})

// Validation de la confirmation du mot de passe
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value
    const confirmPassword = this.value
    
    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = '#ef4444'
    } else {
        this.style.borderColor = '#10b981'
    }
})