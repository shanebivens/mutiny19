// Global variables
let map;
let eventsData = [];
let markers = [];
let currentView = 'list'; // 'map', 'list', or 'both'

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadEvents();
    initializeMap();
    setupEventListeners();
    applyFilters();
});

// Load events from JSON file
async function loadEvents() {
    try {
        const response = await fetch('events.json');
        const data = await response.json();
        eventsData = data.events;

        // Update last updated timestamp
        const lastUpdate = new Date(data.lastUpdated);
        document.getElementById('lastUpdate').textContent = lastUpdate.toLocaleDateString();
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('lastUpdate').textContent = 'Error loading data';
    }
}

// Initialize Leaflet map centered on Indiana
function initializeMap() {
    // Indiana state boundaries (approximate)
    const indianaBounds = [
        [37.77, -88.10], // Southwest corner
        [41.76, -84.78]  // Northeast corner
    ];

    map = L.map('map', {
        center: [39.7684, -86.1581], // Center of Indiana
        zoom: 7,
        minZoom: 7,  // Prevent zooming out too far
        maxBounds: indianaBounds,  // Restrict panning to Indiana
        maxBoundsViscosity: 1.0  // Make bounds solid (can't drag outside)
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
}

// Create custom icon based on event features
function createCustomIcon(event) {
    let iconHtml = '<div class="custom-marker">';
    const features = event.features;

    // Build icon symbols
    const symbols = [];
    if (features.free) symbols.push('💰');
    if (features.food) symbols.push('🍽️');
    if (features.appetizers) symbols.push('🍕');
    if (features.nonAlcoholDrinks) symbols.push('🥤');
    if (features.alcoholDrinks) symbols.push('🍺');

    iconHtml = `<div style="font-size: 24px; text-align: center;">${symbols[0] || '📍'}</div>`;

    return L.divIcon({
        html: iconHtml,
        className: 'custom-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
}

// Add markers to map
function addMarkersToMap(events) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    events.forEach(event => {
        const marker = L.marker([event.location.lat, event.location.lng], {
            icon: createCustomIcon(event)
        }).addTo(map);

        // Create popup content
        const popupContent = createPopupContent(event);
        marker.bindPopup(popupContent);

        // Store event data with marker
        marker.eventData = event;
        markers.push(marker);
    });

    // Adjust map to fit all markers if there are any
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Create popup content for map markers
function createPopupContent(event) {
    const date = new Date(event.date);
    const tags = getEventTags(event);

    return `
        <div class="popup-content">
            <h3>${event.title}</h3>
            <p><strong>📅 ${date.toLocaleDateString()}</strong> at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p>📍 ${event.location.name}</p>
            <div class="event-meta">${tags}</div>
            <button class="popup-button" onclick="showEventDetails('${event.id}')">🏴‍☠️ I'm In</button>
        </div>
    `;
}

// Get event tags HTML
function getEventTags(event) {
    const tags = [];
    if (event.features.free) tags.push('<span class="event-tag free">💰 Free</span>');
    if (event.features.food) tags.push('<span class="event-tag food">🍽️ Food</span>');
    if (event.features.appetizers) tags.push('<span class="event-tag appetizers">🍕 Appetizers</span>');
    if (event.features.nonAlcoholDrinks) tags.push('<span class="event-tag non-alcohol">🥤 Non-Alcoholic</span>');
    if (event.features.alcoholDrinks) tags.push('<span class="event-tag alcohol">🍺 Alcohol</span>');
    return tags.join('');
}

// Display events in list view
function displayEventsList(events) {
    const listContainer = document.getElementById('eventsList');

    if (events.length === 0) {
        listContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: #ffeaa7; font-size: 1.1rem;">🏴‍☠️ No treasure here, matey!<br><span style="font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem; display: block;">Try adjusting your filters or check back later.</span></p>';
        return;
    }

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    const eventsHtml = sortedEvents.map(event => {
        const date = new Date(event.date);
        const endDate = event.endDate ? new Date(event.endDate) : null;
        const tags = getEventTags(event);

        return `
            <div class="event-card" onclick="showEventDetails('${event.id}')">
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p><strong>📅 ${date.toLocaleDateString()}</strong> ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}${endDate ? ' - ' + endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                <p>📍 ${event.location.name}, ${event.location.address}</p>
                <div class="event-meta">${tags}</div>
            </div>
        `;
    }).join('');

    listContainer.innerHTML = eventsHtml;
}

// Show event details in modal
function showEventDetails(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');

    const date = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    const tags = getEventTags(event);

    modalBody.innerHTML = `
        <h2>${event.title}</h2>
        <div class="event-details">
            <p><strong>📅 Date:</strong> ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}${endDate ? ' - ' + endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
            <p><strong>📍 Location:</strong> ${event.location.name}<br>${event.location.address}</p>
            <p><strong>👥 Organizer:</strong> ${event.organizer}</p>
            <p><strong>ℹ️ Description:</strong><br>${event.description}</p>
            <div class="event-meta">${tags}</div>
            ${event.url ? `<p><a href="${event.url}" target="_blank" class="btn-calendar" style="margin-top: 1rem;">🏴‍☠️ Take Me There</a></p>` : ''}
            <div class="calendar-buttons">
                <button class="btn-calendar" onclick="addToGoogleCalendar('${event.id}')">📅 Save to Calendar</button>
                <button class="btn-calendar" onclick="downloadICS('${event.id}')">💾 Download .ics</button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// Add to Google Calendar
function addToGoogleCalendar(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    const startDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', event.title);
    url.searchParams.append('dates', `${formatDate(startDate)}/${formatDate(endDate)}`);
    url.searchParams.append('details', event.description);
    url.searchParams.append('location', `${event.location.name}, ${event.location.address}`);

    window.open(url.toString(), '_blank');
}

// Download ICS file
function downloadICS(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    const startDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Indiana Entrepreneur Events//EN
BEGIN:VEVENT
UID:${event.id}@indiana-events.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location.name}, ${event.location.address}
URL:${event.url || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Apply filters
function applyFilters() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const filterFree = document.getElementById('filterFree').checked;
    const filterFood = document.getElementById('filterFood').checked;
    const filterAppetizers = document.getElementById('filterAppetizers').checked;
    const filterNonAlcohol = document.getElementById('filterNonAlcohol').checked;
    const filterAlcohol = document.getElementById('filterAlcohol').checked;

    let filteredEvents = eventsData.filter(event => {
        const eventDate = new Date(event.date);

        // Date filtering
        if (startDate && eventDate < new Date(startDate)) return false;
        if (endDate && eventDate > new Date(endDate + 'T23:59:59')) return false;

        // Feature filtering (show if ANY checked feature matches)
        const hasCheckedFeature =
            (filterFree && event.features.free) ||
            (filterFood && event.features.food) ||
            (filterAppetizers && event.features.appetizers) ||
            (filterNonAlcohol && event.features.nonAlcoholDrinks) ||
            (filterAlcohol && event.features.alcoholDrinks);

        // If no filters are checked, show all events
        const anyFilterChecked = filterFree || filterFood || filterAppetizers || filterNonAlcohol || filterAlcohol;

        return !anyFilterChecked || hasCheckedFeature;
    });

    // Update map
    addMarkersToMap(filteredEvents);

    // Update list view
    displayEventsList(filteredEvents);
}

// Setup event listeners
function setupEventListeners() {
    // Filter listeners
    document.getElementById('startDate').addEventListener('change', applyFilters);
    document.getElementById('endDate').addEventListener('change', applyFilters);
    document.getElementById('filterFree').addEventListener('change', applyFilters);
    document.getElementById('filterFood').addEventListener('change', applyFilters);
    document.getElementById('filterAppetizers').addEventListener('change', applyFilters);
    document.getElementById('filterNonAlcohol').addEventListener('change', applyFilters);
    document.getElementById('filterAlcohol').addEventListener('change', applyFilters);

    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('filterFree').checked = true;
        document.getElementById('filterFood').checked = true;
        document.getElementById('filterAppetizers').checked = true;
        document.getElementById('filterNonAlcohol').checked = true;
        document.getElementById('filterAlcohol').checked = true;
        applyFilters();
    });

    // View toggle listeners
    document.getElementById('mapViewBtn').addEventListener('click', () => {
        setView('map');
    });

    document.getElementById('listViewBtn').addEventListener('click', () => {
        setView('list');
    });

    document.getElementById('bothViewBtn').addEventListener('click', () => {
        setView('both');
    });

    // Modal close
    const modal = document.getElementById('eventModal');
    const closeBtn = document.querySelector('.close');

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }

    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    // Story accordion
    const readMoreBtn = document.getElementById('readMoreBtn');
    const fullStory = document.getElementById('fullStory');

    if (readMoreBtn && fullStory) {
        readMoreBtn.addEventListener('click', () => {
            if (fullStory.style.display === 'none' || fullStory.style.display === '') {
                fullStory.style.display = 'block';
                readMoreBtn.textContent = '⚡ Hide the Tale ⚡';
            } else {
                fullStory.style.display = 'none';
                readMoreBtn.textContent = '⚡ Read the Full Tale ⚡';
                // Scroll back to the button
                readMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Bad Actor Reporting Form
    const badActorForm = document.getElementById('badActorForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    const warningBtn = document.getElementById('warningBtn');
    const championBtn = document.getElementById('championBtn');
    const reportTypeInput = document.getElementById('reportType');
    const warningGuidelines = document.getElementById('warningGuidelines');
    const championGuidelines = document.getElementById('championGuidelines');
    const descriptionLabel = document.getElementById('descriptionLabel');
    const evidenceLabel = document.getElementById('evidenceLabel');
    const submitBtn = document.getElementById('submitBtn');
    const whatHappenedTextarea = document.getElementById('whatHappened');

    // Toggle between Warning and Champion modes
    if (warningBtn && championBtn) {
        warningBtn.addEventListener('click', () => {
            // Update buttons
            warningBtn.classList.add('active', 'warning');
            warningBtn.classList.remove('champion');
            championBtn.classList.remove('active', 'champion');

            // Update hidden input
            reportTypeInput.value = 'warning';

            // Update guidelines
            warningGuidelines.style.display = 'block';
            championGuidelines.style.display = 'none';

            // Update form labels
            descriptionLabel.textContent = 'What Happened (Facts Only) *';
            evidenceLabel.textContent = 'Evidence (Optional)';
            submitBtn.textContent = '⚠️ Submit Warning Report';
            whatHappenedTextarea.placeholder = 'Describe what happened. Stick to verifiable facts.';
        });

        championBtn.addEventListener('click', () => {
            // Update buttons
            championBtn.classList.add('active', 'champion');
            championBtn.classList.remove('warning');
            warningBtn.classList.remove('active', 'warning');

            // Update hidden input
            reportTypeInput.value = 'champion';

            // Update guidelines
            warningGuidelines.style.display = 'none';
            championGuidelines.style.display = 'block';

            // Update form labels
            descriptionLabel.textContent = 'Why They\'re a Champion *';
            evidenceLabel.textContent = 'Specific Examples (Optional)';
            submitBtn.textContent = '⭐ Celebrate Champion';
            whatHappenedTextarea.placeholder = 'Describe how they went above and beyond to support you as a founder.';
        });
    }

    if (badActorForm) {
        badActorForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // SPAM PROTECTION 1: Honeypot check
            const honeypot = document.getElementById('website').value;
            if (honeypot) {
                console.log('Bot detected via honeypot');
                return; // Silently reject bots
            }

            // SPAM PROTECTION 2: Rate limiting (1 submission per hour)
            const lastSubmitTime = localStorage.getItem('mutiny19_last_submit');
            const currentTime = Date.now();
            const oneHour = 60 * 60 * 1000;

            if (lastSubmitTime && (currentTime - parseInt(lastSubmitTime)) < oneHour) {
                const timeLeft = Math.ceil((oneHour - (currentTime - parseInt(lastSubmitTime))) / 60000);
                formError.querySelector('p').textContent = `⏰ Please wait ${timeLeft} minutes before submitting another report.`;
                formError.style.display = 'block';
                formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Get form data
            const formData = {
                reportType: document.getElementById('reportType').value,
                type: document.getElementById('actorType').value,
                name: document.getElementById('actorName').value,
                whatHappened: document.getElementById('whatHappened').value,
                timeline: document.getElementById('timeline').value,
                evidence: document.getElementById('evidence').value || 'None provided'
            };

            // SPAM PROTECTION 3: Minimum character requirements
            if (formData.whatHappened.length < 50) {
                formError.querySelector('p').textContent = '❌ Description must be at least 50 characters. Please provide more detail.';
                formError.style.display = 'block';
                formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            if (formData.name.length < 3) {
                formError.querySelector('p').textContent = '❌ Please provide a valid name or company.';
                formError.style.display = 'block';
                formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Hide previous messages
            formSuccess.style.display = 'none';
            formError.style.display = 'none';

            try {
                // Discord webhook URL for verified founders channel
                const webhookUrl = 'https://discord.com/api/webhooks/1440836011079761990/C9F3u_15uHf93FSxnh1yyJQs_eGVvJLLCXnz7C1bZ4m7m6vAWlNrZjhwmCarR3WAsqEZ';

                // Format message for Discord based on type
                let discordMessage;
                if (formData.reportType === 'champion') {
                    discordMessage = {
                        content: `**⭐ CHAMPION CELEBRATION ⭐**\n\n` +
                                 `**Type:** ${formData.type}\n` +
                                 `**Name/Company:** ${formData.name}\n` +
                                 `**Timeline:** ${formData.timeline}\n\n` +
                                 `**Why They're a Champion:**\n${formData.whatHappened}\n\n` +
                                 `**Specific Examples:** ${formData.evidence}\n\n` +
                                 `*Celebration submitted anonymously via Mutiny19.com* 🎉`
                    };
                } else {
                    discordMessage = {
                        content: `**⚠️ WARNING REPORT ⚠️**\n\n` +
                                 `**Type:** ${formData.type}\n` +
                                 `**Name/Company:** ${formData.name}\n` +
                                 `**Timeline:** ${formData.timeline}\n\n` +
                                 `**What Happened:**\n${formData.whatHappened}\n\n` +
                                 `**Evidence:** ${formData.evidence}\n\n` +
                                 `*Report submitted anonymously via Mutiny19.com*`
                    };
                }

                // Submit to Discord webhook
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(discordMessage)
                });

                if (!response.ok) {
                    throw new Error('Failed to submit report');
                }

                // Store submission time for rate limiting
                localStorage.setItem('mutiny19_last_submit', currentTime.toString());

                // Update success message based on report type
                const successMessage = formData.reportType === 'champion'
                    ? '✅ Champion celebration submitted! Thank you for recognizing exceptional support.'
                    : '✅ Warning report submitted. Thank you for protecting the crew.';
                formSuccess.querySelector('p').textContent = successMessage;

                formSuccess.style.display = 'block';
                badActorForm.reset();

                // Reset to champion mode (default)
                if (championBtn && reportTypeInput) {
                    championBtn.click();
                }

                // Scroll to success message
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } catch (error) {
                console.error('Error submitting report:', error);
                formError.style.display = 'block';
                formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
}

// Set view mode
function setView(mode) {
    currentView = mode;
    const mapContainer = document.getElementById('mapContainer');
    const listContainer = document.getElementById('listContainer');

    // Update button states
    document.querySelectorAll('.view-toggle button').forEach(btn => btn.classList.remove('active'));

    if (mode === 'map') {
        mapContainer.style.display = 'block';
        listContainer.style.display = 'none';
        document.getElementById('mapViewBtn').classList.add('active');
        setTimeout(() => map.invalidateSize(), 100);
    } else if (mode === 'list') {
        mapContainer.style.display = 'none';
        listContainer.style.display = 'block';
        document.getElementById('listViewBtn').classList.add('active');
    } else {
        mapContainer.style.display = 'block';
        listContainer.style.display = 'block';
        mapContainer.style.height = '400px';
        listContainer.style.height = '400px';
        document.getElementById('bothViewBtn').classList.add('active');
        setTimeout(() => map.invalidateSize(), 100);
    }
}

// Make functions globally accessible for onclick handlers
window.showEventDetails = showEventDetails;
window.addToGoogleCalendar = addToGoogleCalendar;
window.downloadICS = downloadICS;
