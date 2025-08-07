// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "qcmconnexion.firebaseapp.com",
    projectId: "qcmconnexion",
    storageBucket: "qcmconnexion.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Initialiser les services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Variables globales
let currentUser = null;

// Observer l'état d'authentification
auth.onAuthStateChanged(function(user) {
    if (user) {
        currentUser = user;
        console.log('Utilisateur connecté:', user.uid);
        loadUserDataFromFirebase();
    } else {
        currentUser = null;
        console.log('Utilisateur déconnecté');
        // Rediriger vers la page de connexion si pas connecté
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
});

// Fonctions de sauvegarde Firebase

// Sauvegarder un cours
async function saveCourseToFirebase(course) {
    if (!currentUser) return;
    
    try {
        await db.collection('users').doc(currentUser.uid).collection('courses').add({
            name: course.name,
            uploadDate: course.uploadDate,
            fileSize: course.fileSize,
            fileType: course.fileType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Cours sauvegardé dans Firebase');
    } catch (error) {
        console.error('Erreur sauvegarde cours:', error);
    }
}

// Sauvegarder un QCM
async function saveQcmToFirebase(qcm) {
    if (!currentUser) return;
    
    try {
        await db.collection('users').doc(currentUser.uid).collection('qcm').add({
            title: qcm.title,
            questions: qcm.questions,
            courseId: qcm.courseId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('QCM sauvegardé dans Firebase');
    } catch (error) {
        console.error('Erreur sauvegarde QCM:', error);
    }
}

// Sauvegarder des flashcards
async function saveFlashcardsToFirebase(flashcards) {
    if (!currentUser) return;
    
    try {
        await db.collection('users').doc(currentUser.uid).collection('flashcards').add({
            title: flashcards.title,
            cards: flashcards.cards,
            courseId: flashcards.courseId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Flashcards sauvegardées dans Firebase');
    } catch (error) {
        console.error('Erreur sauvegarde flashcards:', error);
    }
}

// Sauvegarder un résumé
async function saveResumeToFirebase(resume) {
    if (!currentUser) return;
    
    try {
        await db.collection('users').doc(currentUser.uid).collection('resumes').add({
            title: resume.title,
            content: resume.content,
            courseId: resume.courseId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Résumé sauvegardé dans Firebase');
    } catch (error) {
        console.error('Erreur sauvegarde résumé:', error);
    }
}

// Sauvegarder un événement du calendrier
async function saveCalendarEventToFirebase(event) {
    if (!currentUser) return;
    
    try {
        await db.collection('users').doc(currentUser.uid).collection('calendar').add({
            title: event.title,
            start: event.start,
            end: event.end,
            backgroundColor: event.backgroundColor,
            extendedProps: event.extendedProps,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Événement calendrier sauvegardé dans Firebase');
    } catch (error) {
        console.error('Erreur sauvegarde événement:', error);
    }
}

// Sauvegarder le profil utilisateur
async function saveUserProfileToFirebase(profile) {
    if (!currentUser) return;
    
    try {
        await db.collection('users').doc(currentUser.uid).set({
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('Profil utilisateur sauvegardé dans Firebase');
    } catch (error) {
        console.error('Erreur sauvegarde profil:', error);
    }
}

// Charger les données depuis Firebase
async function loadUserDataFromFirebase() {
    if (!currentUser) return;
    
    try {
        // Charger les cours
        const coursesSnapshot = await db.collection('users').doc(currentUser.uid).collection('courses').get();
        const courses = [];
        coursesSnapshot.forEach(doc => {
            courses.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Charger les QCM
        const qcmSnapshot = await db.collection('users').doc(currentUser.uid).collection('qcm').get();
        const qcmData = [];
        qcmSnapshot.forEach(doc => {
            qcmData.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('qcmData', JSON.stringify(qcmData));
        
        // Charger les flashcards
        const flashcardsSnapshot = await db.collection('users').doc(currentUser.uid).collection('flashcards').get();
        const flashcardsData = [];
        flashcardsSnapshot.forEach(doc => {
            flashcardsData.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('flashcardsData', JSON.stringify(flashcardsData));
        
        // Charger les résumés
        const resumesSnapshot = await db.collection('users').doc(currentUser.uid).collection('resumes').get();
        const resumesData = [];
        resumesSnapshot.forEach(doc => {
            resumesData.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('resumesData', JSON.stringify(resumesData));
        
        // Charger les événements du calendrier
        const calendarSnapshot = await db.collection('users').doc(currentUser.uid).collection('calendar').get();
        const calendarEvents = [];
        calendarSnapshot.forEach(doc => {
            calendarEvents.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('myCalendarEvents', JSON.stringify(calendarEvents));
        
        console.log('Données chargées depuis Firebase');
        
        // Mettre à jour l'interface
        if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
        }
        if (typeof displayRecentCourses === 'function') {
            displayRecentCourses();
        }
        
    } catch (error) {
        console.error('Erreur chargement données Firebase:', error);
    }
}

// Fonctions d'authentification Firebase

// Inscription avec email/mot de passe
async function registerWithEmail(email, password, displayName) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Mettre à jour le profil
        await user.updateProfile({
            displayName: displayName
        });
        
        // Sauvegarder le profil dans Firestore
        await saveUserProfileToFirebase({
            name: displayName,
            email: email,
            avatar: null
        });
        
        console.log('Inscription réussie');
        return { success: true, user: user };
    } catch (error) {
        console.error('Erreur inscription:', error);
        return { success: false, error: error.message };
    }
}

// Connexion avec email/mot de passe
async function loginWithEmail(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('Connexion réussie');
        return { success: true, user: user };
    } catch (error) {
        console.error('Erreur connexion:', error);
        return { success: false, error: error.message };
    }
}

// Réinitialisation du mot de passe
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        console.log('Email de réinitialisation envoyé');
        return { success: true };
    } catch (error) {
        console.error('Erreur réinitialisation:', error);
        return { success: false, error: error.message };
    }
}

// Déconnexion
async function logoutUser() {
    try {
        await auth.signOut();
        console.log('Déconnexion réussie');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erreur déconnexion:', error);
    }
}

// Exposer les fonctions globalement
window.firebaseAuth = {
    registerWithEmail,
    loginWithEmail,
    resetPassword,
    logoutUser,
    saveCourseToFirebase,
    saveQcmToFirebase,
    saveFlashcardsToFirebase,
    saveResumeToFirebase,
    saveCalendarEventToFirebase,
    saveUserProfileToFirebase,
    loadUserDataFromFirebase
};