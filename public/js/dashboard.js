const BACKEND_URL = 'http://localhost:3000'; // your Express backend

let currentUser = null;
let userItems = [];

// Logout button
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
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userPoints').textContent = currentUser.points;
        return true;
    } catch (error) {
        window.location.href = 'login.html';
        return false;
    }
}

// Load user items
async function loadItems() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/ewaste/my-items`, {
            credentials: 'include'
        });
        const items = await response.json();
        userItems = items;

        const pending = items.filter(item => item.status === 'Pending').length;
        const collected = items.filter(item => item.status === 'Collected').length;
        const recycled = items.filter(item => item.status === 'Recycled').length;

        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('collectedCount').textContent = collected;
        document.getElementById('recycledCount').textContent = recycled;

        displayItems(items);
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

// Display items
function displayItems(items) {
    const container = document.getElementById('itemsContainer');

    if (items.length === 0) {
        container.innerHTML = '<p class="no-data">No items submitted yet. Click "Submit New E-Waste" to get started!</p>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="item-card">
            <div class="item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<i class="fas fa-laptop"></i>'}
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3>${item.name}</h3>
                    <span class="item-status ${item.status.toLowerCase()}">${item.status}</span>
                </div>
                <div class="item-details">
                    <p><i class="fas fa-tag"></i> ${item.category}</p>
                    <p><i class="fas fa-info-circle"></i> ${item.condition}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${item.location}</p>
                    <p><i class="fas fa-calendar"></i> ${new Date(item.date_submitted).toLocaleDateString()}</p>
                    ${item.description ? `<p><i class="fas fa-comment"></i> ${item.description}</p>` : ''}
                </div>
                ${item.status === 'Pending' ? `
                    <div class="item-actions">
                        <button class="btn btn-outline btn-small" onclick="deleteItem('${item.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Delete item
async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/ewaste/item/${itemId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            alert('Item deleted successfully');
            loadItems();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete item');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete item');
    }
}

// Toggle submit form
function toggleSubmitForm() {
    const form = document.getElementById('submitForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }
}

// Submit new item
document.getElementById('ewasteForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('itemName').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('condition', document.getElementById('condition').value);
    formData.append('location', document.getElementById('location').value);
    formData.append('description', document.getElementById('description').value);

    const imageFile = document.getElementById('image').files[0];
    if (imageFile) formData.append('image', imageFile);

    const errorDiv = document.getElementById('formError');

    try {
        const response = await fetch(`${BACKEND_URL}/api/ewaste/submit`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            alert('E-waste item submitted successfully!');
            document.getElementById('ewasteForm').reset();
            toggleSubmitForm();
            loadItems();
            checkAuth();
        } else {
            errorDiv.textContent = data.error || 'Submission failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Submit error:', error);
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
    }
});

// Load leaderboard
async function loadLeaderboard() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/users/leaderboard`, {
            credentials: 'include'
        });
        const leaderboard = await response.json();

        const container = document.getElementById('leaderboardContainer');

        if (leaderboard.length === 0) {
            container.innerHTML = '<p class="no-data">No leaderboard data yet.</p>';
            return;
        }

        container.innerHTML = leaderboard.map((user, index) => `
            <div class="leaderboard-item">
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-name">${user.name}</span>
                <span class="leaderboard-points">${user.points} pts</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Initialize dashboard
async function init() {
    const authenticated = await checkAuth();
    if (authenticated) {
        loadItems();
        loadLeaderboard();
    }
}

init();
