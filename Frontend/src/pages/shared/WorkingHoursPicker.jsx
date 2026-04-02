import React, { useState } from "react";
import { Clock, Calendar, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// WorkingHoursPicker.jsx - ensure it handles the value correctly
const WorkingHoursPicker = ({ value, onChange, theme }) => {
  const { t } = useTranslation();
  
  // Parse value if it's a string (from backend)
  const parseValue = (val) => {
    if (!val) return {};
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return parsed || {};
      } catch (e) {
        console.error('Failed to parse working_hour:', e);
        return {};
      }
    }
    return val;
  };
  
  // Initialize schedule with parsed value
  const schedule = parseValue(value) || DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
  
  const toggleSlot = (day, hour) => {
    const daySchedule = schedule[day] || [];
    const newDaySchedule = daySchedule.includes(hour)
      ? daySchedule.filter((h) => h !== hour)
      : [...daySchedule, hour];
    
    // Send the object directly (not stringified)
    onChange({ ...schedule, [day]: newDaySchedule.sort((a, b) => a - b) });
  };
  
  const toggleFullDay = (day) => {
    const isFull = (schedule[day] || []).length === 24;
    onChange({ ...schedule, [day]: isFull ? [] : HOURS });
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-gray-800/50 rounded-3xl border border-gray-400 dark:border-gray-500 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">{t("Common.WeeklySchedule")}</span>
        </div>
        <div className="flex gap-4">
           {/* Color Legend */}
           <div className="flex items-center gap-1.5">
             <div className={`w-3 h-3 ${theme?.bgPrimary || 'bg-blue-500'} rounded-sm`}></div>
             <span className="text-[10px] text-slate-400 font-bold uppercase">Open</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 bg-slate-200 dark:bg-gray-700 rounded-sm border border-gray-400"></div>
             <span className="text-[10px] text-slate-400 font-bold uppercase">Closed</span>
           </div>
        </div>
      </div>

      <div className="min-w-[800px]">
        {/* Hour Headers */}
        <div className="grid grid-cols-[100px_repeat(24,1fr)] gap-1 mb-2">
          <div></div>
          {HOURS.map((h) => (
            <div key={h} className="text-[9px] text-slate-400 font-bold text-center">
              {h}:00
            </div>
          ))}
        </div>

        {/* Day Rows */}
        {DAYS.map((day) => (
          <div key={day} className="grid grid-cols-[100px_repeat(24,1fr)] gap-1 items-center mb-1 group">
            <button
               type="button"
               onClick={() => toggleFullDay(day)}
               className={`text-[11px] font-black uppercase text-left py-1 ${theme?.textPrimary ? `hover:${theme.textPrimary}` : 'hover:text-blue-500'} transition-colors`}
            >
              {t(`Common.${day}`)}
            </button>
            {HOURS.map((h) => {
              const isOpen = schedule[day]?.includes(h);
              return (
                <motion.button
                  key={h}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => toggleSlot(day, h)}
                  className={`h-8 rounded-md transition-all duration-200 border border-transparent
                    ${isOpen 
                      ? `${theme?.bgPrimary || 'bg-blue-500'} shadow-md ${theme?.shadowPrimary || 'shadow-blue-500'}/20` 
                      : "bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500 hover:bg-slate-100 dark:hover:bg-gray-700"
                    }`}
                  title={`${day} ${h}:00`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className={`mt-4 p-3 ${theme?.bgLight || 'bg-blue-50 dark:bg-blue-900/20'} rounded-xl flex items-center gap-3 ${theme?.textPrimary || 'text-blue-600 dark:text-blue-400'} border ${theme?.borderPrimary || 'border-blue-200 dark:border-blue-800'}`}>
        <AlertCircle size={18} />
        <p className="text-xs font-medium">
          Click individual blocks to toggle hours, or click the day name to toggle 24h service for that day.
        </p>
      </div>
    </div>
  );
};

export default WorkingHoursPicker;
