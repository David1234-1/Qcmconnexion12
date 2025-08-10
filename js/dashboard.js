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
    const selectFileBtn = document.getElementById('selectFileBtn');
    const startImportBtn = document.getElementById('startImportBtn');
    
    if (fileInput) {
        // Mise en file d’attente des fichiers sélectionnés
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
                pendingImportFiles = files;
                showNotification(`${files.length} fichier(s) prêt(s) à importer. Cliquez sur Importer.`, 'info');
            }
        });
    }
    if (selectFileBtn && fileInput) {
        selectFileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });
    }
    if (startImportBtn) {
        startImportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!pendingImportFiles || pendingImportFiles.length === 0) {
                showNotification('Aucun fichier sélectionné.', 'error');
                return;
            }
            processFiles(pendingImportFiles);
            pendingImportFiles = [];
            if (fileInput) fileInput.value = '';
        });
    }
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('click', () => fileInput.click());
    }

    // Formulaire de profil
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
    // Input de changement d’avatar caché
    const avatarInput = document.createElement('input');
    avatarInput.type = 'file';
    avatarInput.accept = 'image/*';
    avatarInput.id = 'avatarInputHidden';
    avatarInput.style.display = 'none';
    document.body.appendChild(avatarInput);
    const avatarBtn = document.querySelector('.btn-change-avatar');
    if (avatarBtn) {
        avatarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            avatarInput.click();
        });
    }
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            if (currentUser) {
                currentUser.avatar = dataUrl;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                loadUserData();
                showNotification('Avatar mis à jour !', 'success');
            }
        };
        reader.readAsDataURL(file);
    });

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

    // Toolbar des cours
    const searchCours = document.getElementById('searchCours');
    const filterMatiere = document.getElementById('filterMatiere');
    const filterParcours = document.getElementById('filterParcours');
    if (searchCours) searchCours.addEventListener('input', displayCourses);
    if (filterMatiere) filterMatiere.addEventListener('change', displayCourses);
    if (filterParcours) filterParcours.addEventListener('change', displayCourses);

    // Matières
    const addMatiereBtn = document.getElementById('addMatiereBtn');
    if (addMatiereBtn) addMatiereBtn.addEventListener('click', addMatiere);

    // Calendrier vues et navigation
    const viewDay = document.getElementById('viewDay');
    const viewWeek = document.getElementById('viewWeek');
    const viewMonth = document.getElementById('viewMonth');
    const prevPeriod = document.getElementById('prevPeriod');
    const nextPeriod = document.getElementById('nextPeriod');
    const addEventBtn = document.getElementById('addEventBtn');

    if (viewDay) viewDay.addEventListener('click', () => changeCalendarView('day'));
    if (viewWeek) viewWeek.addEventListener('click', () => changeCalendarView('week'));
    if (viewMonth) viewMonth.addEventListener('click', () => changeCalendarView('month'));
    if (prevPeriod) prevPeriod.addEventListener('click', () => navigateCalendar(-1));
    if (nextPeriod) nextPeriod.addEventListener('click', () => navigateCalendar(1));
    if (addEventBtn) addEventBtn.addEventListener('click', showAddEventModal);
}

// Files en attente d’import
let pendingImportFiles = [];

// Gestion de l'upload de fichiers améliorée
function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        pendingImportFiles = Array.from(files);
        showNotification(`${files.length} fichier(s) prêt(s) à importer. Cliquez sur Importer.`, 'info');
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
    pendingImportFiles = files;
    showNotification(`${files.length} fichier(s) prêt(s) à importer. Cliquez sur Importer.`, 'info');
}

function processFiles(files) {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
    ];
    const acceptedFiles = files.filter(file => allowed.includes(file.type) || file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.ppt') || file.name.toLowerCase().endsWith('.pptx') || file.name.toLowerCase().endsWith('.txt'));
    
    if (acceptedFiles.length === 0) {
        showNotification('Veuillez sélectionner des fichiers valides.', 'error');
        return;
    }

    showImportProgress();
    
    let processedCount = 0;
    acceptedFiles.forEach((file, index) => {
        setTimeout(() => {
            processFile(file);
            processedCount++;
            if (processedCount === acceptedFiles.length) {
                hideImportProgress();
                showNotification(`${acceptedFiles.length} fichier(s) importé(s) avec succès !`, 'success');
                updateDashboardStats();
                displayRecentCourses();
                displayCourses();
            }
        }, (index + 1) * 500);
    });
}

