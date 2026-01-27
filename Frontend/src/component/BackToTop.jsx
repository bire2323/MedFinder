import { useEffect, useState, useRef } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const currentScrollY = window.scrollY;

      // Logic: Show only when scrolled down > 300px AND scrolling UP
      if (currentScrollY > 300 && currentScrollY < lastScrollY.current) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
       
        fixed bottom-0 left-1/2 -translate-x-1/2 z-50 
        bg-black/45 backdrop-blur-md text-white py-2 px-3 border border-white/10
        transition-all duration-500 ease-in-out shadow-2xl
        hover:bg-black/60 active:scale-90
        ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }
      `}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
