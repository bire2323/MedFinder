import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getXsrfToken } from '../api/client';


window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',                // ✅ Must be 'pusher'
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080, // use env or fallback to 8080
    forceTLS: false,                       // ✅ Use ws://, not wss://
    enabledTransports: ['ws'],              // Optional: restrict to ws only
    disableStats: true,
    withCredentials: true,

    // Auth endpoint & headers
    authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
    auth: {
        headers: {
            "X-XSRF-TOKEN": getXsrfToken() || "",
            Accept: 'application/json',
        },
    },
});

console.log('Echo connecting to:', {
    host: import.meta.env.VITE_REVERB_HOST || 'localhost',
    port: import.meta.env.VITE_REVERB_PORT || 8080,
    key: import.meta.env.VITE_REVERB_APP_KEY,
});