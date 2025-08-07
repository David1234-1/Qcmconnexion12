import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
    'https://xggnrnwyvqslxigblhih.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwd21lemtsaXZmcWVnc2tjemx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTczODksImV4cCI6MjA2OTUzMzM4OX0.ylmGI6yUfZtEtgIaS4FYQqAI6vJsIblAeYsob9ECXBY'
)

// Gestion de la connexion
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const messageDiv = document.getElementById('message')
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
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
                name: data.user.user_metadata?.full_name || email.split('@')[0]
            }
            localStorage.setItem('currentUser', JSON.stringify(userData))
            
            messageDiv.innerHTML = `<div class="success">Connexion réussie ! Redirection...</div>`
            setTimeout(() => {
                window.location.href = 'dashboard.html'
            }, 1000)
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="error">Erreur de connexion : ${error.message}</div>`
    }
})

// Connexion Google
document.getElementById('google-login').addEventListener('click', async () => {
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

// Gestion du mot de passe oublié
document.getElementById('forgotPassword').addEventListener('click', (e) => {
    e.preventDefault()
    document.getElementById('resetModal').style.display = 'flex'
})

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('resetModal').style.display = 'none'
})

document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('resetEmail').value
    const messageDiv = document.getElementById('message')
    
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/login.html'
        })
        
        if (error) {
            messageDiv.innerHTML = `<div class="error">${error.message}</div>`
            return
        }
        
        messageDiv.innerHTML = `<div class="success">Email de réinitialisation envoyé !</div>`
        document.getElementById('resetModal').style.display = 'none'
        document.getElementById('resetEmail').value = ''
    } catch (error) {
        messageDiv.innerHTML = `<div class="error">Erreur : ${error.message}</div>`
    }
})

// Fermer le modal en cliquant à l'extérieur
window.addEventListener('click', (e) => {
    const modal = document.getElementById('resetModal')
    if (e.target === modal) {
        modal.style.display = 'none'
    }
})