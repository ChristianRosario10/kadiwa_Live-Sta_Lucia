// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getDatabase, ref, onValue, set, remove, get, push } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';

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

// DOM Elements
const adminMembersList = document.getElementById('adminMembersList');
const adminMembersTable = document.getElementById('adminMembersTable');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const purokFilter = document.getElementById('purokFilter');
const tungkulinFilter = document.getElementById('tungkulinFilter');
const totalMembersCount = document.getElementById('totalMembersCount');
const activeMembersCount = document.getElementById('activeMembersCount');
const tungkulinMembersCount = document.getElementById('tungkulinMembersCount');
const recentMembersCount = document.getElementById('recentMembersCount');
const filteredCount = document.getElementById('filteredCount');
const totalCount = document.getElementById('totalCount');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const selectAllBtn = document.getElementById('selectAllBtn');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
const addMemberBtn = document.getElementById('addMemberBtn');
const exportBtn = document.getElementById('exportBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Modal elements
const addModal = document.getElementById('addModal');
const editModal = document.getElementById('editModal');
const closeAddModal = document.getElementById('closeAddModal');
const closeEditModal = document.getElementById('closeModal');
const addMemberForm = document.getElementById('addMemberForm');
const editMemberForm = document.getElementById('editMemberForm');

// Form elements
const addName = document.getElementById('addName');
const addBirthday = document.getElementById('addBirthday');
const addContact = document.getElementById('addContact');
const addAddress = document.getElementById('addAddress');
const addPurokGrupo = document.getElementById('addPurokGrupo');
const addStatus = document.getElementById('addStatus');
const addTungkulinContainer = document.getElementById('addTungkulinContainer');
const addTungkulinBtn = document.getElementById('addTungkulinBtn');
const addAgeDisplay = document.getElementById('addAgeDisplay');
const addCalculatedAge = document.getElementById('addCalculatedAge');

const editMemberId = document.getElementById('editMemberId');
const editName = document.getElementById('editName');
const editBirthday = document.getElementById('editBirthday');
const editContact = document.getElementById('editContact');
const editAddress = document.getElementById('editAddress');
const editPurokGrupo = document.getElementById('editPurokGrupo');
const editStatus = document.getElementById('editStatus');
const editTungkulinContainer = document.getElementById('editTungkulinContainer');
const editTungkulinBtn = document.getElementById('editTungkulinBtn');
const editAgeDisplay = document.getElementById('editAgeDisplay');
const editCalculatedAge = document.getElementById('editCalculatedAge');

// Global variables
let allMembers = [];
let filteredMembers = [];
let selectedMembers = new Set();
let currentSerialNumber = 1;

// Tungkulin options (matching form.html)
const tungkulinOptions = [
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

// Make functions globally available for onclick handlers (must be before DOM loads)
window.logout = function() {
    console.log('🔍 Logout function called');
    
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to logout? You will be redirected to the main dashboard.');
    
    if (confirmed) {
        console.log('🚪 Admin logging out...');
        
        // Clear all session data
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminLoginTime');
        
        // Show logout message
        alert('You have been successfully logged out. Redirecting to main dashboard...');
        
        // Redirect to main dashboard (index.html)
        window.location.href = 'index.html';
    } else {
        console.log('❌ Logout cancelled by user');
    }
};

// Placeholder for editMember and deleteMember - will be defined later
window.editMember = function() { console.log('editMember not yet defined'); };
window.deleteMember = function() { console.log('deleteMember not yet defined'); };

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard initialized');
    initializeDashboard();
    setupEventListeners();
    loadMembers();
});

// Initialize dashboard
function initializeDashboard() {
    // Check if admin is logged in
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const loginTime = sessionStorage.getItem('adminLoginTime');
    
    if (!isLoggedIn) {
        console.log('❌ Not logged in, redirecting to login...');
        window.location.href = 'admin.html';
        return;
    }

    // Check session timeout (8 hours)
    const currentTime = Date.now();
    const loginTimestamp = parseInt(loginTime) || 0;
    const sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    
    if (currentTime - loginTimestamp > sessionTimeout) {
        console.log('⏰ Session expired, logging out...');
        window.logout();
        return;
    }

    // Update login time to extend session
    sessionStorage.setItem('adminLoginTime', currentTime.toString());
    
    console.log('✅ Admin session validated');
    console.log('⏰ Session will expire in 8 hours');

    // Populate tungkulin filter
    populateTungkulinFilter();
    
    // Set max date for birthday inputs
    const today = new Date().toISOString().split('T')[0];
    addBirthday.max = today;
    editBirthday.max = today;

    // Add page visibility change listener for auto-logout
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('📄 Page hidden, session will be checked on return');
        } else {
            // Check session when page becomes visible again
            const currentTime = Date.now();
            const loginTimestamp = parseInt(sessionStorage.getItem('adminLoginTime')) || 0;
            
            if (currentTime - loginTimestamp > sessionTimeout) {
                console.log('⏰ Session expired while page was hidden, logging out...');
                window.logout();
            }
        }
    });

    // Add beforeunload listener to clear session if user closes tab/window
    window.addEventListener('beforeunload', function() {
        console.log('🚪 User leaving page, session will be cleared');
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminLoginTime');
    });
}

