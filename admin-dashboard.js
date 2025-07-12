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
    // Search and filter listeners
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (purokFilter) {
        purokFilter.addEventListener('change', applyFilters);
    }
    
    if (tungkulinFilter) {
        tungkulinFilter.addEventListener('change', applyFilters);
    }

    // Modal listeners
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => openModal(addModal));
    }
    
    if (closeAddModal) {
        closeAddModal.addEventListener('click', () => closeModal(addModal));
    }
    
    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => closeModal(editModal));
    }

    // Form listeners
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', handleAddMember);
    }
    
    if (editMemberForm) {
        editMemberForm.addEventListener('submit', handleEditMember);
    }

    // Age calculation listeners
    if (addBirthday) {
        addBirthday.addEventListener('change', () => calculateAge(addBirthday, addCalculatedAge));
    }
    
    if (editBirthday) {
        editBirthday.addEventListener('change', () => calculateAge(editBirthday, editCalculatedAge));
    }

    // Tungkulin field listeners
    if (addTungkulinBtn) {
        addTungkulinBtn.addEventListener('click', () => addTungkulinField(addTungkulinContainer));
    }
    
    if (editTungkulinBtn) {
        editTungkulinBtn.addEventListener('click', () => addTungkulinField(editTungkulinContainer));
    }

    // Bulk action listeners
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
    }
    
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedMembers);
    }

    // Export listener
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    // Logout listener
    if (logoutBtn) {
        logoutBtn.addEventListener('click', window.logout);
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
        applyFilters();
    }, (error) => {
        console.error('Error loading members:', error);
        alert('Error loading members. Please refresh the page.');
    });
}

// Update statistics
function updateStats() {
    const totalMembers = allMembers.length;
    const activeMembers = allMembers.filter(m => m.status === 'Aktibo').length;
    const tungkulinMembers = allMembers.filter(m => 
        m.tungkulin && Array.isArray(m.tungkulin) && m.tungkulin.length > 0
    ).length;
    const recentMembers = allMembers.filter(m => {
        const memberDate = new Date(m.timestamp || 0);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return memberDate > weekAgo;
    }).length;

    if (totalMembersCount) totalMembersCount.textContent = totalMembers;
    if (activeMembersCount) activeMembersCount.textContent = activeMembers;
    if (tungkulinMembersCount) tungkulinMembersCount.textContent = tungkulinMembers;
    if (recentMembersCount) recentMembersCount.textContent = recentMembers;
}

// Apply filters and search
function applyFilters() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const statusValue = statusFilter?.value || '';
    const purokValue = purokFilter?.value || '';
    const tungkulinValue = tungkulinFilter?.value || '';

    filteredMembers = allMembers.filter(member => {
        const matchesSearch = !searchTerm || 
            (member.name && member.name.toLowerCase().includes(searchTerm)) ||
            (member.serialNumber && member.serialNumber.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusValue || member.status === statusValue;
        const matchesPurok = !purokValue || member.purokGrupo === purokValue;
        
        let matchesTungkulin = true;
        if (tungkulinValue && member.tungkulin) {
            if (Array.isArray(member.tungkulin)) {
                matchesTungkulin = member.tungkulin.some(t => {
                    if (typeof t === 'string') return t === tungkulinValue;
                    if (t && typeof t === 'object' && t.tungkulin) return t.tungkulin === tungkulinValue;
                    return false;
                });
            } else if (typeof member.tungkulin === 'string') {
                matchesTungkulin = member.tungkulin === tungkulinValue;
            } else {
                matchesTungkulin = false;
            }
        }

        return matchesSearch && matchesStatus && matchesPurok && matchesTungkulin;
    });

    displayMembers();
    updateFilterCounts();
}