function processFile(file) {
    const course = {
        id: Date.now() + Math.random(),
        name: file.name.replace(/\.[^.]+$/, ''),
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        size: file.size,
        qcmCount: parseInt(document.getElementById('qcmCount')?.value) || 10,
        flashcardsCount: parseInt(document.getElementById('flashcardsCount')?.value) || 20,
        difficulty: document.getElementById('difficulty')?.value || 'moyen',
        matiere: '',
        parcours: '',
        mimeType: file.type || '',
        filePreviewUrl: ''
    };

    // Créer un preview local pour images/PDF via blob URL
    try {
        course.filePreviewUrl = URL.createObjectURL(file);
    } catch {}

    courses.push(course);
    localStorage.setItem('courses', JSON.stringify(courses));

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
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };

    // Validation
    if (!data.name || !data.email || !data.message) {
        showNotification('Veuillez remplir tous les champs.', 'error');
        return;
    }

    // Envoi vers Formspree
    fetch('https://formspree.io/f/mqalgpdg', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            showNotification('Message envoyé avec succès !', 'success');
            event.target.reset();
        } else {
            throw new Error('Erreur lors de l\'envoi');
        }
    })
    .catch(error => {
        showNotification('Erreur lors de l\'envoi du message.', 'error');
    });
}

function handleDashboardContactSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };

    // Validation
    if (!data.name || !data.email || !data.message) {
        showNotification('Veuillez remplir tous les champs.', 'error');
        return;
    }

    // Envoi vers Formspree
    fetch('https://formspree.io/f/mqalgpdg', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            showNotification('Message envoyé avec succès !', 'success');
            event.target.reset();
        } else {
            throw new Error('Erreur lors de l\'envoi');
        }
    })
    .catch(error => {
        showNotification('Erreur lors de l\'envoi du message.', 'error');
    });
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
    const rangeLabel = document.getElementById('currentRange');
    if (!container) return;

    let html = '';
    if (calendarView === 'day') {
        const d = new Date(calendarCursorDate);
        const rangeText = d.toLocaleDateString();
        if (rangeLabel) rangeLabel.textContent = rangeText;
        html = `<div class="calendar-day">${generateDaySlotsHtml(d)}</div>`;
        container.innerHTML = html;
        displayEvents([d]);
    } else if (calendarView === 'week') {
        const week = getWeekDates(calendarCursorDate);
        if (rangeLabel) rangeLabel.textContent = formatWeekRange(week);
        html = `<div class="calendar-grid"><div class="calendar-time-column">${generateTimeSlots()}</div>${generateDayColumns(week)}</div>`;
        container.innerHTML = html;
        displayEvents(week);
    } else {
        const monthDates = getMonthDates(calendarCursorDate);
        if (rangeLabel) rangeLabel.textContent = formatMonthRange(calendarCursorDate);
        html = `<div class="calendar-month">${generateMonthGrid(monthDates)}</div>`;
        container.innerHTML = html;
        displayEventsMonth(monthDates);
    }
}

function generateDaySlotsHtml(date) {
    return `<div class="day-header"><span>${date.toLocaleDateString()}</span></div>${generateDaySlots(date)}`;
}

function getMonthDates(date) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const days = [];
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
    }
    return days;
}

function generateMonthGrid(days) {
    const weeks = [];
    let week = [];
    days.forEach((d, idx) => {
        if ((d.getDay() === 1 || idx === 0) && week.length) {
            weeks.push(week);
            week = [];
        }
        week.push(d);
    });
    if (week.length) weeks.push(week);
    return weeks.map(w => `<div class="month-week">${w.map(d => `<div class="month-day"><div class="day-label">${d.getDate()}</div></div>`).join('')}</div>`).join('');
}

function formatMonthRange(date) {
    const m = date.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    return m;
}