// Setup event listeners
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Check if logout button exists
    if (logoutBtn) {
        console.log('✅ Logout button found, adding event listener');
        logoutBtn.addEventListener('click', window.logout);
    } else {
        console.error('❌ Logout button not found!');
    }
    
    // Search and filter
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    statusFilter.addEventListener('change', applyFilters);
    purokFilter.addEventListener('change', applyFilters);
    tungkulinFilter.addEventListener('change', applyFilters);

    // Bulk actions
    selectAllCheckbox.addEventListener('change', toggleSelectAll);
    selectAllBtn.addEventListener('click', toggleSelectAll);
    deleteSelectedBtn.addEventListener('click', deleteSelectedMembers);

    // Modal controls
    addMemberBtn.addEventListener('click', () => openModal(addModal));
    closeAddModal.addEventListener('click', () => closeModal(addModal));
    closeEditModal.addEventListener('click', () => closeModal(editModal));
    
    // Close modals when clicking outside
    addModal.addEventListener('click', (e) => {
        if (e.target === addModal) closeModal(addModal);
    });
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModal(editModal);
    });

    // Forms
    addMemberForm.addEventListener('submit', handleAddMember);
    editMemberForm.addEventListener('submit', handleEditMember);

    // Age calculation
    addBirthday.addEventListener('change', () => calculateAge(addBirthday, addCalculatedAge));
    editBirthday.addEventListener('change', () => calculateAge(editBirthday, editCalculatedAge));

    // Tungkulin buttons
    addTungkulinBtn.addEventListener('click', () => addTungkulinField(addTungkulinContainer));
    editTungkulinBtn.addEventListener('click', () => addTungkulinField(editTungkulinContainer));

    // Export
    exportBtn.addEventListener('click', exportData);
    
    console.log('✅ Event listeners setup complete');
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
        
        // Update current serial number
        if (allMembers.length > 0) {
            const maxSerial = Math.max(...allMembers.map(m => parseInt(m.serialNumber) || 0));
            currentSerialNumber = maxSerial + 1;
        }

        updateStats();
        applyFilters();
    }, (error) => {
        console.error('Error loading members:', error);
        alert('Error loading members. Please refresh the page.');
    });
}

// Update statistics
function updateStats() {
    const total = allMembers.length;
    const active = allMembers.filter(m => m.status === 'Aktibo').length;
    const withTungkulin = allMembers.filter(m => m.tungkulin && m.tungkulin.length > 0).length;
    
    // Recent additions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = allMembers.filter(m => {
        const memberDate = m.dateAdded ? new Date(m.dateAdded.toDate()) : new Date();
        return memberDate >= thirtyDaysAgo;
    }).length;

    totalMembersCount.textContent = total;
    activeMembersCount.textContent = active;
    tungkulinMembersCount.textContent = withTungkulin;
    recentMembersCount.textContent = recent;
}

// Apply filters and search
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;
    const purokFilterValue = purokFilter.value;
    const tungkulinFilterValue = tungkulinFilter.value;

    filteredMembers = allMembers.filter(member => {
        // Search filter
        const matchesSearch = !searchTerm || 
            member.name?.toLowerCase().includes(searchTerm) ||
            member.serialNumber?.toString().includes(searchTerm) ||
            member.contact?.includes(searchTerm) ||
            member.status?.toLowerCase().includes(searchTerm);

        // Status filter
        const matchesStatus = !statusFilterValue || member.status === statusFilterValue;

        // Purok filter
        const matchesPurok = !purokFilterValue || member.purokGrupo?.startsWith(purokFilterValue);

        // Tungkulin filter
        const matchesTungkulin = !tungkulinFilterValue || 
            (member.tungkulin && member.tungkulin.some(t => t.tungkulin === tungkulinFilterValue));

        return matchesSearch && matchesStatus && matchesPurok && matchesTungkulin;
    });

    displayMembers();
    updateFilterCounts();
}

