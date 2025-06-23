// Add Firebase imports at the top
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDh86gsO7fHI6XoFK9bwcp9AiWHGwy93sE",
    authDomain: "cfo-db.firebaseapp.com",
    databaseURL: "https://cfo-db-default-rtdb.firebaseio.com",
    projectId: "cfo-db",
    storageBucket: "cfo-db.firebasestorage.app",
    messagingSenderId: "582935826111",
    appId: "1:582935826111:web:0e45b59175b9fc9415c00a",
    measurementId: "G-KJ7F8G1ZX1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Global variables
let allMembers = [];
let filteredMembers = [];
let tungkulinOptions = new Set();

// Tungkulin Options (matching form.html)
const TUNGKULIN_OPTIONS = [
    'PANGULONG KADIWA',
    'II PANGULONG KADIWA',
    'PANGULONG PNK',
    'II PANGULONG PNK',
    'PANGULONG KALIHIIM',
    'II PANGULONG KALIHIM',
    'PANGULONG SCAN',
    'II PANGULONG SCAN',
    'KALIHIM NG KAPISANANG KADIWA',
    'II KALIHIM NG KAPISANANG KADIWA',
    'TSV LEAD',
    'II TSV LEAD',
    'SCAN',
    'KALIHIM',
    'KALIHIM SA ILAW',
    'KALIHIM SA GAWAIN',
    'MANG-AAWIT',
    'GURO',
    'AUIDITOR',
    'INGAT-YAMAN',
    'KAGAWAD SA PNK',
    'AUIDITOR SA PNK',
    'INGAT-YAMAN SA PNK'
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized');
    loadMembers();
    setupEventListeners();
});

// Load members from Firebase
function loadMembers() {
    console.log('Loading members from Firebase...');
    
    const membersRef = ref(database, 'members');
    
    onValue(membersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            allMembers = Object.entries(data).map(([key, value]) => ({
                ...value,
                id: key,
                serialNumber: key
            }));
        } else {
            allMembers = [];
        }

        console.log(`Loaded ${allMembers.length} members`);

        updateStats();
        populateTungkulinFilter();
        applyFilters();
    }, (error) => {
        console.error('Error loading members:', error);
        alert('Error loading members. Please refresh the page.');
    });
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const tungkulinFilter = document.getElementById('tungkulinFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');

    console.log('Setting up event listeners...');
    console.log('Status filter element:', statusFilter);

    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
        console.log('Search input listener added');
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            console.log('Status filter changed to:', this.value);
            applyFilters();
        });
        console.log('Status filter listener added');
    } else {
        console.error('Status filter element not found!');
    }
    
    if (tungkulinFilter) {
        tungkulinFilter.addEventListener('change', applyFilters);
        console.log('Tungkulin filter listener added');
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            console.log('Clearing all filters');
            
            // Clear search input
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Reset status filter
            if (statusFilter) {
                statusFilter.value = '';
            }
            
            // Reset tungkulin filter
            if (tungkulinFilter) {
                tungkulinFilter.value = '';
            }
            
            // Apply filters to show all members
            applyFilters();
        });
        console.log('Clear filters button listener added');
    }
}

// Update statistics
function updateStats() {
    // Total members
    const totalMembers = allMembers.length;
    const totalWithTungkulin = allMembers.filter(m => 
        m.tungkulin && Array.isArray(m.tungkulin) && m.tungkulin.length > 0
    ).length;

    // Status counts
    const statusCounts = {
        'Aktibo': 0,
        'Di Aktibo': 0,
        'UWP': 0,
        'MS': 0,
        'May Sakit': 0
    };

    allMembers.forEach(member => {
        if (member.status && statusCounts.hasOwnProperty(member.status)) {
            statusCounts[member.status]++;
        }
    });

    // Update DOM elements
    const totalSerialNumbersEl = document.getElementById('totalSerialNumbers');
    const totalTungkulinEl = document.getElementById('totalTungkulin');
    
    if (totalSerialNumbersEl) totalSerialNumbersEl.textContent = totalMembers;
    if (totalTungkulinEl) totalTungkulinEl.textContent = totalWithTungkulin;

    // Update status counts
    const aktiboCountEl = document.getElementById('aktiboCount');
    const diAktiboCountEl = document.getElementById('diAktiboCount');
    const uwpCountEl = document.getElementById('uwpCount');
    const msCountEl = document.getElementById('msCount');
    const sickCountEl = document.getElementById('sickCount');

    if (aktiboCountEl) aktiboCountEl.textContent = statusCounts['Aktibo'];
    if (diAktiboCountEl) diAktiboCountEl.textContent = statusCounts['Di Aktibo'];
    if (uwpCountEl) uwpCountEl.textContent = statusCounts['UWP'];
    if (msCountEl) msCountEl.textContent = statusCounts['MS'];
    if (sickCountEl) sickCountEl.textContent = statusCounts['May Sakit'];

    // Update purok-grupo stats
    updatePurokGrupoStats();
}

