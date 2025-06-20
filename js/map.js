// Map and location management
let map;
let markers = [];
let locations = [];

// Initialize the map and load locations
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadLocations();
    setupSearch();
});

// Initialize Leaflet map
function initializeMap() {
    // Determine initial zoom level based on screen size
    const isMobile = window.innerWidth <= 768;
    const initialZoom = isMobile ? 4 : 5;
    
    // Center map on Australia
    map = L.map('map', {
        scrollWheelZoom: false, // Disable default scroll wheel zoom
        dragging: !isMobile,    // Disable dragging on mobile initially
        tap: !isMobile         // Disable tap on mobile initially
    }).setView([-25.2744, 133.7751], initialZoom);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Disable context menu on map
    const mapContainer = document.getElementById('map');
    mapContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Setup scroll behavior and overlays
    setupMapInteraction();
}

// Setup map interaction behavior
function setupMapInteraction() {
    const isMobile = window.innerWidth <= 768;
    const mapContainer = document.getElementById('map');
    
    if (isMobile) {
        // Mobile: Setup two-finger interaction
        setupMobileInteraction(mapContainer);
    } else {
        // Desktop: Setup Ctrl+scroll interaction
        setupDesktopInteraction(mapContainer);
    }
}

// Setup mobile two-finger interaction
function setupMobileInteraction(mapContainer) {
    let overlay = null;
    
    // Create overlay message
    function showOverlay(message) {
        if (overlay) return;
        
        overlay = document.createElement('div');
        overlay.className = 'map-interaction-overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <p>${message}</p>
            </div>
        `;
        mapContainer.appendChild(overlay);
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
            if (overlay) {
                overlay.remove();
                overlay = null;
            }
        }, 2000);
    }
    
    // Handle touch events
    let touchCount = 0;
    
    mapContainer.addEventListener('touchstart', (e) => {
        touchCount = e.touches.length;
        
        if (touchCount === 1) {
            showOverlay('Use two fingers to move the map');
            e.preventDefault();
        } else if (touchCount === 2) {
            // Enable map interaction for two fingers
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            if (overlay) {
                overlay.remove();
                overlay = null;
            }
        }
    });
    
    mapContainer.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            // Disable interaction when no fingers on screen
            setTimeout(() => {
                map.dragging.disable();
                map.scrollWheelZoom.disable();
            }, 100);
        }
    });
}

// Setup desktop Ctrl+scroll interaction
function setupDesktopInteraction(mapContainer) {
    let overlay = null;
    let isCtrlPressed = false;
    let isHoveringMap = false;
    
    // Create overlay message
    function showOverlay() {
        if (overlay) return;
        
        overlay = document.createElement('div');
        overlay.className = 'map-interaction-overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <p>Use Ctrl + scroll to zoom the map</p>
            </div>
        `;
        mapContainer.appendChild(overlay);
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
            if (overlay) {
                overlay.remove();
                overlay = null;
            }
        }, 2000);
    }
    
    function hideOverlay() {
        if (overlay) {
            overlay.remove();
            overlay = null;
        }
    }
    
    // Track Ctrl key state globally
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Control') {
            isCtrlPressed = true;
            if (isHoveringMap) {
                map.scrollWheelZoom.enable();
                hideOverlay();
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Control') {
            isCtrlPressed = false;
            map.scrollWheelZoom.disable();
        }
    });
    
    // Track mouse hover state on map
    mapContainer.addEventListener('mouseenter', () => {
        isHoveringMap = true;
        if (isCtrlPressed) {
            map.scrollWheelZoom.enable();
            hideOverlay();
        }
    });
    
    mapContainer.addEventListener('mouseleave', () => {
        isHoveringMap = false;
        map.scrollWheelZoom.disable();
        hideOverlay();
    });
    
    // Handle scroll events - only intercept when Ctrl is pressed
    mapContainer.addEventListener('wheel', (e) => {
        if (isCtrlPressed && isHoveringMap) {
            // Allow map zoom when Ctrl is pressed and hovering map
            return; // Let the map handle it
        } else if (isCtrlPressed && !isHoveringMap) {
            // Ctrl pressed but not hovering map - allow normal scroll
            return;
        } else if (!isCtrlPressed && isHoveringMap) {
            // Not pressing Ctrl but hovering map - allow normal page scroll
            // But show overlay to inform about Ctrl+scroll
            showOverlay();
            return; // Allow normal page scrolling
        }
        // Default: allow normal scrolling
    }, { passive: false });
}

