// ========================================
// Utility Functions
// ========================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getFaviconUrl(url) {
    try {
        const domain = new URL(url).origin;
        return `${domain}/favicon.ico`;
    } catch {
        return 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22><text y=%2218%22 font-size=%2220%22>🔖</text></svg>';
    }
}

function formatNumber(num) {
    return Number(num).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getWeatherIcon(weather) {
    const icons = {
        'Clear': 'fas fa-sun',
        'Clouds': 'fas fa-cloud',
        'Rain': 'fas fa-cloud-rain',
        'Snow': 'fas fa-snowflake',
        'Thunderstorm': 'fas fa-bolt',
        'Drizzle': 'fas fa-cloud-drizzle',
        'Mist': 'fas fa-smog',
        'Fog': 'fas fa-smog'
    };
    return icons[weather] || 'fas fa-cloud-sun';
}

function getWindDirection(deg) {
    const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
}
