const BACKEND_URL = 'http://localhost:3000'; // Express backend

let currentUser = null;
let allItems = [];
let statusChart = null;
let categoryChart = null;

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await fetch(`${BACKEND_URL}/api/users/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
            credentials: 'include'
        });
        if (!response.ok) {
            window.location.href = 'login.html';
            return false;
        }

        currentUser = await response.json();

        if (currentUser.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'dashboard.html';
            return false;
        }

        return true;
    } catch (error) {
        window.location.href = 'login.html';
        return false;
    }
}

// Load admin stats
async function loadStats() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/stats`, {
            credentials: 'include'
        });
        const stats = await response.json();

        document.getElementById('totalItems').textContent = stats.totalItems || 0;
        document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
        document.getElementById('recycledItems').textContent = stats.statusStats.Recycled || 0;
        document.getElementById('totalPoints').textContent = stats.totalPoints || 0;

        createStatusChart(stats.statusStats);
        createCategoryChart(stats.categoryStats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Create status chart
function createStatusChart(statusStats) {
    const ctx = document.getElementById('statusChart').getContext('2d');

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Collected', 'Recycled'],
            datasets: [{
                data: [
                    statusStats.Pending || 0,
                    statusStats.Collected || 0,
                    statusStats.Recycled || 0
                ],
                backgroundColor: [
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(23, 162, 184, 0.8)',
                    'rgba(40, 167, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 193, 7, 1)',
                    'rgba(23, 162, 184, 1)',
                    'rgba(40, 167, 69, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Create category chart
function createCategoryChart(categoryStats) {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    if (categoryChart) categoryChart.destroy();

    const labels = Object.keys(categoryStats);
    const data = Object.values(categoryStats);

    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Items',
                data: data,
                backgroundColor: 'rgba(40, 167, 69, 0.6)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Load all items
async function loadItems() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/items`, {
            credentials: 'include'
        });
        allItems = await response.json();
        displayItems(allItems);
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

// Display items in table
function displayItems(items) {
    const tbody = document.getElementById('itemsTable');

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No items submitted yet.</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.users ? item.users.name : 'Unknown'}</td>
            <td>${item.category}</td>
            <td>${item.location}</td>
            <td><span class="item-status ${item.status.toLowerCase()}">${item.status}</span></td>
            <td>${new Date(item.date_submitted).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-primary btn-small" onclick="openStatusModal('${item.id}', '${item.status}')">
                    <i class="fas fa-edit"></i> Update
                </button>
            </td>
        </tr>
    `).join('');
}

// Status modal
function openStatusModal(itemId, currentStatus) {
    const modal = document.getElementById('statusModal');
    document.getElementById('itemId').value = itemId;
    document.getElementById('newStatus').value = currentStatus;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('statusModal').style.display = 'none';
}

document.querySelector('.close').addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    const modal = document.getElementById('statusModal');
    if (e.target === modal) closeModal();
});

// Update item status
document.getElementById('statusForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const itemId = document.getElementById('itemId').value;
    const newStatus = document.getElementById('newStatus').value;

    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/item/${itemId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert('Status updated successfully!');
            closeModal();
            loadItems();
            loadStats();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to update status');
        }
    } catch (error) {
        console.error('Update error:', error);
        alert('Failed to update status');
    }
});

// Initialize admin dashboard
async function init() {
    const authenticated = await checkAuth();
    if (authenticated) {
        loadStats();
        loadItems();
    }
}

init();
