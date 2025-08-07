// Variables globales
let currentUser = null;
let courses = [];
let qcmData = [];
let flashcardsData = [];
let calendarEvents = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserData();
    loadCalendarEvents();
});

// Initialisation de l'application
function initializeApp() {
    // Charger les données utilisateur depuis localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
    }

    // Charger l'avatar utilisateur
    loadUserAvatar();

    // Charger les données des cours
    const savedCourses = localStorage.getItem('courses');
    if (savedCourses) {
        courses = JSON.parse(savedCourses);
        updateDashboardStats();
        displayRecentCourses();
    }

    // Charger les données QCM
    const savedQcm = localStorage.getItem('qcmData');
    if (savedQcm) {
        qcmData = JSON.parse(savedQcm);
    }

    // Charger les données flashcards
    const savedFlashcards = localStorage.getItem('flashcardsData');
    if (savedFlashcards) {
        flashcardsData = JSON.parse(savedFlashcards);
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            showSection(section);
        });
    });

    // Import de fichiers
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        // Ne pas forcer le click sur l'input ici, le bouton le fait déjà
    }

    // Formulaire de profil
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }

    // Formulaire de contact
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Formulaire de contact connecté
    const dashboardContactForm = document.getElementById('dashboardContactForm');
    if (dashboardContactForm) {
        dashboardContactForm.addEventListener('submit', handleDashboardContactSubmit);
    }
}

// Gestion de l'upload de fichiers améliorée
function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        processFiles(Array.from(files));
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
}

function processFiles(files) {
    // Accepter PDF, DOCX, TXT
    const validFiles = files.filter(file =>
        file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'text/plain' ||
        file.name.toLowerCase().endsWith('.pdf') ||
        file.name.toLowerCase().endsWith('.docx') ||
        file.name.toLowerCase().endsWith('.txt')
    );
    if (validFiles.length === 0) {
        showNotification('Veuillez sélectionner un fichier PDF, DOCX ou TXT valide.', 'error');
        return;
    }
    showImportProgress();
    let processedCount = 0;
    validFiles.forEach((file, index) => {
        setTimeout(() => {
            processFile(file);
            processedCount++;
            if (processedCount === validFiles.length) {
                hideImportProgress();
                showNotification(`${validFiles.length} fichier(s) importé(s) avec succès !`, 'success');
                updateDashboardStats();
                displayRecentCourses();
            }
        }, (index + 1) * 1000);
    });
}

function processFile(file) {
    const course = {
        id: Date.now() + Math.random(),
        name: file.name.replace('.pdf', ''),
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        size: file.size,
        qcmCount: parseInt(document.getElementById('qcmCount').value) || 10,
        flashcardsCount: parseInt(document.getElementById('flashcardsCount').value) || 20,
        difficulty: document.getElementById('difficulty').value || 'moyen'
    };

    courses.push(course);
    localStorage.setItem('courses', JSON.stringify(courses));

    // Sauvegarder dans Firebase si disponible
    if (typeof firebaseAuth !== 'undefined' && firebaseAuth.saveCourseToFirebase) {
        firebaseAuth.saveCourseToFirebase(course);
    }

    // Générer des QCM et flashcards simulés
    generateQcmForCourse(course);
    generateFlashcardsForCourse(course);
}

function generateQcmForCourse(course) {
    const qcm = {
        id: Date.now() + Math.random(),
        courseId: course.id,
        courseName: course.name,
        questions: generateMockQuestions(course.qcmCount),
        difficulty: course.difficulty,
        createdAt: new Date().toISOString()
    };

    qcmData.push(qcm);
    localStorage.setItem('qcmData', JSON.stringify(qcmData));

    // Sauvegarder dans Firebase si disponible
    if (typeof firebaseAuth !== 'undefined' && firebaseAuth.saveQcmToFirebase) {
        firebaseAuth.saveQcmToFirebase(qcm);
    }
}

