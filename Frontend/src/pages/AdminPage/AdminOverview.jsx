import { motion } from 'framer-motion';
import { Users, Shield, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }
};

export default function AdminOverview() {
  const { t } = useTranslation();
  const { stats, loading } = useOutletContext();

  const cards = [
    {
      title: t("Admin.TotalUsers"),
      value: stats?.totalUsers ?? 0,
      description: t("Admin.PlatformUsers"),
      icon: Users,
      color: "indigo",
      bgClass: "from-indigo-50/60 to-white dark:from-slate-900 dark:to-slate-950/40 border-indigo-100 dark:border-indigo-900/50",
      iconClass: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30",
      descClass: "text-indigo-600 dark:text-indigo-400"
    },
    {
      title: t("Admin.ActiveHospitals"),
      value: stats?.totalHospitals ?? 0,
      description: t("Admin.Registered"),
      icon: Shield,
      color: "blue",
      bgClass: "from-blue-50/60 to-white dark:from-slate-900 dark:to-slate-950/40 border-blue-100 dark:border-blue-900/50",
      iconClass: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30",
      descClass: "text-blue-600 dark:text-blue-400"
    },
    {
      title: t("Admin.ActivePharmacies"),
      value: stats?.totalPharmacies ?? 0,
      description: t("Admin.WithInventory"),
      icon: Shield,
      color: "emerald",
      bgClass: "from-emerald-50/60 to-white dark:from-slate-900 dark:to-slate-950/40 border-emerald-100 dark:border-emerald-900/50",
      iconClass: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30",
      descClass: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: t("Admin.PendingApprovals"),
      value: stats?.pendingApprovals ?? 0,
      description: t("Admin.RequiresAttention"),
      icon: CheckCircle,
      color: "amber",
      bgClass: "from-amber-50/60 to-white dark:from-slate-900 dark:to-slate-950/40 border-amber-100 dark:border-amber-900/50",
      iconClass: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30",
      descClass: "text-amber-600 dark:text-amber-400 animate-pulse"
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.015, boxShadow: "0 10px 30px -15px rgba(0,0,0,0.08)" }}
            className={`bg-gradient-to-br ${card.bgClass} rounded-2xl border p-5.5 transition-all duration-300 relative overflow-hidden group`}
          >
            {/* Glowing Accent Ring inside Card */}
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-slate-400/5 group-hover:bg-slate-400/10 dark:bg-white/5 dark:group-hover:bg-white/10 blur-xl transition-all duration-300" />
            
            <div className="flex items-center justify-between mb-3.5 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400">
                {card.title}
              </p>
              <div className={`p-2 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${card.iconClass}`}>
                <Icon className="size-4" />
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-3xl font-black tracking-tight text-slate-850 dark:text-white leading-none">
                {loading ? (
                  <span className="text-slate-200 dark:text-slate-750 animate-pulse">—</span>
                ) : (
                  card.value.toLocaleString()
                )}
              </p>
              <p className={`text-[11px] font-bold mt-2 uppercase tracking-wider ${card.descClass}`}>
                {card.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
