/**
 * Utility functions for formatting working hours
 */

/**
 * Format working hours object into readable string
 * @param {Object|string} workingHour - Working hours object or JSON string
 * @returns {string} Formatted working hours string
 */
const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday'
};

const parseWorkingHour = (workingHour) => {
    if (!workingHour) return {};
    if (typeof workingHour === 'string') {
        try {
            return JSON.parse(workingHour) || {};
        } catch (e) {
            return {};
        }
    }
    if (typeof workingHour === 'object') {
        return workingHour;
    }
    return {};
};

const normalizeDayHours = (hours) => {
    if (!Array.isArray(hours)) return [];
    return Array.from(
        new Set(
            hours
                .map((hour) => Number(hour))
                .filter((hour) => Number.isInteger(hour) && hour >= 0 && hour <= 23)
        )
    ).sort((a, b) => a - b);
};

const getDaySegments = (hours = []) => {
    const normalized = normalizeDayHours(hours);
    if (!normalized.length) return [];

    const segments = [];
    let current = { start: normalized[0], end: normalized[0] };

    for (let index = 1; index < normalized.length; index += 1) {
        const hour = normalized[index];
        if (hour === current.end + 1) {
            current.end = hour;
        } else {
            segments.push(current);
            current = { start: hour, end: hour };
        }
    }

    segments.push(current);
    return segments;
};

const formatSegments = (segments) =>
    segments.map(({ start, end }) => `${start}:00 - ${end + 1}:00`).join(', ');

export const formatWorkingHours = (workingHour) => {
    const isEng = localStorage.getItem('i18nextLng') === 'en';
    const parsed = parseWorkingHour(workingHour);

    return DAY_ORDER.map((day) => {
        const segments = getDaySegments(parsed[day]);
        if (!segments.length) {
            return `${DAY_NAMES[day]}: ${isEng ? 'Closed' : 'ዝግ ነው'}`;
        }
        return `${DAY_NAMES[day]}: ${formatSegments(segments)}`;
    }).join(', ');
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
    const dayKey = today.charAt(0).toUpperCase() + today.slice(1, 3);
    const segments = getDaySegments(parsed[dayKey]);

    if (!segments.length) return isEng ? 'Closed' : 'ዝግ ነው!';
    return formatSegments(segments);
};

export const formatDayWorkingHours = (hours) => {
    const segments = getDaySegments(hours);
    return segments.length ? formatSegments(segments) : null;
};