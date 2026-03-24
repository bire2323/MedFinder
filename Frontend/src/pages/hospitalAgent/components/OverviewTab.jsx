import React from "react";
import { motion } from "framer-motion";
import { Layers, Stethoscope, Activity, Users, Building2, MessageSquare } from "lucide-react";

export const StatCard = ({ title, value, trend, icon, color }) => {
  const colorVariants = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600",
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-400 dark:border-gray-500">
      <div className={`p-3 w-fit rounded-xl mb-4 ${colorVariants[color]}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <h3 className="text-2xl font-black">{value}</h3>
      <p className="text-xs font-bold text-slate-500 uppercase">{title}</p>
      <p className="text-[10px] mt-1 text-blue-500 font-bold">{trend}</p>
    </div>
  );
};

export default function OverviewTab({ departments, services, recentChats, setActiveTab }) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Departments"
          value={departments?.length?.toString() || "0"}
          trend={`${departments?.filter((d) => d.isActive).length || 0} active`}
          icon={<Layers />}
          color="blue"
        />
        <StatCard
          title="Services"
          value={services?.length?.toString() || "0"}
          trend={`${services?.filter((s) => s.isAvailable).length || 0} available`}
          icon={<Stethoscope />}
          color="emerald"
        />
        <StatCard
          title="AI Inquiries"
          value="234"
          trend="92% resolved"
          icon={<Activity />}
          color="purple"
        />
        <StatCard
          title="Patient Queries"
          value="89"
          trend="Today"
          icon={<Users />}
          color="orange"
        />
      </div>

      {/* Departments + Recent Chats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Departments Overview */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-400 dark:border-gray-500 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Active Departments</h3>
            <button
              onClick={() => setActiveTab("departments")}
              className="text-sm text-blue-500 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {departments
              ?.filter((d) => d.isActive)
              .slice(0, 5)
              .map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700/30 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Building2 size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{dept.name}</p>
                      <p className="text-[10px] text-slate-500">{dept.headDoctor}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{dept.floor}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Chats */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-400 dark:border-gray-500 p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" />
            Recent Inquiries
          </h3>
          <div className="space-y-4">
            {recentChats?.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 rounded-2xl ${chat.status === "unread"
                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
                  : "bg-slate-50 dark:bg-gray-700/30"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold">{chat.user}</p>
                  <span className="text-[10px] text-slate-400">{chat.time}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-400 truncate">
                  {chat.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
