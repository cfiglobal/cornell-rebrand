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
    // Center map on Australia
    map = L.map('map').setView([-25.2744, 133.7751], 5);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
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
        const marker = L.marker(location.coordinates).addTo(map);
        
        // Create popup content
        const popupContent = `
            <div class="marker-popup">
                <h4>${location.name}</h4>
                <p><strong>Address:</strong> ${location.address}</p>
                <p><strong>Phone:</strong> ${location.phone}</p>
                <p><strong>Email:</strong> ${location.email}</p>
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
    map.setView(location.coordinates, 10);
    
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