function generateFlashcardsForCourse(course) {
    const flashcards = {
        id: Date.now() + Math.random(),
        courseId: course.id,
        courseName: course.name,
        cards: generateMockFlashcards(course.flashcardsCount),
        createdAt: new Date().toISOString()
    };

    flashcardsData.push(flashcards);
    localStorage.setItem('flashcardsData', JSON.stringify(flashcardsData));

    // Sauvegarder dans Firebase si disponible
    if (typeof firebaseAuth !== 'undefined' && firebaseAuth.saveFlashcardsToFirebase) {
        firebaseAuth.saveFlashcardsToFirebase(flashcards);
    }
}

function generateMockQuestions(count) {
    const questions = [];
    for (let i = 1; i <= count; i++) {
        questions.push({
            id: i,
            question: `Question ${i} du cours`,
            options: [
                `Option A pour la question ${i}`,
                `Option B pour la question ${i}`,
                `Option C pour la question ${i}`,
                `Option D pour la question ${i}`
            ],
            correctAnswer: Math.floor(Math.random() * 4)
        });
    }
    return questions;
}

function generateMockFlashcards(count) {
    const cards = [];
    for (let i = 1; i <= count; i++) {
        cards.push({
            id: i,
            front: `Question ${i}`,
            back: `Réponse ${i}`
        });
    }
    return cards;
}

// Affichage des sections
function showSection(sectionId) {
    // Masquer toutes les sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });

    // Afficher la section demandée
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Mettre à jour la navigation active
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Charger le contenu spécifique si nécessaire
    if (sectionId === 'qcm') {
        displayQcmList();
    } else if (sectionId === 'flashcards') {
        displayFlashcardsList();
    } else if (sectionId === 'resumes') {
        displayResumesList();
    } else if (sectionId === 'calendrier') {
        initializeCalendar();
    } else if (sectionId === 'contact') {
        autoFillContactForm();
    }
}

// Mise à jour des statistiques du dashboard
function updateDashboardStats() {
    document.getElementById('coursCount').textContent = courses.length;
    document.getElementById('qcmCount').textContent = qcmData.length;
    document.getElementById('flashcardsCount').textContent = flashcardsData.length;
    
    // Calculer le score moyen
    const totalScores = qcmData.reduce((total, qcm) => {
        return total + (qcm.averageScore || 0);
    }, 0);
    const averageScore = qcmData.length > 0 ? Math.round(totalScores / qcmData.length) : 0;
    document.getElementById('scoreMoyen').textContent = `${averageScore}%`;
}

