import React from "react";
import { motion } from "framer-motion";
import { Layers, Stethoscope, Activity, Users, Building2, MessageSquare, ChevronRight } from "lucide-react";

const AnalyticsCard = ({ title, value, icon, bgColor, description }) => {
  return (
    <div className="relative p-6 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden cursor-default">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex items-center justify-between transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
            {title}
          </p>
          <p className="text-4xl font-black text-slate-800 dark:text-white transition-transform origin-left group-hover:scale-110">
            {value}
          </p>
        </div>

        <div className={`w-16 h-16 ${bgColor} rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 shadow-inner`}>
          {React.cloneElement(icon, { size: 32, className: "text-current" })}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center text-center px-6 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default function OverviewTab({ departments, services, recentChats, setActiveTab }) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Departments"
          value={departments?.length || 0}
          icon={<Layers />}
          bgColor="bg-blue-50 dark:bg-blue-900/20 text-blue-600"
          description={`${departments?.length || 0} specialized departments managed.`}
        />
        <AnalyticsCard
          title="Services"
          value={services?.length || 0}
          icon={<Stethoscope />}
          bgColor="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
          description={`${services?.length || 0} healthcare services offered to patients.`}
        />
        <AnalyticsCard
          title="Total Inquiries"
          value="482"
          icon={<Activity />}
          bgColor="bg-purple-50 dark:bg-purple-900/20 text-purple-600"
          description="94% patient inquiry resolution rate this month."
        />
        <AnalyticsCard
          title="Staff Count"
          value="126"
          icon={<Users />}
          bgColor="bg-orange-50 dark:bg-orange-900/20 text-orange-600"
          description="Qualified medical professionals on duty."
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Departments Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Active Departments</h3>
            <button
              onClick={() => setActiveTab("departments")}
              className="group flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Manage all
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {departments?.slice(0, 4).map((dept) => (
              <div
                key={dept.id}
                className="p-5 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 dark:text-white truncate">
                      {dept.department_name_en}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {dept.department_category_name_en || "General"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {departments?.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-gray-700">
                <p className="text-slate-400 font-bold">No departments added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <MessageSquare size={24} className="text-blue-600" />
            Patient Inquiries
          </h3>
          <div className="space-y-4">
            {recentChats?.map((chat) => (
              <div
                key={chat.id}
                className={`p-5 rounded-3xl border transition-all hover:scale-[1.02] cursor-pointer ${
                  chat.status === "unread"
                    ? "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/50"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{chat.user}</span>
                  <span className="text-[10px] font-bold text-slate-400">{chat.time}</span>
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-gray-300 line-clamp-2">
                  "{chat.message}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
