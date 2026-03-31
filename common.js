/**
 * common.js
 * Shared logic for Countdown Timer and Delivery Date
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    setupDeliveryDate();
});

/**
 * Initializes the 24-hour countdown timer
 */
function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;

    function updateTimer() {
        const now = new Date();
        
        // Calculate time remaining until the end of the current day
        const endDay = new Date();
        endDay.setHours(23, 59, 59, 999);
        
        let diff = endDay - now;
        if (diff < 0) diff = 0;

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // Update DOM
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
    }

    // Initial call and interval
    updateTimer();
    setInterval(updateTimer, 1000);
}

/**
 * Calculates and formats tomorrow's date for the delivery badge
 */
function setupDeliveryDate() {
    const deliveryEl = document.getElementById('deliveryDateStr');
    if (!deliveryEl) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = tomorrow.toLocaleDateString('en-IN', options);
    
    deliveryEl.textContent = dateStr;
}
