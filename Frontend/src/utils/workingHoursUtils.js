/**
 * Utility functions for formatting working hours
 */

/**
 * Format working hours object into readable string
 * @param {Object|string} workingHour - Working hours object or JSON string
 * @returns {string} Formatted working hours string
 */
export const formatWorkingHours = (workingHour) => {
    if (!workingHour) return 'Not set';

    let parsed;
    if (typeof workingHour === 'string') {
        try {
            parsed = JSON.parse(workingHour);
        } catch (e) {
            return 'Invalid format';
        }
    } else if (typeof workingHour === 'object') {
        parsed = workingHour;
    } else {
        return 'Not set';
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayNames = {
        Mon: 'Monday',
        Tue: 'Tuesday',
        Wed: 'Wednesday',
        Thu: 'Thursday',
        Fri: 'Friday',
        Sat: 'Saturday',
        Sun: 'Sunday'
    };

    const formatted = days.map(day => {
        const hours = parsed[day] || [];
        if (hours.length === 0) return `${dayNames[day]}: Closed`;
        const start = Math.min(...hours);
        const end = Math.max(...hours) + 1;
        return `${dayNames[day]}: ${start}:00 - ${end}:00`;
    });

    return formatted.join(', ');
};

/**
 * Get today's working hours from working hours object
 * @param {Object|string} workingHour - Working hours object or JSON string
 * @returns {string} Today's hours or 'Closed'
 */
export const getTodayHours = (workingHour) => {
    // console.log("getTodayHours called with:", workingHour);
    if (!workingHour) return 'Closed';

    let parsed;
    if (typeof workingHour === 'string') {
        try {
            parsed = JSON.parse(workingHour);

        } catch (e) {
            return 'Closed';
        }
    } else if (typeof workingHour === 'object') {
        parsed = workingHour;
    } else {
        return 'Closed';
    }

    const today = new Date().toLocaleString('en-US', { weekday: 'short' });
    const dayKey = today.charAt(0).toUpperCase() + today.slice(1, 3); // Mon, Tue, etc.

    const hours = parsed[dayKey] || [];
    if (hours.length === 0) return 'Closed';

    const start = Math.min(...hours);
    const end = Math.max(...hours) + 1;
    return `${start}:00 - ${end}:00`;
};