// Update purok-grupo statistics
function updatePurokGrupoStats() {
    const purokGrupoStats = {};
    
    allMembers.forEach(member => {
        if (member.purokGrupo) {
            purokGrupoStats[member.purokGrupo] = (purokGrupoStats[member.purokGrupo] || 0) + 1;
        }
    });

    const purokGrupoStatsEl = document.getElementById('purokGrupoStats');
    if (purokGrupoStatsEl) {
        purokGrupoStatsEl.innerHTML = '';
        
        // Generate all possible purok-grupo combinations
        const allPurokGrupos = [];
        for (let purok = 1; purok <= 3; purok++) {
            for (let grupo = 1; grupo <= 6; grupo++) {
                allPurokGrupos.push(`${purok}-${grupo}`);
            }
        }

        allPurokGrupos.forEach(purokGrupo => {
            const count = purokGrupoStats[purokGrupo] || 0;
            const statCard = document.createElement('div');
            statCard.className = 'purok-grupo-card';
            statCard.innerHTML = `
                <h3>Purok ${purokGrupo}</h3>
                <p class="counter">${count}</p>
            `;
            purokGrupoStatsEl.appendChild(statCard);
        });
    }
}

// Apply filters and search
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const tungkulinFilter = document.getElementById('tungkulinFilter');

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const statusValue = statusFilter ? statusFilter.value : '';
    const tungkulinValue = tungkulinFilter ? tungkulinFilter.value : '';

    console.log('Applying filters:', {
        searchTerm,
        statusValue,
        tungkulinValue,
        totalMembers: allMembers.length
    });

    // Add visual feedback for active filters
    if (statusFilter) {
        if (statusValue) {
            statusFilter.style.borderColor = '#3498db';
            statusFilter.style.backgroundColor = '#f8f9fa';
        } else {
            statusFilter.style.borderColor = '#ddd';
            statusFilter.style.backgroundColor = 'white';
        }
    }

    if (tungkulinFilter) {
        if (tungkulinValue) {
            tungkulinFilter.style.borderColor = '#3498db';
            tungkulinFilter.style.backgroundColor = '#f8f9fa';
        } else {
            tungkulinFilter.style.borderColor = '#ddd';
            tungkulinFilter.style.backgroundColor = 'white';
        }
    }

    filteredMembers = allMembers.filter(member => {
        // Search filter - search across multiple fields
        const matchesSearch = !searchTerm || 
            (member.name && member.name.toLowerCase().includes(searchTerm)) ||
            (member.serialNumber && member.serialNumber.toLowerCase().includes(searchTerm)) ||
            (member.contact && member.contact.includes(searchTerm)) ||
            (member.address && member.address.toLowerCase().includes(searchTerm)) ||
            (member.purokGrupo && member.purokGrupo.toLowerCase().includes(searchTerm)) ||
            (member.status && member.status.toLowerCase().includes(searchTerm));

        // Status filter
        const matchesStatus = !statusValue || member.status === statusValue;

        // Tungkulin filter - check if member has the selected tungkulin
        const matchesTungkulin = !tungkulinValue || 
            (member.tungkulin && Array.isArray(member.tungkulin) && 
             member.tungkulin.includes(tungkulinValue));

        return matchesSearch && matchesStatus && matchesTungkulin;
    });

    console.log('Filtered results:', {
        filteredCount: filteredMembers.length,
        statusFilterApplied: statusValue,
        statusMatches: filteredMembers.filter(m => m.status === statusValue).length,
        tungkulinFilterApplied: tungkulinValue,
        tungkulinMatches: tungkulinValue ? filteredMembers.filter(m => 
            m.tungkulin && Array.isArray(m.tungkulin) && m.tungkulin.includes(tungkulinValue)
        ).length : 'N/A'
    });

    // Show tungkulin filter results in console for debugging
    if (tungkulinValue) {
        const tungkulinMembers = filteredMembers.filter(m => 
            m.tungkulin && Array.isArray(m.tungkulin) && m.tungkulin.includes(tungkulinValue)
        );
        console.log(`Members with tungkulin "${tungkulinValue}":`, tungkulinMembers.map(m => m.name));
    }

    displayMembers();
    updateFilterCounts();
}

