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
let isVerified = false;
let verificationTimeout = null;

// Valid verification codes
const VALID_CODES = ['18990', '22220', '20208'];

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
    setupSecurityFeatures();
});

// Setup security features
function setupSecurityFeatures() {
    const verificationModal = document.getElementById('verificationModal');
    const closeVerificationModal = document.getElementById('closeVerificationModal');
    const verifyCodeBtn = document.getElementById('verifyCode');
    const verificationCodeInput = document.getElementById('verificationCode');
    const verificationError = document.getElementById('verificationError');

    // Close modal when clicking X
    if (closeVerificationModal) {
        closeVerificationModal.addEventListener('click', function() {
            verificationModal.style.display = 'none';
            verificationCodeInput.value = '';
            verificationError.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    if (verificationModal) {
        verificationModal.addEventListener('click', function(e) {
            if (e.target === verificationModal) {
                verificationModal.style.display = 'none';
                verificationCodeInput.value = '';
                verificationError.style.display = 'none';
            }
        });
    }

    // Handle verification code submission
    if (verifyCodeBtn && verificationCodeInput) {
        verifyCodeBtn.addEventListener('click', function() {
            const code = verificationCodeInput.value.trim();
            
            if (VALID_CODES.includes(code)) {
                isVerified = true;
                verificationModal.style.display = 'none';
                verificationCodeInput.value = '';
                verificationError.style.display = 'none';
                
                // Reveal all sensitive fields
                revealSensitiveFields();
                
                // Set timeout to re-blur after 5 minutes
                if (verificationTimeout) {
                    clearTimeout(verificationTimeout);
                }
                verificationTimeout = setTimeout(() => {
                    isVerified = false;
                    blurSensitiveFields();
                }, 5 * 60 * 1000); // 5 minutes
                
                console.log('✅ Verification successful');
            } else {
                verificationError.style.display = 'block';
                verificationCodeInput.value = '';
                verificationCodeInput.focus();
                console.log('❌ Verification failed');
            }
        });

        // Handle Enter key
        verificationCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyCodeBtn.click();
            }
        });
    }
}

// Reveal sensitive fields
function revealSensitiveFields() {
    const sensitiveFields = document.querySelectorAll('.sensitive-field');
    sensitiveFields.forEach(field => {
        field.classList.remove('blurred');
        field.classList.add('revealed');
    });
}

// Blur sensitive fields
function blurSensitiveFields() {
    const sensitiveFields = document.querySelectorAll('.sensitive-field');
    sensitiveFields.forEach(field => {
        field.classList.remove('revealed');
        field.classList.add('blurred');
    });
}

// Show verification modal
function showVerificationModal() {
    const verificationModal = document.getElementById('verificationModal');
    const verificationCodeInput = document.getElementById('verificationCode');
    
    if (verificationModal && verificationCodeInput) {
        verificationModal.style.display = 'block';
        verificationCodeInput.focus();
    }
}

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
        
        // Apply initial blur to sensitive fields
        setTimeout(() => {
            blurSensitiveFields();
        }, 100);
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

    // Add click listeners for sensitive fields
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('sensitive-field') || 
            e.target.closest('.sensitive-field')) {
            if (!isVerified) {
                e.preventDefault();
                showVerificationModal();
            }
        }
    });
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

    const purokGrupoStatsContainer = document.getElementById('purokGrupoStats');
    if (purokGrupoStatsContainer) {
        purokGrupoStatsContainer.innerHTML = '';
        
        Object.entries(purokGrupoStats).forEach(([purokGrupo, count]) => {
            const card = document.createElement('div');
            card.className = 'purok-grupo-card';
            card.innerHTML = `
                <h3>${purokGrupo}</h3>
                <div class="counter">${count}</div>
            `;
            purokGrupoStatsContainer.appendChild(card);
        });
    }
}

// Apply filters and search
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const tungkulinFilter = document.getElementById('tungkulinFilter')?.value || '';

    console.log('Applying filters:', { searchTerm, statusFilter, tungkulinFilter });

    filteredMembers = allMembers.filter(member => {
        // Search filter
        const matchesSearch = !searchTerm || 
            (member.name && member.name.toLowerCase().includes(searchTerm)) ||
            (member.serialNumber && member.serialNumber.toLowerCase().includes(searchTerm)) ||
            (member.contact && member.contact.toLowerCase().includes(searchTerm)) ||
            (member.status && member.status.toLowerCase().includes(searchTerm));

        // Status filter
        const matchesStatus = !statusFilter || member.status === statusFilter;

        // Tungkulin filter
        let matchesTungkulin = true;
        if (tungkulinFilter) {
            if (member.tungkulin) {
                if (Array.isArray(member.tungkulin)) {
                    matchesTungkulin = member.tungkulin.some(t => t === tungkulinFilter);
                } else if (typeof member.tungkulin === 'string') {
                    matchesTungkulin = member.tungkulin === tungkulinFilter;
                } else {
                    matchesTungkulin = false;
                }
            } else {
                matchesTungkulin = false;
            }
        }

        return matchesSearch && matchesStatus && matchesTungkulin;
    });

    console.log(`Filtered to ${filteredMembers.length} members`);
    displayMembers();
    updateFilterCounts();
}