// Display members in table
function displayMembers() {
    adminMembersList.innerHTML = '';

    if (filteredMembers.length === 0) {
        adminMembersList.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No members found matching your criteria
                </td>
            </tr>
        `;
        return;
    }

    filteredMembers.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="member-checkbox" data-id="${member.id}">
            </td>
            <td>${member.serialNumber || 'N/A'}</td>
            <td>${member.name || 'N/A'}</td>
            <td>${member.birthday || 'N/A'}</td>
            <td>${member.age || 'N/A'}</td>
            <td>${member.contact || 'N/A'}</td>
            <td>${member.address || 'N/A'}</td>
            <td>${member.purokGrupo || 'N/A'}</td>
            <td>${formatTungkulin(member.tungkulin)}</td>
            <td>
                <span class="status-badge ${getStatusClass(member.status)}">
                    ${member.status || 'N/A'}
                </span>
            </td>
            <td>
                <button class="admin-btn" onclick="editMember('${member.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="admin-btn danger" onclick="deleteMember('${member.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Add checkbox event listener
        const checkbox = row.querySelector('.member-checkbox');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedMembers.add(member.id);
            } else {
                selectedMembers.delete(member.id);
            }
            updateBulkActions();
        });

        adminMembersList.appendChild(row);
    });
}

// Update filter counts
function updateFilterCounts() {
    filteredCount.textContent = filteredMembers.length;
    totalCount.textContent = allMembers.length;
}

// Toggle select all
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.member-checkbox');
    const isChecked = selectAllCheckbox.checked;

    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        if (isChecked) {
            selectedMembers.add(checkbox.dataset.id);
        } else {
            selectedMembers.delete(checkbox.dataset.id);
        }
    });

    updateBulkActions();
}

// Update bulk actions visibility
function updateBulkActions() {
    if (selectedMembers.size > 0) {
        deleteSelectedBtn.style.display = 'inline-flex';
        deleteSelectedBtn.innerHTML = `<i class="fas fa-trash"></i> Delete Selected (${selectedMembers.size})`;
    } else {
        deleteSelectedBtn.style.display = 'none';
    }
}

// Delete selected members
async function deleteSelectedMembers() {
    if (selectedMembers.size === 0) return;

    const confirmed = confirm(`Are you sure you want to delete ${selectedMembers.size} selected member(s)?`);
    if (!confirmed) return;

    try {
        const deletePromises = Array.from(selectedMembers).map(id => {
            const memberRef = ref(database, `members/${id}`);
            return remove(memberRef);
        });

        await Promise.all(deletePromises);
        selectedMembers.clear();
        updateBulkActions();
        alert('Selected members deleted successfully!');
    } catch (error) {
        console.error('Error deleting members:', error);
        alert('Error deleting members. Please try again.');
    }
}

// Open modal
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset forms
    if (modal === addModal) {
        addMemberForm.reset();
        addTungkulinContainer.innerHTML = '';
        addCalculatedAge.textContent = '-';
    } else if (modal === editModal) {
        editMemberForm.reset();
        editTungkulinContainer.innerHTML = '';
        editCalculatedAge.textContent = '-';
    }
}

// Handle add member
async function handleAddMember(e) {
    e.preventDefault();

    const formData = new FormData(addMemberForm);
    const memberData = {
        name: formData.get('name'),
        birthday: formData.get('birthday'),
        age: calculateAgeFromDate(formData.get('birthday')),
        contact: formData.get('contact'),
        address: formData.get('address'),
        purokGrupo: formData.get('purokGrupo'),
        status: formData.get('status'),
        tungkulin: getTungkulinFromForm(addTungkulinContainer),
        serialNumber: currentSerialNumber,
        dateAdded: new Date()
    };

    try {
        // Generate serial number
        const serialNumber = await generateSerialNumber();
        memberData.serialNumber = serialNumber;
        
        // Save to Firebase Realtime Database
        const memberRef = ref(database, `members/${serialNumber}`);
        await set(memberRef, memberData);
        
        closeModal(addModal);
        alert('Member added successfully!');
    } catch (error) {
        console.error('Error adding member:', error);
        alert('Error adding member. Please try again.');
    }
}

// Handle edit member
async function handleEditMember(e) {
    e.preventDefault();

    const memberId = editMemberId.value;
    const formData = new FormData(editMemberForm);
    const memberData = {
        name: formData.get('name'),
        birthday: formData.get('birthday'),
        age: calculateAgeFromDate(formData.get('birthday')),
        contact: formData.get('contact'),
        address: formData.get('address'),
        purokGrupo: formData.get('purokGrupo'),
        status: formData.get('status'),
        tungkulin: getTungkulinFromForm(editTungkulinContainer),
        dateUpdated: new Date()
    };

    try {
        // Update in Firebase Realtime Database
        const memberRef = ref(database, `members/${memberId}`);
        await set(memberRef, memberData);
        
        closeModal(editModal);
        alert('Member updated successfully!');
    } catch (error) {
        console.error('Error updating member:', error);
        alert('Error updating member. Please try again.');
    }
}

// Generate serial number
async function generateSerialNumber() {
    try {
        const serialRef = ref(database, 'serialNumbers/latest');
        const snapshot = await get(serialRef);
        let currentSerial = 1;

        if (snapshot.exists()) {
            currentSerial = snapshot.val() + 1;
        }

        await set(serialRef, currentSerial);
        return `KAD-${String(currentSerial).padStart(4, '0')}`;
    } catch (error) {
        console.error("Error generating serial number:", error);
        const counter = parseInt(localStorage.getItem('serialNumberCounter')) || 1;
        localStorage.setItem('serialNumberCounter', counter + 1);
        return `KAD-${String(counter).padStart(4, '0')}`;
    }
}

// Edit member (global function for onclick)
window.editMember = function(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;

    // Populate form
    editMemberId.value = member.id;
    editName.value = member.name || '';
    editBirthday.value = member.birthday || '';
    editContact.value = member.contact || '';
    editAddress.value = member.address || '';
    editPurokGrupo.value = member.purokGrupo || '';
    editStatus.value = member.status || 'Aktibo';

    // Calculate and display age
    if (member.birthday) {
        calculateAge(editBirthday, editCalculatedAge);
    }

    // Populate tungkulin
    editTungkulinContainer.innerHTML = '';
    if (member.tungkulin && member.tungkulin.length > 0) {
        member.tungkulin.forEach(t => {
            addTungkulinField(editTungkulinContainer, t);
        });
    }

    openModal(editModal);
};

// Delete member (global function for onclick)
window.deleteMember = function(memberId) {
    const confirmed = confirm('Are you sure you want to delete this member?');
    if (!confirmed) return;

    const memberRef = ref(database, `members/${memberId}`);
    remove(memberRef)
        .then(() => {
            alert('Member deleted successfully!');
        })
        .catch((error) => {
            console.error('Error deleting member:', error);
            alert('Error deleting member. Please try again.');
        });
};

// Calculate age from date input
function calculateAge(dateInput, ageDisplay) {
    const birthday = new Date(dateInput.value);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
    
    ageDisplay.textContent = age;
    return age;
}

// Calculate age from date string
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

// Add tungkulin field
function addTungkulinField(container, existingTungkulin = null) {
    const tungkulinDiv = document.createElement('div');
    tungkulinDiv.className = 'tungkulin-field';
    tungkulinDiv.innerHTML = `
        <label>Tungkulin</label>
        <select class="tungkulin-select" required>
            <option value="">Select Tungkulin</option>
            ${tungkulinOptions.map(option => 
                `<option value="${option}" ${existingTungkulin && existingTungkulin.tungkulin === option ? 'selected' : ''}>
                    ${option}
                </option>`
            ).join('')}
        </select>
        <button type="button" class="admin-btn danger" onclick="this.parentElement.remove()" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.8rem;">
            <i class="fas fa-trash"></i> Remove
        </button>
    `;
    container.appendChild(tungkulinDiv);
}

// Get tungkulin from form
function getTungkulinFromForm(container) {
    const tungkulinFields = container.querySelectorAll('.tungkulin-select');
    const tungkulin = [];
    
    tungkulinFields.forEach((field, index) => {
        if (field.value) {
            tungkulin.push({
                tungkulin: field.value,
                order: index + 1
            });
        }
    });
    
    return tungkulin;
}

// Format tungkulin for display
function formatTungkulin(tungkulin) {
    if (!tungkulin || !Array.isArray(tungkulin) || tungkulin.length === 0) return 'None';
    return tungkulin.map(t => t.tungkulin || t).join(', ');
}

// Get status class for styling
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

// Populate tungkulin filter
function populateTungkulinFilter() {
    tungkulinFilter.innerHTML = '<option value="">All Tungkulin</option>';
    tungkulinOptions.forEach(option => {
        tungkulinFilter.innerHTML += `<option value="${option}">${option}</option>`;
    });
}

// Export data
function exportData() {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kapisanan_members_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Generate CSV
function generateCSV() {
    const headers = ['Serial No.', 'Name', 'Birthday', 'Age', 'Contact', 'Address', 'Purok-Grupo', 'Status', 'Tungkulin', 'Date Added'];
    const rows = allMembers.map(member => [
        member.serialNumber || '',
        member.name || '',
        member.birthday || '',
        member.age || '',
        member.contact || '',
        member.address || '',
        member.purokGrupo || '',
        member.status || '',
        formatTungkulin(member.tungkulin),
        member.dateAdded ? member.dateAdded.toDate().toLocaleDateString() : ''
    ]);
    
    return [headers, ...rows].map(row => 
        row.map(field => `"${field}"`).join(',')
    ).join('\n');
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