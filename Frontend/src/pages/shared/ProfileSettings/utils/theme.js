export const getTheme = (type) => {
  if (type === "pharmacy") {
    return {
      name: "emerald",
      bgPrimary: "bg-emerald-600",
      bgHover: "hover:bg-emerald-700",
      bgLight: "bg-emerald-50 dark:bg-emerald-900/10",
      textPrimary: "text-emerald-600 dark:text-emerald-400",
      borderPrimary: "border-emerald-200 dark:border-emerald-800",
      ringFocus: "focus:ring-emerald-500",
      shadow: "shadow-emerald-500/20",
      shadowPrimary: "shadow-emerald-500",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/30",
    };
  }
  
  // Default Hospital Theme
  return {
    name: "blue",
    bgPrimary: "bg-blue-600",
    bgHover: "hover:bg-blue-700",
    bgLight: "bg-blue-50 dark:bg-blue-900/10",
    textPrimary: "text-blue-600 dark:text-blue-400",
    borderPrimary: "border-blue-200 dark:border-blue-800",
    ringFocus: "focus:ring-blue-500",
    shadow: "shadow-blue-500/20",
    shadowPrimary: "shadow-blue-500",
    badgeBg: "bg-blue-100 dark:bg-blue-900/30",
  };
};
