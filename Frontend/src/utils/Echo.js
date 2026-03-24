// utils/Echo.js
// ──────────────────────────────────────────────────────────────────────────
// Fallback Echo initialiser.
// Primary initialisation happens asynchronously in main.jsx (after the CSRF
// cookie fetch). This file acts as a safety net in case a component imports
// it before main.jsx has finished — but it SHOULD NOT run synchronously at
// module evaluation time (that would race against the CSRF fetch).
//
// Usage: import this file only as a last resort. Prefer relying on the
// window.Echo set by main.jsx.
// ──────────────────────────────────────────────────────────────────────────

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getXsrfToken, ensureCsrfCookie } from '../api/client';

window.Pusher = Pusher;

// Only initialise if main.jsx hasn't done so yet.
// We also ensure the CSRF cookie exists before we create Echo, because Echo
// immediately tries to authenticate private channels on first subscription.
if (!window.Echo) {
    (async () => {
        try {
            await ensureCsrfCookie();
        } catch (e) {
            console.warn('[Echo.js] Failed to fetch CSRF cookie:', e);
        }

        if (window.Echo) return; // main.jsx may have finished in the meantime

        const xsrfToken = getXsrfToken();

        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
            wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
            forceTLS: false,
            enabledTransports: ['ws'],
            disableStats: true,
            withCredentials: true,

            // RELATIVE path — goes through Vite proxy (same-origin).
            // Must NOT be an absolute http://localhost:8000 URL; that would be
            // cross-origin from localhost:5173 and the browser would not send
            // the laravel_session cookie, causing 419 on /broadcasting/auth.
            authEndpoint: '/broadcasting/auth',
            auth: {
                headers: {
                    'X-XSRF-TOKEN': xsrfToken || '',
                    Accept: 'application/json',
                },
            },
            cluster: '',
        });
    })();
}

export default window.Echo;