// Display filtered members with admin dashboard style
function displayMembers() {
    const membersList = document.getElementById('membersList');
    if (!membersList) return;

    if (filteredMembers.length === 0) {
        membersList.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    ${allMembers.length === 0 ? 
                        'No members registered yet' : 
                        'No members found matching your search criteria'}
                </td>
            </tr>
        `;
        return;
    }

    membersList.innerHTML = filteredMembers.map(member => `
        <tr>
            <td>${member.serialNumber || ''}</td>
            <td>${member.name || ''}</td>
            <td>${member.birthday ? new Date(member.birthday).toLocaleDateString() : ''}</td>
            <td>${member.age || calculateAgeFromDate(member.birthday) || ''}</td>
            <td>${member.contact || ''}</td>
            <td>${member.address || ''}</td>
            <td>${member.purokGrupo || ''}</td>
            <td>${formatTungkulin(member.tungkulin)}</td>
            <td><span class="status-badge ${getStatusClass(member.status)}">${member.status || ''}</span></td>
        </tr>
    `).join('');
}

// Update filter counts
function updateFilterCounts() {
    const filteredCountEl = document.getElementById('filteredCount');
    const totalCountEl = document.getElementById('totalCount');
    
    if (filteredCountEl) filteredCountEl.textContent = filteredMembers.length;
    if (totalCountEl) totalCountEl.textContent = allMembers.length;
}

// Populate tungkulin filter with predefined options from form.html
function populateTungkulinFilter() {
    const tungkulinFilter = document.getElementById('tungkulinFilter');
    if (!tungkulinFilter) return;

    tungkulinFilter.innerHTML = '<option value="">All Tungkulin</option>';
    
    // Add predefined tungkulin options from form.html (sorted)
    TUNGKULIN_OPTIONS.sort().forEach(option => {
        tungkulinFilter.innerHTML += `<option value="${option}">${option}</option>`;
    });
}

// Utility functions
function calculateAgeFromDate(dateString) {
    if (!dateString) return null;
    
    const birthday = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
    
    return age;
}

function formatTungkulin(tungkulin) {
    if (!tungkulin || !Array.isArray(tungkulin) || tungkulin.length === 0) return 'None';
    return tungkulin.join(', ');
}

function getStatusClass(status) {
    if (!status) return '';
    
    const statusMap = {
        'Aktibo': 'aktibo',
        'Di Aktibo': 'di-aktibo',
        'UWP': 'uwp',
        'MS': 'ms',
        'May Sakit': 'may-sakit'
    };
    
    return statusMap[status] || '';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Test tungkulin filter functionality
function testTungkulinFilter() {
    console.log('=== TUNGKULIN FILTER TEST ===');
    console.log('Available tungkulin options:', TUNGKULIN_OPTIONS);
    console.log('Total members:', allMembers.length);
    
    // Check tungkulin data structure for each member
    allMembers.forEach((member, index) => {
        console.log(`Member ${index + 1}: ${member.name}`);
        console.log('  Tungkulin data:', member.tungkulin);
        console.log('  Type:', typeof member.tungkulin);
        console.log('  Is Array:', Array.isArray(member.tungkulin));
        if (Array.isArray(member.tungkulin)) {
            member.tungkulin.forEach((t, i) => {
                console.log(`    Item ${i}:`, t, 'Type:', typeof t);
            });
        }
        console.log('---');
    });
}

// Form handling (for registration page)
const tungkulinCountInput = document.getElementById('tungkulinCount');
const tungkulinContainer = document.getElementById('tungkulinContainer');
const memberForm = document.getElementById('memberForm');
const birthdayInput = document.getElementById('birthday');
const calculatedAgeSpan = document.getElementById('calculatedAge');

if (tungkulinCountInput) {
    tungkulinCountInput.addEventListener('change', function() {
        const count = parseInt(this.value) || 0;
        tungkulinContainer.innerHTML = '';
        
        if (count > 0) {
            tungkulinContainer.classList.add('active');
            for (let i = 0; i < count; i++) {
                const field = document.createElement('div');
                field.className = 'tungkulin-field';
                field.innerHTML = `
                    <label for="tungkulin${i}">Tungkulin ${i + 1}</label>
                    <select id="tungkulin${i}" name="tungkulin[]" required>
                        <option value="">Select Tungkulin</option>
                        ${TUNGKULIN_OPTIONS.map(option => 
                            `<option value="${option}">${option}</option>`
                        ).join('')}
                    </select>
                `;
                tungkulinContainer.appendChild(field);
            }
        } else {
            tungkulinContainer.classList.remove('active');
        }
    });
}

if (birthdayInput) {
    birthdayInput.addEventListener('change', function() {
        const birthday = this.value;
        if (birthday) {
            const age = calculateAgeFromDate(birthday);
            calculatedAgeSpan.textContent = age;
        } else {
            calculatedAgeSpan.textContent = '-';
        }
    });
}

if (memberForm) {
    memberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
        
        // Validate form
        let isValid = true;
        const formData = new FormData(this);
        
        // Name validation
        const name = formData.get('name').trim();
        if (!name) {
            document.getElementById('nameError').classList.add('show');
            isValid = false;
        }
        
        // Birthday validation
        const birthday = formData.get('birthday');
        if (!birthday) {
            document.getElementById('birthdayError').classList.add('show');
            isValid = false;
        }
        
        // Calculate age
        const age = calculateAgeFromDate(birthday);
        
        // Contact validation
        const contact = formData.get('contact');
        if (!contact || !/^[0-9]{11}$/.test(contact)) {
            document.getElementById('contactError').classList.add('show');
            isValid = false;
        }

        // Address validation
        const address = formData.get('address').trim();
        if (!address) {
            document.getElementById('addressError').classList.add('show');
            isValid = false;
        }
        
        // Status validation
        const status = formData.get('status');
        if (!status) {
            document.getElementById('statusError').classList.add('show');
            isValid = false;
        }
        
        if (isValid) {
            // Collect tungkulin
            const tungkulin = [];
            const tungkulinInputs = document.querySelectorAll('select[name="tungkulin[]"]');
            tungkulinInputs.forEach(input => {
                if (input.value.trim()) {
                    tungkulin.push(input.value.trim());
                }
            });
            
            // Create new member
            const newMember = {
                name: name,
                birthday: birthday,
                age: age,
                contact: contact,
                address: address,
                tungkulin: tungkulin,
                status: status,
                dateRegistered: new Date().toISOString()
            };
            
            // Save to Firebase (this will trigger a reload of the dashboard)
            const membersRef = ref(database, 'members');
            // Note: This is a simplified approach - in a real app you'd use push() to generate unique IDs
            alert('Member registration functionality is available in the admin panel. Please use the admin dashboard to add new members.');
            
            // Reset form
            this.reset();
            if (calculatedAgeSpan) calculatedAgeSpan.textContent = '-';
            if (tungkulinContainer) {
                tungkulinContainer.classList.remove('active');
                tungkulinContainer.innerHTML = '';
            }
        }
    });
}

// Add input validation listeners
const inputs = document.querySelectorAll('input[required]');
inputs.forEach(input => {
    input.addEventListener('input', function() {
        const errorElement = document.getElementById(`${this.id}Error`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    });
}); 