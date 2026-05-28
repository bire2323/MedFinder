import React from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Stethoscope,
  Activity,
  Users,
  Building2,
  MessageSquare,
  ChevronRight,
  Tag,
  Clock,
  MapPin
} from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";

const AnalyticsCard = ({ title, value, icon, bgColor, description }) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/20 transition-all duration-500 group overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
            {title}
          </p>
          <p className="text-4xl font-black text-slate-800 dark:text-white transition-transform origin-left group-hover:scale-105 duration-300">
            {value}
          </p>
        </div>

        <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-md`}>
          {React.cloneElement(icon, { size: 24, className: "text-current" })}
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-4 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-350 transition-colors duration-300">
        {description}
      </p>
    </motion.div>
  );
};

export default function OverviewTab() {
  const { hospitalProfile, departments, services, recentChats } = useOutletContext();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      key="overview"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Hospital Profile Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/50 dark:border-slate-800/80 shadow-sm overflow-hidden relative group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-850 shadow-md">
            {hospitalProfile?.logo_url ? (
              <img src={hospitalProfile.logo_url} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 size={36} className="text-slate-300 dark:text-slate-600 animate-pulse" />
            )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                {hospitalProfile?.hospital_name_en || "Hospital Name"}
              </h2>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${hospitalProfile?.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-amber-55/20 text-amber-600'}`}>
                {hospitalProfile?.status || "PENDING"}
              </span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold max-w-2xl leading-relaxed">
              {hospitalProfile?.address_description_en || "Official hospital profile overview for MedFinder."}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <Tag size={14} className="text-blue-500" />
                {hospitalProfile?.hospital_ownership_type || "Private"}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <Clock size={14} className="text-emerald-500" />
                {hospitalProfile?.isFullTime ? "24/7 Service" : ""}
              </div>
              {hospitalProfile?.addresses?.[0] && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <MapPin size={14} className="text-rose-500" />
                  {`${hospitalProfile.addresses[0]?.region?.name_en}, ${hospitalProfile.addresses[0]?.city?.name_en}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <AnalyticsCard
          title="Departments"
          value={departments?.length || 0}
          icon={<Layers />}
          bgColor="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
          description={`${departments?.length || 0} specialized departments managed.`}
        />
        <AnalyticsCard
          title="Services"
          value={services?.length || 0}
          icon={<Stethoscope />}
          bgColor="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
          description={`${services?.length || 0} healthcare services offered to patients.`}
        />
        <AnalyticsCard
          title="Total Inquiries"
          value="2"
          icon={<Activity />}
          bgColor="bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
          description="94% patient inquiry resolution rate this month."
        />
        <AnalyticsCard
          title="Staff Count"
          value="2"
          icon={<Users />}
          bgColor="bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400"
          description="Qualified medical professionals on duty."
        />
      </motion.div>

      {/* Main Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Recent Departments Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Active Departments</h3>
            <button
              onClick={() => navigate("/hospital/dashboard/departments")}
              className="group flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Manage all
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {departments?.slice(0, 4).map((dept) => (
              <div
                key={dept.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                    <Building2 size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-850 dark:text-white truncate text-sm">
                      {dept.department_name_en}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {dept.department_category_name_en || "General"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {departments?.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80">
                <p className="text-slate-400 font-bold text-xs">No departments added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-600" />
            Patient Inquiries
          </h3>
          <div className="space-y-4">
            {recentChats?.map((chat) => (
              <div
                key={chat.id}
                className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer ${chat.status === "unread"
                  ? "bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30"
                  : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/80"
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{chat.user}</span>
                  <span className="text-[9px] font-bold text-slate-400">{chat.time}</span>
                </div>
                <p className="text-xs font-semibold text-slate-650 dark:text-slate-350 line-clamp-2 leading-relaxed">
                  "{chat.message}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