// Display members in table
function displayMembers() {
    const membersList = document.getElementById('adminMembersList');
    if (!membersList) return;

    membersList.innerHTML = '';

    filteredMembers.forEach(member => {
        const row = document.createElement('tr');
        
        // Calculate age
        const age = member.birthday ? calculateAgeFromDate(member.birthday) : '';
        
        // Format tungkulin properly
        const tungkulinDisplay = formatTungkulin(member.tungkulin);
        
        row.innerHTML = `
            <td>
                <input type="checkbox" value="${member.id}" ${selectedMembers.has(member.id) ? 'checked' : ''}>
            </td>
            <td>${member.serialNumber || 'N/A'}</td>
            <td>${member.name || 'N/A'}</td>
            <td>${member.birthday || 'N/A'}</td>
            <td>${age || 'N/A'}</td>
            <td>${member.contact || 'N/A'}</td>
            <td>${member.address || 'N/A'}</td>
            <td>${member.purokGrupo || 'N/A'}</td>
            <td><span class="status-badge ${getStatusClass(member.status)}">${member.status || 'N/A'}</span></td>
            <td>${tungkulinDisplay}</td>
            <td>
                <button class="admin-btn" onclick="editMember('${member.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="admin-btn danger" onclick="deleteMember('${member.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        
        membersList.appendChild(row);
    });

    // Add checkbox listeners
    const checkboxes = membersList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                selectedMembers.add(this.value);
            } else {
                selectedMembers.delete(this.value);
            }
            updateBulkActions();
        });
    });
}

// Update filter counts
function updateFilterCounts() {
    if (filteredCount) filteredCount.textContent = filteredMembers.length;
    if (totalCount) totalCount.textContent = allMembers.length;
}

// Toggle select all
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('#adminMembersList input[type="checkbox"]');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        if (selectAllCheckbox.checked) {
            selectedMembers.add(checkbox.value);
        } else {
            selectedMembers.delete(checkbox.value);
        }
    });
    
    updateBulkActions();
}

// Update bulk actions visibility
function updateBulkActions() {
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.style.display = selectedMembers.size > 0 ? 'inline-flex' : 'none';
    }
}

// Delete selected members
async function deleteSelectedMembers() {
    const confirmed = confirm(`Are you sure you want to delete ${selectedMembers.size} selected member(s)?`);
    if (!confirmed) return;

    const deletePromises = Array.from(selectedMembers).map(memberId => {
        const memberRef = ref(database, `members/${memberId}`);
        return remove(memberRef);
    });

    try {
        await Promise.all(deletePromises);
        alert('Selected members deleted successfully!');
        selectedMembers.clear();
        updateBulkActions();
    } catch (error) {
        console.error('Error deleting members:', error);
        alert('Error deleting members. Please try again.');
    }
}

// Open modal
function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
    }
}

// Close modal
function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        
        // Reset form if it's the add modal
        if (modal === addModal && addMemberForm) {
            addMemberForm.reset();
            addTungkulinContainer.innerHTML = '';
            addCalculatedAge.textContent = '';
        }
    }
}

// Handle add member form submission
async function handleAddMember(e) {
    e.preventDefault();
    
    const memberData = {
        name: addName.value.trim(),
        birthday: addBirthday.value,
        contact: addContact.value.trim(),
        address: addAddress.value.trim(),
        purokGrupo: addPurokGrupo.value,
        status: addStatus.value,
        tungkulin: getTungkulinFromForm(addTungkulinContainer),
        timestamp: Date.now()
    };

    // Validation
    if (!memberData.name) {
        alert('Please enter a name.');
        return;
    }

    try {
        const serialNumber = await generateSerialNumber();
        const memberRef = ref(database, `members/${serialNumber}`);
        
        await set(memberRef, memberData);
        
        alert('Member added successfully!');
        closeModal(addModal);
        
        // Reset form
        addMemberForm.reset();
        addTungkulinContainer.innerHTML = '';
        addCalculatedAge.textContent = '';
        
    } catch (error) {
        console.error('Error adding member:', error);
        alert('Error adding member. Please try again.');
    }
}

// Handle edit member form submission
async function handleEditMember(e) {
    e.preventDefault();
    
    const memberId = editMemberId.value;
    const memberData = {
        name: editName.value.trim(),
        birthday: editBirthday.value,
        contact: editContact.value.trim(),
        address: editAddress.value.trim(),
        purokGrupo: editPurokGrupo.value,
        status: editStatus.value,
        tungkulin: getTungkulinFromForm(editTungkulinContainer),
        timestamp: Date.now()
    };

    // Validation
    if (!memberData.name) {
        alert('Please enter a name.');
        return;
    }

    try {
        const memberRef = ref(database, `members/${memberId}`);
        
        await set(memberRef, memberData);
        
        alert('Member updated successfully!');
        closeModal(editModal);
        
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

    // Populate tungkulin - handle both array and object formats
    editTungkulinContainer.innerHTML = '';
    if (member.tungkulin) {
        if (Array.isArray(member.tungkulin)) {
            member.tungkulin.forEach(t => {
                if (typeof t === 'string') {
                    addTungkulinField(editTungkulinContainer, t);
                } else if (t && typeof t === 'object' && t.tungkulin) {
                    addTungkulinField(editTungkulinContainer, t.tungkulin);
                }
            });
        } else if (typeof member.tungkulin === 'string') {
            addTungkulinField(editTungkulinContainer, member.tungkulin);
        }
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
    if (!dateInput.value) {
        ageDisplay.textContent = '';
        return;
    }
    
    const birthday = new Date(dateInput.value);
    const today = new Date();
    
    if (isNaN(birthday.getTime())) {
        ageDisplay.textContent = '';
        return;
    }
    
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
    
    if (isNaN(birthday.getTime())) return null;
    if (birthday > today) return null;
    
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
                `<option value="${option}" ${existingTungkulin === option ? 'selected' : ''}>
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
            tungkulin.push(field.value);
        }
    });
    
    return tungkulin;
}

// Format tungkulin for display - improved to handle various data formats
function formatTungkulin(tungkulin) {
    if (!tungkulin) return 'N/A';
    
    if (Array.isArray(tungkulin)) {
        return tungkulin
            .filter(t => t && typeof t === 'string')
            .join(', ');
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

// Populate tungkulin filter
function populateTungkulinFilter() {
    if (!tungkulinFilter) return;
    
    tungkulinFilter.innerHTML = '<option value="">All Tungkulin</option>';
    tungkulinOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        tungkulinFilter.appendChild(optionElement);
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
        member.age || calculateAgeFromDate(member.birthday) || '',
        member.contact || '',
        member.address || '',
        member.purokGrupo || '',
        member.status || '',
        formatTungkulin(member.tungkulin),
        member.timestamp ? new Date(member.timestamp).toLocaleDateString() : ''
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