import { supabase } from './supabaseClient.js'

async function requireSession() {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData?.session) {
    window.location.href = 'login.html'
    throw new Error('No session')
  }
  return sessionData.session
}

async function loadMetadataToLocal() {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  const meta = user?.user_metadata || {}

  const currentUser = {
    name: meta.display_name || meta.full_name || user?.email || 'Utilisateur',
    email: user?.email || '',
    avatar: meta.avatar_url || '',
    bio: meta.bio || ''
  }

  localStorage.setItem('currentUser', JSON.stringify(currentUser))
  if (meta.courses) localStorage.setItem('courses', JSON.stringify(meta.courses))
  if (meta.qcmData) localStorage.setItem('qcmData', JSON.stringify(meta.qcmData))
  if (meta.flashcardsData) localStorage.setItem('flashcardsData', JSON.stringify(meta.flashcardsData))
  if (meta.calendarEvents) localStorage.setItem('calendarEvents', JSON.stringify(meta.calendarEvents))
  if (meta.matieres) localStorage.setItem('matieres', JSON.stringify(meta.matieres))
}

function readLocal() {
  const safeParse = (key, fallback = []) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
  }
  const currentUser = safeParse('currentUser', {})
  return {
    currentUser,
    courses: safeParse('courses'),
    qcmData: safeParse('qcmData'),
    flashcardsData: safeParse('flashcardsData'),
    calendarEvents: safeParse('calendarEvents'),
    matieres: safeParse('matieres'),
  }
}

async function syncToSupabase() {
  const { currentUser, courses, qcmData, flashcardsData, calendarEvents, matieres } = readLocal()
  const displayName = currentUser?.name || ''
  const avatarUrl = currentUser?.avatar || ''
  const bio = currentUser?.bio || ''

  await supabase.auth.updateUser({
    data: {
      display_name: displayName,
      avatar_url: avatarUrl,
      bio,
      courses,
      qcmData,
      flashcardsData,
      calendarEvents,
      matieres
    }
  })
}

;(async () => {
  try {
    await requireSession()
    await loadMetadataToLocal()
  } catch (e) {
    return
  }

  setInterval(syncToSupabase, 10000)
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      syncToSupabase()
    }
  })
})()