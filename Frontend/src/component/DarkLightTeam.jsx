import React, { useEffect, useState } from "react";
import { Moon, Sun, Dot } from "lucide-react";

function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-1 rounded-full 
                 bg-gray-50 dark:bg-gray-800 transition-colors duration-300 "
    >
      {theme === "dark" ? (
        <Sun className="text-yellow-400" size={20} />
      ) : (
        <div className="relative ">
          {" "}
          <Moon className=" fill-white className text-gray-300 " size={24} />
          <Dot className="text-white absolute bottom-2.5 left-2.5" size={20} />
          <Dot className="text-white absolute bottom-0.5 left-0.5" size={28} />
        </div>
      )}
    </button>
  );
}

export default ThemeToggle;