// Create custom MTQ yellow marker icon
function createMTQMarkerIcon(isReman = false) {
    const centerClass = isReman ? 'mtq-marker-pin-reman' : 'mtq-marker-pin';
    return L.divIcon({
        className: 'mtq-marker',
        html: `
            <div class="${centerClass}">
                <div class="mtq-marker-inner"></div>
            </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -42]
    });
}

// Load locations from JSON file
async function loadLocations() {
    try {
        const response = await fetch('locations.json');
        const data = await response.json();
        locations = data.locations;
        
        displayLocations();
        addMarkersToMap();
    } catch (error) {
        console.error('Error loading locations:', error);
        // Fallback to sample data if JSON fails to load
        locations = getSampleLocations();
        displayLocations();
        addMarkersToMap();
    }
}

// Fallback sample data
function getSampleLocations() {
    return [
        {
            id: 1,
            name: "MTQ Engine Systems - Adelaide",
            address: "7-9 Opala Street. Regency Park, SA 5010",
            phone: "08 8445 3666",
            email: "adelaide.sales@mtqes.com.au",
            coordinates: [-34.850551, 138.567089]
        },
        {
            id: 2,
            name: "MTQ Engine Systems - Brisbane", 
            address: "111 Beenleigh Road, Acacia Ridge, QLD 4110",
            phone: "07 3723 4400",
            email: "brisbane.sales@mtqes.com.au",
            coordinates: [-27.578279, 153.013824]
        },
        {
            id: 3,
            name: "MTQ Engine Systems - Perth",
            address: "41 Banksia Road Welshpool, WA 6106", 
            phone: "08 9203 1000",
            email: "perth.sales@mtqes.com.au",
            coordinates: [-31.9947206, 115.9639515]
        }
    ];
}

// Display locations in the sidebar
function displayLocations(filteredLocations = null) {
    const locationList = document.getElementById('location-list');
    const locationsToShow = filteredLocations || locations;
    
    locationList.innerHTML = '';
    
    locationsToShow.forEach((location, index) => {
        const locationItem = document.createElement('div');
        locationItem.className = 'location-item';
        locationItem.dataset.locationId = location.id;
        
        locationItem.innerHTML = `
            <h4>${index + 1}. ${location.name}</h4>
            <p>${location.address}</p>
            <p>Ph ${location.phone}</p>
            <p>${location.email}</p>
            ${location.reman ? '<p><span class="reman-dot"></span><strong>APAC Remanufacturing Centre</strong></p>' : ''}
        `;
        
        // Add click event to highlight location
        locationItem.addEventListener('click', () => {
            selectLocation(location);
        });
        
        locationList.appendChild(locationItem);
    });
}

// Add markers to the map
function addMarkersToMap() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    locations.forEach(location => {
        const marker = L.marker(location.coordinates, {
            icon: createMTQMarkerIcon(location.reman)
        }).addTo(map);
        
        // Create popup content
        const popupContent = `
            <div class="marker-popup">
                <h4>${location.name}</h4>
                <p><strong>Address:</strong> ${location.address}</p>
                <p><strong>Phone:</strong> ${location.phone}</p>
                <p><strong>Email:</strong> ${location.email}</p>
                ${location.reman ? '<p><span class="reman-dot"></span><strong>APAC Remanufacturing Centre</strong></p>' : ''}
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Add click event to select location
        marker.on('click', () => {
            selectLocation(location);
        });
        
        markers.push(marker);
    });
}

// Select and highlight a location
function selectLocation(location) {
    // Remove active class from all location items
    document.querySelectorAll('.location-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected location
    const selectedItem = document.querySelector(`[data-location-id="${location.id}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    // Center map on selected location
    map.setView(location.coordinates, 15);
    
    // Open popup for the selected marker
    const marker = markers.find(m => 
        m.getLatLng().lat === location.coordinates[0] && 
        m.getLatLng().lng === location.coordinates[1]
    );
    if (marker) {
        marker.openPopup();
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('location-search');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm === '') {
            displayLocations();
            return;
        }
        
        const filteredLocations = locations.filter(location => 
            location.name.toLowerCase().includes(searchTerm) ||
            location.address.toLowerCase().includes(searchTerm)
        );
        
        displayLocations(filteredLocations);
    });
}