// Affichage des cours récents
function displayRecentCourses() {
    const container = document.getElementById('recentCoursesList');
    if (!container) return;

    if (courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-pdf"></i>
                <h3>Aucun cours importé</h3>
                <p>Commencez par importer votre premier cours</p>
                <button onclick="showSection('import')" class="btn-primary">
                    Importer un cours
                </button>
            </div>
        `;
        return;
    }

    const recentCourses = courses.slice(-4); // Afficher les 4 derniers cours
    container.innerHTML = recentCourses.map(course => `
        <div class="course-card">
            <div class="course-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <div class="course-info">
                <h4>${course.name}</h4>
                <p>Importé le ${new Date(course.uploadDate).toLocaleDateString()}</p>
                <div class="course-actions">
                    <button onclick="startQcm('${course.id}')" class="btn-small">
                        <i class="fas fa-play"></i> QCM
                    </button>
                    <button onclick="startFlashcards('${course.id}')" class="btn-small">
                        <i class="fas fa-layer-group"></i> Flashcards
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Gestion des QCM
function displayQcmList() {
    const container = document.getElementById('qcmList');
    if (!container) return;

    if (qcmData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <h3>Aucun QCM disponible</h3>
                <p>Importez un cours pour générer des QCM</p>
                <button onclick="showSection('import')" class="btn-primary">
                    Importer un cours
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = qcmData.map(qcm => `
        <div class="qcm-card">
            <div class="qcm-header">
                <h4>${qcm.courseName}</h4>
                <span class="difficulty-badge ${qcm.difficulty}">${qcm.difficulty}</span>
            </div>
            <div class="qcm-info">
                <p><i class="fas fa-question-circle"></i> ${qcm.questions.length} questions</p>
                <p><i class="fas fa-calendar"></i> ${new Date(qcm.createdAt).toLocaleDateString()}</p>
            </div>
            <button onclick="startQcm('${qcm.id}')" class="btn-primary">
                <i class="fas fa-play"></i> Commencer
            </button>
        </div>
    `).join('');
}

function startQcm(qcmId) {
    const qcm = qcmData.find(q => q.id == qcmId);
    if (!qcm) return;

    const modal = document.getElementById('qcmModal');
    const content = document.getElementById('qcmContent');
    const title = document.getElementById('qcmTitle');

    title.textContent = `QCM - ${qcm.courseName}`;
    
    let currentQuestion = 0;
    let userAnswers = [];
    let score = 0;

    function displayQuestion() {
        const question = qcm.questions[currentQuestion];
        content.innerHTML = `
            <div class="qcm-question">
                <div class="question-header">
                    <span class="question-number">Question ${currentQuestion + 1} / ${qcm.questions.length}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((currentQuestion + 1) / qcm.questions.length) * 100}%"></div>
                    </div>
                </div>
                <h3>${question.question}</h3>
                <div class="options">
                    ${question.options.map((option, index) => `
                        <label class="option">
                            <input type="radio" name="answer" value="${index}">
                            <span class="option-text">${option}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="qcm-actions">
                    ${currentQuestion > 0 ? '<button onclick="previousQuestion()" class="btn-secondary">Précédent</button>' : ''}
                    <button onclick="nextQuestion()" class="btn-primary">
                        ${currentQuestion === qcm.questions.length - 1 ? 'Terminer' : 'Suivant'}
                    </button>
                </div>
            </div>
        `;
    }

    window.nextQuestion = function() {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        if (!selectedAnswer && currentQuestion < qcm.questions.length - 1) {
            showNotification('Veuillez sélectionner une réponse.', 'error');
            return;
        }

        if (selectedAnswer) {
            userAnswers[currentQuestion] = parseInt(selectedAnswer.value);
            const correctAnswer = qcm.questions[currentQuestion].correctAnswer;
            if (userAnswers[currentQuestion] === correctAnswer) {
                score++;
            }
        }

        currentQuestion++;
        
        if (currentQuestion >= qcm.questions.length) {
            showResults();
        } else {
            displayQuestion();
        }
    };

    window.previousQuestion = function() {
        if (currentQuestion > 0) {
            currentQuestion--;
            displayQuestion();
        }
    };

    function showResults() {
        const percentage = Math.round((score / qcm.questions.length) * 100);
        content.innerHTML = `
            <div class="qcm-results">
                <h3>Résultats du QCM</h3>
                <div class="score-display">
                    <span class="score">${score} / ${qcm.questions.length}</span>
                    <span class="percentage">${percentage}%</span>
                </div>
                <div class="results-actions">
                    <button onclick="closeQcmModal()" class="btn-secondary">Fermer</button>
                    <button onclick="retakeQcm()" class="btn-primary">Recommencer</button>
                </div>
            </div>
        `;

        // Sauvegarder le score
        qcm.averageScore = percentage;
        localStorage.setItem('qcmData', JSON.stringify(qcmData));
        updateDashboardStats();
    }

    window.retakeQcm = function() {
        currentQuestion = 0;
        userAnswers = [];
        score = 0;
        displayQuestion();
    };

    modal.style.display = 'flex';
    displayQuestion();
}

// Gestion des flashcards
function displayFlashcardsList() {
    const container = document.getElementById('flashcardsList');
    if (!container) return;

    if (flashcardsData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-layer-group"></i>
                <h3>Aucune flashcard disponible</h3>
                <p>Importez un cours pour générer des flashcards</p>
                <button onclick="showSection('import')" class="btn-primary">
                    Importer un cours
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = flashcardsData.map(flashcard => `
        <div class="flashcard-set-card">
            <div class="flashcard-header">
                <h4>${flashcard.courseName}</h4>
                <span class="card-count">${flashcard.cards.length} cartes</span>
            </div>
            <div class="flashcard-info">
                <p><i class="fas fa-calendar"></i> ${new Date(flashcard.createdAt).toLocaleDateString()}</p>
            </div>
            <button onclick="startFlashcards('${flashcard.id}')" class="btn-primary">
                <i class="fas fa-play"></i> Commencer
            </button>
        </div>
    `).join('');
}

function startFlashcards(flashcardId) {
    const flashcard = flashcardsData.find(f => f.id == flashcardId);
    if (!flashcard) return;

    const modal = document.getElementById('flashcardsModal');
    const content = document.getElementById('flashcardsContent');
    
    let currentCard = 0;
    let isFlipped = false;

    function displayCard() {
        const card = flashcard.cards[currentCard];
        content.innerHTML = `
            <div class="flashcard-container">
                <div class="flashcard ${isFlipped ? 'flipped' : ''}" onclick="flipCard()">
                    <div class="flashcard-front">
                        <h3>${card.front}</h3>
                        <p class="hint">Cliquez pour voir la réponse</p>
                    </div>
                    <div class="flashcard-back">
                        <h3>${card.back}</h3>
                    </div>
                </div>
                <div class="flashcard-navigation">
                    <button onclick="previousCard()" class="btn-secondary" ${currentCard === 0 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i> Précédent
                    </button>
                    <span class="card-counter">${currentCard + 1} / ${flashcard.cards.length}</span>
                    <button onclick="nextCard()" class="btn-secondary" ${currentCard === flashcard.cards.length - 1 ? 'disabled' : ''}>
                        Suivant <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    window.flipCard = function() {
        isFlipped = !isFlipped;
        displayCard();
    };

    window.nextCard = function() {
        if (currentCard < flashcard.cards.length - 1) {
            currentCard++;
            isFlipped = false;
            displayCard();
        }
    };

    window.previousCard = function() {
        if (currentCard > 0) {
            currentCard--;
            isFlipped = false;
            displayCard();
        }
    };

    modal.style.display = 'flex';
    displayCard();
}

// Gestion des résumés
function displayResumesList() {
    const container = document.getElementById('resumesList');
    if (!container) return;

    if (courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <h3>Aucun résumé disponible</h3>
                <p>Importez un cours pour générer des résumés</p>
                <button onclick="showSection('import')" class="btn-primary">
                    Importer un cours
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = courses.map(course => `
        <div class="resume-card">
            <div class="resume-header">
                <h4>${course.name}</h4>
                <span class="resume-date">${new Date(course.uploadDate).toLocaleDateString()}</span>
            </div>
            <div class="resume-content">
                <p>Résumé généré automatiquement par l'IA pour le cours "${course.name}".</p>
                <div class="resume-actions">
                    <button onclick="viewResume('${course.id}')" class="btn-primary">
                        <i class="fas fa-eye"></i> Voir le résumé
                    </button>
                    <button onclick="downloadResume('${course.id}')" class="btn-secondary">
                        <i class="fas fa-download"></i> Télécharger
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Gestion du profil utilisateur
function loadUserData() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name || 'Utilisateur';
        document.getElementById('profileName').value = currentUser.name || '';
        document.getElementById('profileEmail').value = currentUser.email || '';
        document.getElementById('profileBio').value = currentUser.bio || '';
        
        if (currentUser.avatar) {
            document.getElementById('userAvatar').innerHTML = `<img src="${currentUser.avatar}" alt="Avatar">`;
            document.getElementById('profileAvatar').innerHTML = `<img src="${currentUser.avatar}" alt="Avatar">`;
        }
    }
}

function handleProfileSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        bio: document.getElementById('profileBio').value
    };

    if (currentUser) {
        currentUser = { ...currentUser, ...formData };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('userName').textContent = currentUser.name;
    }

    showNotification('Profil mis à jour avec succès !', 'success');
}

// Gestion du contact
function handleContactSubmit(event) {
    // Le formulaire sera soumis directement à Formspree
    // On ajoute juste une notification de succès
    showNotification('Envoi du message en cours...', 'info');
}

function handleDashboardContactSubmit(event) {
    // Le formulaire sera soumis directement à Formspree
    // On ajoute juste une notification de succès
    showNotification('Envoi du message en cours...', 'info');
}

// Auto-remplissage du formulaire de contact pour les utilisateurs connectés
function autoFillContactForm() {
    if (currentUser) {
        const contactName = document.getElementById('contactName');
        const contactEmail = document.getElementById('contactEmail');
        
        if (contactName && contactEmail) {
            contactName.value = currentUser.name || '';
            contactEmail.value = currentUser.email || '';
        }
    }
}

// Gestion du calendrier
function loadCalendarEvents() {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
        calendarEvents = JSON.parse(savedEvents);
    }
}

function initializeCalendar() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;

    const today = new Date();
    const currentWeek = getWeekDates(today);
    
    container.innerHTML = `
        <div class="calendar-header">
            <button onclick="previousWeek()" class="btn-calendar-nav">
                <i class="fas fa-chevron-left"></i>
            </button>
            <h3>${formatWeekRange(currentWeek)}</h3>
            <button onclick="nextWeek()" class="btn-calendar-nav">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        <div class="calendar-grid">
            <div class="calendar-time-column">
                <div class="time-header">Heure</div>
                ${generateTimeSlots()}
            </div>
            ${generateDayColumns(currentWeek)}
        </div>
        <div class="calendar-actions">
            <button onclick="showAddEventModal()" class="btn-primary">
                <i class="fas fa-plus"></i> Ajouter un événement
            </button>
        </div>
    `;

    displayEvents(currentWeek);
}

function generateTimeSlots() {
    let slots = '';
    for (let hour = 8; hour <= 20; hour++) {
        slots += `<div class="time-slot">${hour}:00</div>`;
    }
    return slots;
}

function generateDayColumns(weekDates) {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return weekDates.map((date, index) => `
        <div class="calendar-day-column">
            <div class="day-header">
                <span class="day-name">${days[index]}</span>
                <span class="day-date">${date.getDate()}</span>
            </div>
            ${generateDaySlots(date)}
        </div>
    `).join('');
}

function generateDaySlots(date) {
    let slots = '';
    for (let hour = 8; hour <= 20; hour++) {
        const slotId = `${date.toISOString().split('T')[0]}-${hour}`;
        slots += `<div class="day-slot" data-slot="${slotId}" onclick="addEventToSlot('${slotId}')"></div>`;
    }
    return slots;
}

function getWeekDates(date) {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        week.push(day);
    }
    return week;
}

function formatWeekRange(weekDates) {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

function displayEvents(weekDates) {
    // Nettoyer les événements existants
    document.querySelectorAll('.calendar-event').forEach(event => event.remove());
    
    // Afficher les événements de la semaine
    calendarEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const weekStart = weekDates[0];
        const weekEnd = weekDates[6];
        
        if (eventDate >= weekStart && eventDate <= weekEnd) {
            const dayIndex = eventDate.getDay() - 1;
            if (dayIndex >= 0 && dayIndex < 7) {
                const slotId = `${event.date}-${event.startHour}`;
                const slot = document.querySelector(`[data-slot="${slotId}"]`);
                if (slot) {
                    const eventElement = createEventElement(event);
                    slot.appendChild(eventElement);
                }
            }
        }
    });
}

function createEventElement(event) {
    const element = document.createElement('div');
    element.className = 'calendar-event';
    element.style.backgroundColor = event.color || '#2563eb';
    element.style.height = `${(event.endHour - event.startHour) * 60}px`;
    element.innerHTML = `
        <div class="event-title">${event.title}</div>
        <div class="event-time">${event.startHour}:00 - ${event.endHour}:00</div>
    `;
    element.onclick = () => editEvent(event.id);
    return element;
}

function showAddEventModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Ajouter un événement</h3>
                <button onclick="closeModal()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="addEventForm" class="modal-form">
                <div class="form-group">
                    <label for="eventTitle">Titre</label>
                    <input type="text" id="eventTitle" required>
                </div>
                <div class="form-group">
                    <label for="eventDate">Date</label>
                    <input type="date" id="eventDate" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="eventStartHour">Heure de début</label>
                        <select id="eventStartHour" required>
                            ${generateHourOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="eventEndHour">Heure de fin</label>
                        <select id="eventEndHour" required>
                            ${generateHourOptions()}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="eventCategory">Catégorie</label>
                    <select id="eventCategory" required>
                        <option value="cours">Cours</option>
                        <option value="qcm">QCM</option>
                        <option value="revision">Révision</option>
                        <option value="pause">Pause</option>
                        <option value="autre">Autre</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="eventColor">Couleur</label>
                    <input type="color" id="eventColor" value="#2563eb">
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal()" class="btn-secondary">Annuler</button>
                    <button type="submit" class="btn-primary">Ajouter</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Définir la date d'aujourd'hui par défaut
    document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
    
    // Gérer la soumission du formulaire
    document.getElementById('addEventForm').addEventListener('submit', handleAddEvent);
}

function generateHourOptions() {
    let options = '';
    for (let hour = 8; hour <= 20; hour++) {
        options += `<option value="${hour}">${hour}:00</option>`;
    }
    return options;
}

function handleAddEvent(event) {
    event.preventDefault();
    
    const newEvent = {
        id: Date.now() + Math.random(),
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        startHour: parseInt(document.getElementById('eventStartHour').value),
        endHour: parseInt(document.getElementById('eventEndHour').value),
        category: document.getElementById('eventCategory').value,
        color: document.getElementById('eventColor').value
    };
    
    calendarEvents.push(newEvent);
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
    
    closeModal();
    initializeCalendar();
    showNotification('Événement ajouté avec succès !', 'success');
}

function editEvent(eventId) {
    const event = calendarEvents.find(e => e.id == eventId);
    if (!event) return;
    
    // Créer un modal d'édition similaire à celui d'ajout
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Modifier l'événement</h3>
                <button onclick="closeModal()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="editEventForm" class="modal-form">
                <div class="form-group">
                    <label for="editEventTitle">Titre</label>
                    <input type="text" id="editEventTitle" value="${event.title}" required>
                </div>
                <div class="form-group">
                    <label for="editEventDate">Date</label>
                    <input type="date" id="editEventDate" value="${event.date}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editEventStartHour">Heure de début</label>
                        <select id="editEventStartHour" required>
                            ${generateHourOptionsWithSelected(event.startHour)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editEventEndHour">Heure de fin</label>
                        <select id="editEventEndHour" required>
                            ${generateHourOptionsWithSelected(event.endHour)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="editEventCategory">Catégorie</label>
                    <select id="editEventCategory" required>
                        <option value="cours" ${event.category === 'cours' ? 'selected' : ''}>Cours</option>
                        <option value="qcm" ${event.category === 'qcm' ? 'selected' : ''}>QCM</option>
                        <option value="revision" ${event.category === 'revision' ? 'selected' : ''}>Révision</option>
                        <option value="pause" ${event.category === 'pause' ? 'selected' : ''}>Pause</option>
                        <option value="autre" ${event.category === 'autre' ? 'selected' : ''}>Autre</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editEventColor">Couleur</label>
                    <input type="color" id="editEventColor" value="${event.color}">
                </div>
                <div class="form-actions">
                    <button type="button" onclick="deleteEvent(${event.id})" class="btn-danger">Supprimer</button>
                    <button type="button" onclick="closeModal()" class="btn-secondary">Annuler</button>
                    <button type="submit" class="btn-primary">Modifier</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Gérer la soumission du formulaire
    document.getElementById('editEventForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleEditEvent(event.id);
    });
}

function generateHourOptionsWithSelected(selectedHour) {
    let options = '';
    for (let hour = 8; hour <= 20; hour++) {
        const selected = hour === selectedHour ? 'selected' : '';
        options += `<option value="${hour}" ${selected}>${hour}:00</option>`;
    }
    return options;
}

function handleEditEvent(eventId) {
    const eventIndex = calendarEvents.findIndex(e => e.id == eventId);
    if (eventIndex === -1) return;
    
    calendarEvents[eventIndex] = {
        ...calendarEvents[eventIndex],
        title: document.getElementById('editEventTitle').value,
        date: document.getElementById('editEventDate').value,
        startHour: parseInt(document.getElementById('editEventStartHour').value),
        endHour: parseInt(document.getElementById('editEventEndHour').value),
        category: document.getElementById('editEventCategory').value,
        color: document.getElementById('editEventColor').value
    };
    
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
    
    closeModal();
    initializeCalendar();
    showNotification('Événement modifié avec succès !', 'success');
}

function deleteEvent(eventId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        calendarEvents = calendarEvents.filter(e => e.id != eventId);
        localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
        
        closeModal();
        initializeCalendar();
        showNotification('Événement supprimé avec succès !', 'success');
    }
}

// Fonctions utilitaires
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function closeQcmModal() {
    document.getElementById('qcmModal').style.display = 'none';
}

function closeFlashcardsModal() {
    document.getElementById('flashcardsModal').style.display = 'none';
}

function showImportProgress() {
    const progress = document.getElementById('importProgress');
    if (progress) {
        progress.style.display = 'block';
    }
}

function hideImportProgress() {
    const progress = document.getElementById('importProgress');
    if (progress) {
        progress.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function updateUserInterface() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name || 'Utilisateur';
    }
}

function logout() {
    if (typeof firebaseAuth !== 'undefined' && firebaseAuth.logoutUser) {
        firebaseAuth.logoutUser();
    } else {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// Navigation du calendrier
function previousWeek() {
    // Logique pour aller à la semaine précédente
    initializeCalendar();
}

function nextWeek() {
    // Logique pour aller à la semaine suivante
    initializeCalendar();
}

function addEventToSlot(slotId) {
    // Logique pour ajouter un événement à un créneau spécifique
    showAddEventModal();
}

// Fonction pour changer l'avatar
function changeAvatar() {
    // Créer un input file caché
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const avatarData = e.target.result;
                
                // Mettre à jour l'avatar dans l'interface
                const profileAvatar = document.getElementById('profileAvatar');
                const userAvatar = document.getElementById('userAvatar');
                
                if (profileAvatar) {
                    profileAvatar.innerHTML = `<img src="${avatarData}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                }
                
                if (userAvatar) {
                    userAvatar.innerHTML = `<img src="${avatarData}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                }
                
                // Sauvegarder l'avatar dans localStorage
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                currentUser.avatar = avatarData;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                // Sauvegarder dans Firebase si disponible
                if (typeof firebaseAuth !== 'undefined' && firebaseAuth.saveUserProfileToFirebase) {
                    firebaseAuth.saveUserProfileToFirebase({
                        name: currentUser.name || 'Utilisateur',
                        email: currentUser.email || '',
                        avatar: avatarData
                    });
                }
                
                showNotification('Avatar mis à jour', 'Votre avatar a été modifié avec succès');
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

// Fonction pour charger l'avatar utilisateur
function loadUserAvatar() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const profileAvatar = document.getElementById('profileAvatar');
    const userAvatar = document.getElementById('userAvatar');
    
    if (currentUser.avatar) {
        if (profileAvatar) {
            profileAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
        if (userAvatar) {
            userAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
    }
}