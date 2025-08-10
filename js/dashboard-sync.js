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

  // Écrire dans localStorage pour que dashboard.js les lise
  localStorage.setItem('currentUser', JSON.stringify(currentUser))
  if (meta.courses) localStorage.setItem('courses', JSON.stringify(meta.courses))
  if (meta.qcmData) localStorage.setItem('qcmData', JSON.stringify(meta.qcmData))
  if (meta.flashcardsData) localStorage.setItem('flashcardsData', JSON.stringify(meta.flashcardsData))
  if (meta.calendarEvents) localStorage.setItem('calendarEvents', JSON.stringify(meta.calendarEvents))
}

function readLocal() {
  const safeParse = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  }
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('currentUser') || '{}') } catch { return {} } })()
  return {
    currentUser,
    courses: safeParse('courses'),
    qcmData: safeParse('qcmData'),
    flashcardsData: safeParse('flashcardsData'),
    calendarEvents: safeParse('calendarEvents')
  }
}

async function syncToSupabase() {
  const { currentUser, courses, qcmData, flashcardsData, calendarEvents } = readLocal()
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
      calendarEvents
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

  // Sync périodique
  setInterval(syncToSupabase, 10000)
  // Sync à la fermeture
  window.addEventListener('beforeunload', () => {
    navigator.sendBeacon?.(window.location.href) // hint: garder la page vivante
  })
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      syncToSupabase()
    }
  })
})()