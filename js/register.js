import { supabase } from './supabaseClient.js'

const registerForm = document.getElementById('registerForm')
const googleBtn = document.getElementById('googleRegister')
const messageBox = document.getElementById('message')

function showMessage(text, type = 'info') {
  if (!messageBox) return
  messageBox.textContent = text
  messageBox.className = `message ${type}`
}

if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard.html` }
    })
    if (error) showMessage(error.message, 'error')
  })
}

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const displayName = document.getElementById('displayName')?.value?.trim()
    const email = document.getElementById('email')?.value?.trim()
    const password = document.getElementById('password')?.value
    const confirmPassword = document.getElementById('confirmPassword')?.value

    if (!displayName || !email || !password || !confirmPassword) {
      return showMessage('Remplissez tous les champs', 'error')
    }
    if (password.length < 6) return showMessage('Mot de passe trop court (min 6)', 'error')
    if (password !== confirmPassword) return showMessage('Les mots de passe ne correspondent pas', 'error')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          avatar_url: '',
          bio: '',
          courses: [],
          qcmData: [],
          flashcardsData: [],
          calendarEvents: []
        },
        emailRedirectTo: `${window.location.origin}/dashboard.html`
      }
    })

    if (error) return showMessage(error.message, 'error')

    if (data?.session) {
      // Déjà connecté
      localStorage.setItem('currentUser', JSON.stringify({ name: displayName, email, avatar: '' }))
      window.location.href = 'dashboard.html'
    } else {
      showMessage("Compte créé. Vérifiez l'email de confirmation.", 'success')
      setTimeout(() => (window.location.href = 'login.html'), 1500)
    }
  })
}