function displayEventsMonth(days) {
    // Simplifié: réutilise displayEvents avec une semaine couvrant le mois
    displayEvents([days[0], days[days.length - 1]]);
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
                        <option value="devoir">Devoir</option>
                        <option value="qcm">QCM</option>
                        <option value="revision">Révision</option>
                        <option value="projet">Projet</option>
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
    document.getElementById('eventDate').value = calendarCursorDate.toISOString().split('T')[0];
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

async function logout() {
    try {
        if (window.supabase?.auth?.signOut) {
            await window.supabase.auth.signOut()
        }
    } catch (e) {}
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
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

// Affichage des cours + visionneuse
function displayCourses() {
    const container = document.getElementById('coursesTable');
    if (!container) return;

    let filtered = [...courses];
    const q = document.getElementById('searchCours')?.value?.toLowerCase() || '';
    const matiere = document.getElementById('filterMatiere')?.value || '';
    const parcours = document.getElementById('filterParcours')?.value || '';
    if (q) filtered = filtered.filter(c => c.name.toLowerCase().includes(q));
    if (matiere) filtered = filtered.filter(c => (c.matiere || '') === matiere);
    if (parcours) filtered = filtered.filter(c => (c.parcours || '') === parcours);

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-book"></i><h3>Aucun cours</h3></div>`;
        return;
    }

    container.innerHTML = filtered.map(c => `
        <div class="course-card">
            <div class="course-icon"><i class="fas fa-file"></i></div>
            <div class="course-info">
                <h4>${c.name}</h4>
                <p>${new Date(c.uploadDate).toLocaleDateString()}</p>
                <div class="course-meta">
                    <span>${c.matiere || 'Sans matière'}</span>
                    <span>${c.parcours || ''}</span>
                </div>
                <div class="course-actions">
                    <button class="btn-small" onclick="openViewer('${c.id}')"><i class="fas fa-eye"></i> Ouvrir</button>
                    <button class="btn-small" onclick="startQcm('${c.id}')"><i class="fas fa-play"></i> QCM</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.openViewer = function(courseId) {
    const course = courses.find(c => c.id == courseId);
    if (!course) return;
    const modal = document.getElementById('viewerModal');
    const body = document.getElementById('viewerBody');
    const title = document.getElementById('viewerTitle');
    title.textContent = course.fileName;

    const type = (course.mimeType || '').toLowerCase();
    let html = '';
    if (type.includes('pdf')) {
        html = `<iframe src="${course.filePreviewUrl}" style="width:100%;height:80vh;border:0;"></iframe>`;
    } else if (type.startsWith('image/')) {
        html = `<img src="${course.filePreviewUrl}" style="max-width:100%;height:auto;">`;
    } else {
        html = `<p>Aperçu non disponible. Téléchargez le fichier: <a href="${course.filePreviewUrl}" download> Télécharger</a></p>`;
    }
    body.innerHTML = html;
    modal.style.display = 'flex';
}

window.closeViewer = function() {
    const modal = document.getElementById('viewerModal');
    const body = document.getElementById('viewerBody');
    modal.style.display = 'none';
    body.innerHTML = '';
}

// Matières CRUD simple
let matieres = [];
function addMatiere() {
    const nameInput = document.getElementById('matiereName');
    const parcoursInput = document.getElementById('parcoursName');
    const name = nameInput.value.trim();
    const parcours = parcoursInput.value.trim();
    if (!name) return showNotification('Nom de matière requis', 'error');
    matieres.push({ id: Date.now() + Math.random(), name, parcours });
    localStorage.setItem('matieres', JSON.stringify(matieres));
    nameInput.value = '';
    parcoursInput.value = '';
    refreshMatieresUI();
    refreshMatiereFilters();
}

function refreshMatieresUI() {
    const list = document.getElementById('matieresList');
    if (!list) return;
    if (matieres.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-folder"></i><h3>Aucune matière</h3></div>`;
        return;
    }
    list.innerHTML = matieres.map(m => `
        <div class="matiere-item">
            <div>
                <strong>${m.name}</strong> ${m.parcours ? `- ${m.parcours}` : ''}
            </div>
            <div>
                <button class="btn-small" onclick="deleteMatiere('${m.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

window.deleteMatiere = function(id) {
    matieres = matieres.filter(m => m.id != id);
    localStorage.setItem('matieres', JSON.stringify(matieres));
    refreshMatieresUI();
    refreshMatiereFilters();
}

function refreshMatiereFilters() {
    const matSel = document.getElementById('filterMatiere');
    const parSel = document.getElementById('filterParcours');
    if (!matSel || !parSel) return;
    const uniqueMat = [''].concat([...new Set(matieres.map(m => m.name))]);
    const uniquePar = [''].concat([...new Set(matieres.map(m => m.parcours).filter(Boolean))]);
    matSel.innerHTML = uniqueMat.map(v => `<option value="${v}">${v || 'Toutes les matières'}</option>`).join('');
    parSel.innerHTML = uniquePar.map(v => `<option value="${v}">${v || 'Tous les parcours'}</option>`).join('');
}

// Calendrier: vues flexibles
let calendarView = 'week';
let calendarCursorDate = new Date();

function changeCalendarView(view) {
    calendarView = view;
    initializeCalendar();
}

function navigateCalendar(direction) {
    if (calendarView === 'day') {
        calendarCursorDate.setDate(calendarCursorDate.getDate() + direction);
    } else if (calendarView === 'week') {
        calendarCursorDate.setDate(calendarCursorDate.getDate() + direction * 7);
    } else {
        calendarCursorDate.setMonth(calendarCursorDate.getMonth() + direction);
    }
    initializeCalendar();
}