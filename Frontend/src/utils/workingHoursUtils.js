/**
 * Utility functions for formatting working hours
 */

/**
 * Format working hours object into readable string
 * @param {Object|string} workingHour - Working hours object or JSON string
 * @returns {string} Formatted working hours string
 */
export const formatWorkingHours = (workingHour) => {
    const isEng = localStorage.getItem("i18nextLng") === "en";
    if (!workingHour) return isEng ? 'Not set' : "አልተቀመጠም";

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
        return isEng ? 'Not set' : "አልተቀመጠም";
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
    // console.log(typeof (workingHour));
    const isEng = localStorage.getItem("i18nextLng") === "en";
    if (!workingHour) return isEng ? 'closed' : "ዝግ ነው!";

    let parsed;
    if (typeof workingHour === 'string') {
        try {
            parsed = JSON.parse(workingHour);

        } catch (e) {
            return isEng ? 'closed' : "ዝግ ነው!";
        }
    } else if (typeof workingHour === 'object') {
        parsed = workingHour;
    } else {
        return isEng ? 'closed' : "ዝግ ነው!";
    }

    const today = new Date().toLocaleString('en-US', { weekday: 'short' });
    // console.log("today", today);
    const dayKey = today.charAt(0).toUpperCase() + today.slice(1, 3); // Mon, Tue, etc.
    // console.log("daykey", dayKey);


    const hours = parsed[dayKey] || [];
    // console.log("hours", hours);

    if (hours.length === 0) return 'Closed';

    const start = Math.min(...hours);
    const end = Math.max(...hours) + 1;
    return `${start}:00 - ${end}:00`;
};