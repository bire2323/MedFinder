import { Camera, Lock, Save, User as UserIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../../store/UserAuthStore";
import { useState, useEffect } from "react";
import { apiProfileUpdate } from "../../../api/Profile";
import handleKeyDown from "../../../hooks/handleKeyDown";
import { apiPasswordUpdate } from "../../../api/Profile";

function validatePhone(phone) {
  const v = String(phone ?? "").trim();
  if (!v) return false;
  if (v.charAt(0) != 0) {
    return false;
  }
  if (v.charAt(1) != 7 && v.charAt(1) != 9) {
    return false;
  }
  return v.length == 10;
}

export default function Profile() {
  const { t } = useTranslation();
  const { user, roles } = useAuthStore();

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    newPassword_confirmation: "",
  });

  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const [passwordStatus, setPasswordStatus] = useState({ kind: "idle", message: "" });
  const [viewTab, setViewTab] = useState("profile");

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user?.Name ?? prev.name ?? "",
      phone: user?.Phone ?? prev.phone ?? "",
      email: user?.Email ?? prev.email ?? "",
    }));
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatus({ kind: "idle", message: "" });

    if (!profile.name.trim()) {
      setStatus({ kind: "error", message: t("Profile.Errors.NameRequired") });
      return;
    }
    if (!validatePhone(profile.phone)) {
      setStatus({ kind: "error", message: t("Profile.Errors.PhoneInvalid") });
      return;
    }

    if (!profile.email.trim()) {
      setStatus({ kind: "error", message: t("Profile.Errors.EmailRequired") });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) {
      setStatus({ kind: "error", message: t("Profile.Errors.EmailInvalid") });
      return;
    }

    const res = await apiProfileUpdate(profile);

    if (res?.success) {
      setStatus({ kind: "success", message: t("Profile.Messages.UpdateSuccess") });
    } else {
      setStatus({ kind: "error", message: t("Profile.Messages.UpdateFailed") });
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ kind: "idle", message: "" });

    const { currentPassword, newPassword, newPassword_confirmation } = passwords;
    if (!currentPassword) {
      setPasswordStatus({ kind: "error", message: t("Profile.Errors.CurrentPasswordRequired") });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ kind: "error", message: t("Profile.Errors.PasswordLength") });
      return;
    }
    if (newPassword !== newPassword_confirmation) {
      setPasswordStatus({ kind: "error", message: t("Profile.Errors.PasswordMismatch") });
      return;
    }

    const res = await apiPasswordUpdate(passwords);
    if (res?.success) {
      setPasswordStatus({ kind: "success", message: t("Profile.Messages.PasswordSuccess") });
    } else {
      setPasswordStatus({ kind: "error", message: t("Profile.Messages.PasswordFailed") });
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-955/40 border border-slate-100 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-gray-900">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <UserIcon size={18} className="text-emerald-500" />
                  {t("UserDashboard.Profile")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{t("Profile.ManageYourPersonal")}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-gray-500 mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800">
                  {t("Admin.Role")}: {Array.isArray(roles) && roles.length ? roles.join(", ") : t("Admin.Patient")}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <UserIcon size={20} />
              </div>
            </div>

            {/* Sliding Pill Tab Selector */}
            <div className="mt-6 flex p-1 bg-slate-50 dark:bg-gray-900/50 border border-slate-100 dark:border-gray-900 rounded-xl max-w-md">
              <button
                type="button"
                onClick={() => setViewTab("profile")}
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  viewTab === "profile"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-slate-200"
                }`}
              >
                {t("UserDashboard.Profile")}
              </button>
              <button
                type="button"
                onClick={() => setViewTab("password")}
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  viewTab === "password"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-slate-200"
                }`}
              >
                {t("Reset.ResetYourPassword")}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12">
                {viewTab === "profile" && (
                  <div className="rounded-2xl border border-slate-100 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/10 p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">{t("Profile.PersonalInformation")}</h3>
                    
                    {status.kind !== "idle" && (
                      <div className={[
                        "rounded-xl border p-3.5 text-xs md:text-sm flex items-center gap-2",
                        status.kind === "success" && "border-emerald-100 bg-emerald-50/50 text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/20 dark:text-emerald-400",
                        status.kind === "error" && "border-rose-100 bg-rose-50/50 text-rose-800 dark:border-rose-950/20 dark:bg-rose-950/20 dark:text-rose-400",
                      ].join(" ")}>
                        {status.kind === "success" ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                        <span>{status.message}</span>
                      </div>
                    )}

                    <form className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide">{t("Register.Name")}</label>
                        <input
                          value={profile.name}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                          className="mt-1.5 w-full rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all duration-200 text-sm"
                          placeholder={t("Profile.YourFullName")}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide">{t("Register.Phone")}</label>
                        <input
                          value={profile.phone}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                          className="mt-1.5 w-full rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all duration-200 text-sm"
                          placeholder={t("Profile.PhoneNumber")}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide">{t("headingNav.location")}</label>
                        <input
                          type="email"
                          onKeyDown={handleKeyDown}
                          value={profile.email}
                          onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                          className="mt-1.5 w-full rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all duration-200 text-sm"
                          placeholder={t("Profile.Email")}
                          required
                        />
                      </div>
                    </form>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="w-full rounded-xl bg-emerald-600 text-white py-3.5 font-bold hover:bg-emerald-700 hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.99]"
                      >
                        <Save size={16} />
                        {t("Common.Save")}
                      </button>
                    </div>
                  </div>
                )}
                
                {viewTab === "password" && (
                  <div className="rounded-2xl border border-slate-100 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/10 p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                      <Lock size={16} className="text-emerald-500" />
                      {t("Reset.ResetYourPassword")}
                    </h3>
                    
                    {passwordStatus.kind !== "idle" && (
                      <div className={[
                        "rounded-xl border p-3.5 text-xs md:text-sm flex items-center gap-2",
                        passwordStatus.kind === "success" && "border-emerald-100 bg-emerald-50/50 text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/20 dark:text-emerald-400",
                        passwordStatus.kind === "error" && "border-rose-100 bg-rose-50/50 text-rose-800 dark:border-rose-950/20 dark:bg-rose-950/20 dark:text-rose-400",
                      ].join(" ")}>
                        {passwordStatus.kind === "success" ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                        <span>{passwordStatus.message}</span>
                      </div>
                    )}
                    
                    <form className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide">{t("Profile.CurrentPassword")}</label>
                        <input
                          type="password"
                          onKeyDown={handleKeyDown}
                          value={passwords.currentPassword}
                          onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                          className="mt-1.5 w-full rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all duration-200 text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide">{t("Profile.NewPassword")}</label>
                          <input
                            type="password"
                            onKeyDown={handleKeyDown}
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                            className="mt-1.5 w-full rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all duration-200 text-sm"
                            placeholder={t("Profile.PasswordPlaceholder")}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide">{t("Profile.ConfirmPassword")}</label>
                          <input
                            type="password"
                            onKeyDown={handleKeyDown}
                            value={passwords.newPassword_confirmation}
                            onChange={(e) => setPasswords((p) => ({ ...p, newPassword_confirmation: e.target.value }))}
                            className="mt-1.5 w-full rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-100 dark:border-gray-800 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all duration-200 text-sm"
                            placeholder={t("Profile.ConfirmPlaceholder")}
                          />
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={handleSavePassword}
                          className="w-full rounded-xl bg-emerald-600 text-white py-3.5 font-bold hover:bg-emerald-700 hover:scale-[1.01] transition-all duration-200 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.99]"
                        >
                          {t("Reset.UpdatePassword")}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}