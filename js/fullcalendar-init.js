// Calendrier complet avec toutes les fonctionnalités demandées
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que FullCalendar soit chargé
    if (typeof FullCalendar === 'undefined') {
        console.error('FullCalendar non chargé');
        return;
    }

    var calendarEl = document.getElementById('fullcalendar');
    if (!calendarEl) {
        console.error('Élément fullcalendar non trouvé');
        return;
    }

    // Fonctions de sauvegarde/chargement
    function loadEvents() {
        try {
            const saved = localStorage.getItem('studyhub_calendar_events');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Erreur chargement événements:', e);
            return [];
        }
    }

    function saveEvents(events) {
        try {
            localStorage.setItem('studyhub_calendar_events', JSON.stringify(events));
        } catch (e) {
            console.error('Erreur sauvegarde événements:', e);
        }
    }

    // Notifications
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    function sendNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: body, icon: '/favicon.ico' });
        }
    }

    // Créer des rappels
    function scheduleReminder(event) {
        if (!event.extendedProps.reminder) return;
        
        const eventTime = new Date(event.start);
        const now = new Date();
        const reminderTime = new Date(eventTime.getTime() - (event.extendedProps.reminder * 60 * 1000));
        
        if (reminderTime > now) {
            const delay = reminderTime.getTime() - now.getTime();
            setTimeout(() => {
                sendNotification('Rappel: ' + event.title, 'Votre événement commence dans ' + event.extendedProps.reminder + ' minutes');
            }, delay);
        }
    }

    // Initialiser le calendrier
    var calendar = new FullCalendar.Calendar(calendarEl, {
        // Vues disponibles
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        
        // Localisation française
        locale: 'fr',
        
        // Fonctionnalités d'édition
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        nowIndicator: true,
        eventResizableFromStart: true,
        eventStartEditable: true,
        eventDurationEditable: true,
        
        // Hauteur responsive
        height: 'auto',
        aspectRatio: 1.5,
        
        // Événements
        events: loadEvents(),
        
        // Sélection d'une plage horaire
        select: function(info) {
            showEventModal('add', {
                start: info.startStr,
                end: info.endStr,
                allDay: info.allDay
            });
        },
        
        // Clic sur un événement
        eventClick: function(info) {
            showEventModal('edit', info.event);
        },
        
        // Déplacement d'événement
        eventDrop: function(info) {
            saveEvents(calendar.getEvents().map(e => e.toPlainObject()));
            showNotification('Événement déplacé', 'L\'événement a été déplacé avec succès');
        },
        
        // Redimensionnement d'événement
        eventResize: function(info) {
            saveEvents(calendar.getEvents().map(e => e.toPlainObject()));
            showNotification('Événement modifié', 'La durée de l\'événement a été modifiée');
        },
        
        // Ajout d'événement
        eventAdd: function(info) {
            saveEvents(calendar.getEvents().map(e => e.toPlainObject()));
            scheduleReminder(info.event);
        },
        
        // Modification d'événement
        eventChange: function(info) {
            saveEvents(calendar.getEvents().map(e => e.toPlainObject()));
            scheduleReminder(info.event);
        },
        
        // Suppression d'événement
        eventRemove: function(info) {
            saveEvents(calendar.getEvents().map(e => e.toPlainObject()));
        },
        
        // Personnalisation de l'affichage
        eventDidMount: function(info) {
            const event = info.event;
            const el = info.el;
            
            // Tooltip avec détails
            let tooltip = event.title;
            if (event.extendedProps.matiere) {
                tooltip += '\nMatière: ' + event.extendedProps.matiere;
            }
            if (event.extendedProps.description) {
                tooltip += '\n' + event.extendedProps.description;
            }
            el.title = tooltip;
            
            // Icône pour les rappels
            if (event.extendedProps.reminder) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-bell';
                icon.style.fontSize = '0.8em';
                icon.style.marginLeft = '4px';
                icon.style.color = '#f59e0b';
                el.querySelector('.fc-event-title').appendChild(icon);
            }
        }
    });

    // Rendre le calendrier
    calendar.render();
    
    // Demander les permissions de notification
    requestNotificationPermission();

    // Fonction pour afficher le modal d'événement
    function showEventModal(mode, eventData) {
        const isEdit = mode === 'edit';
        const event = isEdit ? eventData : null;
        
        const modal = document.createElement('div');
        modal.className = 'calendar-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const content = document.createElement('div');
        content.className = 'calendar-modal-content';
        content.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        `;
        
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #1e293b;">${isEdit ? 'Modifier l\'événement' : 'Ajouter un événement'}</h3>
                <button onclick="this.closest('.calendar-modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;">&times;</button>
            </div>
            
            <form id="eventForm">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Titre *</label>
                    <input type="text" id="eventTitle" value="${isEdit ? event.title : ''}" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Matière/Catégorie</label>
                    <input type="text" id="eventMatiere" value="${isEdit ? (event.extendedProps.matiere || '') : ''}" placeholder="Ex: Anatomie, Physique..." style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Début</label>
                        <input type="datetime-local" id="eventStart" value="${isEdit ? event.startStr.replace('T', ' ').substring(0, 16) : ''}" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Fin</label>
                        <input type="datetime-local" id="eventEnd" value="${isEdit ? event.endStr.replace('T', ' ').substring(0, 16) : ''}" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Couleur</label>
                    <input type="color" id="eventColor" value="${isEdit ? (event.backgroundColor || '#2563eb') : '#2563eb'}" style="width: 100%; height: 50px; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Rappel</label>
                    <select id="eventReminder" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
                        <option value="">Aucun rappel</option>
                        <option value="5" ${isEdit && event.extendedProps.reminder === 5 ? 'selected' : ''}>5 minutes avant</option>
                        <option value="15" ${isEdit && event.extendedProps.reminder === 15 ? 'selected' : ''}>15 minutes avant</option>
                        <option value="30" ${isEdit && event.extendedProps.reminder === 30 ? 'selected' : ''}>30 minutes avant</option>
                        <option value="60" ${isEdit && event.extendedProps.reminder === 60 ? 'selected' : ''}>1 heure avant</option>
                        <option value="1440" ${isEdit && event.extendedProps.reminder === 1440 ? 'selected' : ''}>1 jour avant</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Répétition</label>
                    <select id="eventRepeat" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
                        <option value="">Aucune répétition</option>
                        <option value="daily" ${isEdit && event.extendedProps.repeat === 'daily' ? 'selected' : ''}>Tous les jours</option>
                        <option value="weekly" ${isEdit && event.extendedProps.repeat === 'weekly' ? 'selected' : ''}>Toutes les semaines</option>
                        <option value="monthly" ${isEdit && event.extendedProps.repeat === 'monthly' ? 'selected' : ''}>Tous les mois</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Description</label>
                    <textarea id="eventDescription" placeholder="Description optionnelle..." style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; min-height: 80px; resize: vertical;">${isEdit ? (event.extendedProps.description || '') : ''}</textarea>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    ${isEdit ? '<button type="button" id="deleteEvent" style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Supprimer</button>' : ''}
                    <button type="button" onclick="this.closest('.calendar-modal').remove()" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Annuler</button>
                    <button type="submit" style="background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">${isEdit ? 'Modifier' : 'Ajouter'}</button>
                </div>
            </form>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Gestion du formulaire
        const form = content.querySelector('#eventForm');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const eventData = {
                title: document.getElementById('eventTitle').value,
                start: document.getElementById('eventStart').value,
                end: document.getElementById('eventEnd').value,
                backgroundColor: document.getElementById('eventColor').value,
                extendedProps: {
                    matiere: document.getElementById('eventMatiere').value,
                    reminder: parseInt(document.getElementById('eventReminder').value) || null,
                    repeat: document.getElementById('eventRepeat').value,
                    description: document.getElementById('eventDescription').value
                }
            };
            
            if (isEdit) {
                event.setProp('title', eventData.title);
                event.setStart(eventData.start);
                event.setEnd(eventData.end);
                event.setProp('backgroundColor', eventData.backgroundColor);
                event.setExtendedProp('matiere', eventData.extendedProps.matiere);
                event.setExtendedProp('reminder', eventData.extendedProps.reminder);
                event.setExtendedProp('repeat', eventData.extendedProps.repeat);
                event.setExtendedProp('description', eventData.extendedProps.description);
                
                showNotification('Événement modifié', 'L\'événement a été modifié avec succès');
            } else {
                calendar.addEvent(eventData);
                showNotification('Événement ajouté', 'L\'événement a été ajouté avec succès');
            }
            
            modal.remove();
        });
        
        // Gestion de la suppression
        if (isEdit) {
            const deleteBtn = content.querySelector('#deleteEvent');
            deleteBtn.addEventListener('click', function() {
                if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
                    event.remove();
                    showNotification('Événement supprimé', 'L\'événement a été supprimé');
                    modal.remove();
                }
            });
        }
        
        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Fonction de notification
    function showNotification(title, message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: #1e293b;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            border-left: 4px solid #10b981;
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.25rem;">${title}</div>
            <div style="font-size: 0.9rem; color: #6b7280;">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Filtrage par matière
    window.filterCalendarByMatiere = function(matiere) {
        const events = calendar.getEvents();
        events.forEach(event => {
            if (!matiere || (event.extendedProps.matiere && event.extendedProps.matiere.toLowerCase().includes(matiere.toLowerCase()))) {
                event.setProp('display', 'auto');
            } else {
                event.setProp('display', 'none');
            }
        });
    };

    // Recherche d'événements
    window.searchEvents = function(query) {
        const events = calendar.getEvents();
        events.forEach(event => {
            if (!query || 
                event.title.toLowerCase().includes(query.toLowerCase()) ||
                (event.extendedProps.matiere && event.extendedProps.matiere.toLowerCase().includes(query.toLowerCase())) ||
                (event.extendedProps.description && event.extendedProps.description.toLowerCase().includes(query.toLowerCase()))) {
                event.setProp('display', 'auto');
            } else {
                event.setProp('display', 'none');
            }
        });
    };

    // Exposer le calendrier globalement
    window.calendar = calendar;
});