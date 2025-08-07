document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('fullcalendar');
    if (!calendarEl) return;

    // Charger les événements depuis localStorage
    function loadEvents() {
        try {
            return JSON.parse(localStorage.getItem('calendarEventsFull')) || [];
        } catch (e) {
            return [];
        }
    }
    function saveEvents(events) {
        localStorage.setItem('calendarEventsFull', JSON.stringify(events));
    }

    // Notification locale simple
    function notify(title, body) {
        if (Notification && Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    }
    if (Notification && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // FullCalendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        locale: 'fr',
        editable: true,
        selectable: true,
        selectMirror: true,
        nowIndicator: true,
        eventResizableFromStart: true,
        eventStartEditable: true,
        eventDurationEditable: true,
        eventDrop: function(info) {
            saveEvents(calendar.getEvents().map(e => e.toPlainObject()));
        },
        eventResize: function(info) {
            saveEvents(calendar.getEvents().map(e => e.toPlainObject()));
        },
        eventClick: function(info) {
            // Edition/suppression
            let event = info.event;
            let html = `<div style='padding:1rem;'>
                <label>Titre<br><input id='editTitle' value='${event.title}' style='width:100%'></label><br><br>
                <label>Matière/Catégorie<br><input id='editCat' value='${event.extendedProps.categorie||''}' style='width:100%'></label><br><br>
                <label>Couleur<br><input id='editColor' type='color' value='${event.backgroundColor||'#2563eb'}'></label><br><br>
                <label>Répétition<br><select id='editRepeat'><option value=''>Aucune</option><option value='hebdo'>Hebdomadaire</option><option value='quotidien'>Quotidien</option></select></label><br><br>
                <button id='saveEvent' style='margin-right:1rem;'>Enregistrer</button>
                <button id='deleteEvent' style='color:#dc2626;'>Supprimer</button>
            </div>`;
            let modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = 0;
            modal.style.left = 0;
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.3)';
            modal.style.zIndex = 9999;
            modal.innerHTML = `<div style='background:white;max-width:400px;margin:10vh auto;padding:2rem;border-radius:12px;position:relative;'>${html}</div>`;
            document.body.appendChild(modal);
            document.getElementById('saveEvent').onclick = function() {
                event.setProp('title', document.getElementById('editTitle').value);
                event.setExtendedProp('categorie', document.getElementById('editCat').value);
                event.setProp('backgroundColor', document.getElementById('editColor').value);
                event.setExtendedProp('repeat', document.getElementById('editRepeat').value);
                saveEvents(calendar.getEvents().map(e => e.toPlainObject()));
                document.body.removeChild(modal);
            };
            document.getElementById('deleteEvent').onclick = function() {
                event.remove();
                saveEvents(calendar.getEvents().map(e => e.toPlainObject()));
                document.body.removeChild(modal);
            };
            modal.onclick = function(e) { if (e.target === modal) document.body.removeChild(modal); };
        },
        select: function(info) {
            // Ajout d'événement
            let html = `<div style='padding:1rem;'>
                <label>Titre<br><input id='newTitle' style='width:100%'></label><br><br>
                <label>Matière/Catégorie<br><input id='newCat' style='width:100%'></label><br><br>
                <label>Couleur<br><input id='newColor' type='color' value='#2563eb'></label><br><br>
                <label>Répétition<br><select id='newRepeat'><option value=''>Aucune</option><option value='hebdo'>Hebdomadaire</option><option value='quotidien'>Quotidien</option></select></label><br><br>
                <button id='addEvent'>Ajouter</button>
            </div>`;
            let modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = 0;
            modal.style.left = 0;
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.3)';
            modal.style.zIndex = 9999;
            modal.innerHTML = `<div style='background:white;max-width:400px;margin:10vh auto;padding:2rem;border-radius:12px;position:relative;'>${html}</div>`;
            document.body.appendChild(modal);
            document.getElementById('addEvent').onclick = function() {
                let title = document.getElementById('newTitle').value;
                let cat = document.getElementById('newCat').value;
                let color = document.getElementById('newColor').value;
                let repeat = document.getElementById('newRepeat').value;
                if (!title) return;
                let eventData = {
                    title: title,
                    start: info.startStr,
                    end: info.endStr,
                    backgroundColor: color,
                    extendedProps: { categorie: cat, repeat: repeat }
                };
                calendar.addEvent(eventData);
                // Répétition simple
                if (repeat === 'hebdo') {
                    for (let i = 1; i < 10; i++) {
                        let next = new Date(info.start);
                        next.setDate(next.getDate() + 7 * i);
                        let endNext = new Date(info.end);
                        endNext.setDate(endNext.getDate() + 7 * i);
                        calendar.addEvent({
                            ...eventData,
                            start: next.toISOString(),
                            end: endNext.toISOString()
                        });
                    }
                } else if (repeat === 'quotidien') {
                    for (let i = 1; i < 10; i++) {
                        let next = new Date(info.start);
                        next.setDate(next.getDate() + i);
                        let endNext = new Date(info.end);
                        endNext.setDate(endNext.getDate() + i);
                        calendar.addEvent({
                            ...eventData,
                            start: next.toISOString(),
                            end: endNext.toISOString()
                        });
                    }
                }
                saveEvents(calendar.getEvents().map(e => e.toPlainObject()));
                document.body.removeChild(modal);
                // Notification simple
                notify('Événement ajouté', title);
            };
            modal.onclick = function(e) { if (e.target === modal) document.body.removeChild(modal); };
        },
        events: loadEvents(),
        eventDidMount: function(info) {
            // Afficher la catégorie/matière dans le tooltip
            if (info.event.extendedProps.categorie) {
                info.el.title = info.event.extendedProps.categorie;
            }
        },
        eventAdd: function() { saveEvents(calendar.getEvents().map(e => e.toPlainObject())); },
        eventChange: function() { saveEvents(calendar.getEvents().map(e => e.toPlainObject())); },
        eventRemove: function() { saveEvents(calendar.getEvents().map(e => e.toPlainObject())); },
        height: 'auto',
        aspectRatio: 1.5,
        dayMaxEvents: true,
        // Responsive
        windowResize: function() { calendar.updateSize(); },
    });
    calendar.render();

    // Filtrage par matière/catégorie
    window.filterCalendarByCat = function(cat) {
        calendar.getEvents().forEach(ev => {
            if (!cat || (ev.extendedProps.categorie && ev.extendedProps.categorie.toLowerCase().includes(cat.toLowerCase()))) {
                ev.setProp('display', 'auto');
            } else {
                ev.setProp('display', 'none');
            }
        });
    };
});