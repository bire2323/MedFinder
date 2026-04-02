import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'   // Change to 'smooth' if you prefer animation
        });
    }, [pathname]);   // Runs every time route changes

    return null;   // This component doesn't render anything
}