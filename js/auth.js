import { supabase } from './supabaseClient.js'

const loginForm = document.getElementById('loginForm')
const googleBtn = document.getElementById('google-login')
const messageBox = document.getElementById('message')
const forgotLink = document.getElementById('forgotPassword')
const resetModal = document.getElementById('resetModal')
const closeModalBtn = document.getElementById('closeModal')
const resetForm = document.getElementById('resetForm')

function showMessage(text, type = 'info') {
  if (!messageBox) return
  messageBox.textContent = text
  messageBox.className = `message ${type}`
}

function openResetModal() {
  if (resetModal) resetModal.style.display = 'flex'
}
function closeResetModal() {
  if (resetModal) resetModal.style.display = 'none'
}

if (forgotLink) {
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault()
    openResetModal()
  })
}
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', (e) => {
    e.preventDefault()
    closeResetModal()
  })
}

if (resetForm) {
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('resetEmail')?.value?.trim()
    if (!email) return showMessage('Entrez votre email', 'error')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login.html`
    })
    if (error) return showMessage(error.message, 'error')
    closeResetModal()
    showMessage('Lien de réinitialisation envoyé. Vérifiez votre email.', 'success')
  })
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

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email')?.value?.trim()
    const password = document.getElementById('password')?.value
    if (!email || !password) return showMessage('Remplissez tous les champs', 'error')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return showMessage(error.message, 'error')

    // Préparer currentUser local minimal
    const user = data.user
    const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email
    localStorage.setItem('currentUser', JSON.stringify({ name: displayName, email: user?.email, avatar: user?.user_metadata?.avatar_url || '' }))

    window.location.href = 'dashboard.html'
  })
}

// Rediriger si déjà connecté
;(async () => {
  const { data } = await supabase.auth.getSession()
  if (data?.session) {
    window.location.href = 'dashboard.html'
  }
})()