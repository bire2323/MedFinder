import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Search, Loader2, X } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function AutocompleteInput({ 
  placeholder, 
  onSearch, 
  className = "" 
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Mocking drug autocomplete for now
        // In real app: const res = await axios.get(`${API_BASE_URL}/medicines/autocomplete?query=${query}`);
        // setSuggestions(res.data);
        
        // Mock data
        const mockSuggestions = [
          "Paracetamol", "Panadol", "Amoxicillin", "Ciprofloxacin", "Metformin"
        ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
        
        setSuggestions(mockSuggestions);
        setIsOpen(true);
      } catch (error) {
        console.error("Autocomplete failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion) => {
    setQuery(suggestion);
    setIsOpen(false);
    onSearch(suggestion);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || t("search.drug_placeholder")}
          className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-xl focus:ring-2 focus:ring-slate-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all outline-none"
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch(query);
              setIsOpen(false);
            }
          }}
        />
        {isLoading ? (
          <div className="absolute right-4 text-blue-500 animate-spin">
            <Loader2 size={20} />
          </div>
        ) : query && (
          <button 
            onClick={handleClear}
            className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            {suggestions.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSelect(item)}
                className="w-full px-6 py-3 text-left hover:bg-slate-50 dark:hover:bg-gray-700/50 flex items-center justify-between group transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item}
                  </span>
                  <span className="text-xs text-slate-400">Medicine</span>
                </div>
                <Search size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
          <div className="px-6 py-3 bg-slate-50 dark:bg-gray-700/30 border-t border-slate-100 dark:border-gray-700">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Press Enter to search directly
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