// Display members in table
function displayMembers() {
    const membersList = document.getElementById('membersList');
    if (!membersList) return;

    membersList.innerHTML = '';

    filteredMembers.forEach(member => {
        const row = document.createElement('tr');
        
        // Calculate age
        const age = member.birthday ? calculateAgeFromDate(member.birthday) : '';
        
        // Format tungkulin properly
        const tungkulinDisplay = formatTungkulin(member.tungkulin);
        
        row.innerHTML = `
            <td>${member.serialNumber || 'N/A'}</td>
            <td>${member.name || 'N/A'}</td>
            <td class="sensitive-field">${member.birthday || 'N/A'}</td>
            <td class="sensitive-field">${age || 'N/A'}</td>
            <td class="sensitive-field">${member.contact || 'N/A'}</td>
            <td class="sensitive-field">${member.address || 'N/A'}</td>
            <td class="sensitive-field">${member.purokGrupo || 'N/A'}</td>
            <td class="sensitive-field">${tungkulinDisplay}</td>
            <td><span class="status-badge ${getStatusClass(member.status)}">${member.status || 'N/A'}</span></td>
        `;
        
        membersList.appendChild(row);
    });

    // Apply blur to sensitive fields if not verified
    if (!isVerified) {
        setTimeout(() => {
            blurSensitiveFields();
        }, 50);
    }
}

// Update filter counts
function updateFilterCounts() {
    const filteredCountEl = document.getElementById('filteredCount');
    const totalCountEl = document.getElementById('totalCount');
    
    if (filteredCountEl) filteredCountEl.textContent = filteredMembers.length;
    if (totalCountEl) totalCountEl.textContent = allMembers.length;
}

// Populate tungkulin filter
function populateTungkulinFilter() {
    const tungkulinFilter = document.getElementById('tungkulinFilter');
    if (!tungkulinFilter) return;

    // Clear existing options except the first one
    tungkulinFilter.innerHTML = '<option value="">All Tungkulin</option>';

    // Collect all unique tungkulin values from members
    const allTungkulin = new Set();
    
    allMembers.forEach(member => {
        if (member.tungkulin) {
            if (Array.isArray(member.tungkulin)) {
                member.tungkulin.forEach(t => {
                    if (t && typeof t === 'string') {
                        allTungkulin.add(t);
                    }
                });
            } else if (typeof member.tungkulin === 'string') {
                allTungkulin.add(member.tungkulin);
            }
        }
    });

    // Add tungkulin options to filter
    Array.from(allTungkulin).sort().forEach(tungkulin => {
        const option = document.createElement('option');
        option.value = tungkulin;
        option.textContent = tungkulin;
        tungkulinFilter.appendChild(option);
    });
}

// Calculate age from date string
function calculateAgeFromDate(dateString) {
    if (!dateString) return null;
    
    const today = new Date();
    const birthDate = new Date(dateString);
    
    if (isNaN(birthDate.getTime())) return null;
    if (birthDate > today) return null;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Format tungkulin properly to avoid showing "object"
function formatTungkulin(tungkulin) {
    if (!tungkulin) return 'N/A';
    
    if (Array.isArray(tungkulin)) {
        return tungkulin.filter(t => t && typeof t === 'string').join(', ');
    } else if (typeof tungkulin === 'string') {
        return tungkulin;
    } else {
        return 'N/A';
    }
}

// Get status class for styling
function getStatusClass(status) {
    if (!status) return 'n-a';
    
    const statusMap = {
        'Aktibo': 'aktibo',
        'Di Aktibo': 'di-aktibo',
        'UWP': 'uwp',
        'MS': 'ms',
        'May Sakit': 'may-sakit'
    };
    
    return statusMap[status] || 'n-a';
}

// Debounce function
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

// Test tungkulin filter function
function testTungkulinFilter() {
    console.log('Testing tungkulin filter...');
    const tungkulinFilter = document.getElementById('tungkulinFilter');
    if (tungkulinFilter) {
        console.log('Tungkulin filter options:', tungkulinFilter.options.length);
        for (let i = 0; i < tungkulinFilter.options.length; i++) {
            console.log(`Option ${i}: ${tungkulinFilter.options[i].value}`);
        }
    } else {
        console.error('Tungkulin filter not found');
    }
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