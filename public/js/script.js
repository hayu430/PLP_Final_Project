async function fetchStats() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/stats');
        if (response.ok) {
            const stats = await response.json();

            if (document.getElementById('totalItems')) {
                document.getElementById('totalItems').textContent = stats.totalItems || 0;
            }
            if (document.getElementById('totalUsers')) {
                document.getElementById('totalUsers').textContent = stats.activeUsers || 0;
            }
            if (document.getElementById('totalPoints')) {
                document.getElementById('totalPoints').textContent = stats.totalPoints || 0;
            }
        }
    } catch (error) {
        console.log('Stats not available on public pages');
    }
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 20);
}

if (document.querySelector('.hero')) {
    fetchStats();
}
