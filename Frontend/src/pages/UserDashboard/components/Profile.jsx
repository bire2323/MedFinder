import { Camera, Lock, Save, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../../store/UserAuthStore";
import { useState, useEffect, useMemo } from "react";
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

  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const [passwordStatus, setPasswordStatus] = useState({ kind: "idle", message: "" });

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user?.Name ?? prev.name ?? "",
      phone: user?.Phone ?? prev.phone ?? "",
      email: user?.Email ?? prev.email ?? "",
    }));
  }, [user]);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
    };
  }, [profilePhotoPreview]);

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
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800/40 border border-slate-200 dark:border-gray-700 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold">{t("UserDashboard.Profile")}</h2>
            <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{t("Profile.ManageYourPersonal")}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
              {t("Admin.Role")}: {Array.isArray(roles) && roles.length ? roles.join(", ") : t("Admin.Patient")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-700 dark:text-blue-300 flex items-center justify-center">
            <UserIcon size={22} />
          </div>
        </div>

        {status.kind !== "idle" && (
          <div className={[
            "mt-4 rounded-xl border p-3 text-sm",
            status.kind === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
            status.kind === "error" && "border-rose-200 bg-rose-50 text-rose-800",
            status.kind === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
          ].join(" ")}>
            {status.message}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-9">
            <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/30 p-4">
              <h3 className="font-extrabold">{t("Profile.PersonalInformation")}</h3>
              <div className="mt-4 space-y-3">
                <form>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">{t("Register.Name")}</label>
                    <input
                      value={profile.name}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("Profile.YourFullName")}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">{t("Register.Phone")}</label>
                    <input
                      value={profile.phone}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("Profile.PhoneNumber")}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">{t("headingNav.location")}</label>
                    <input
                      type="email"
                      onKeyDown={handleKeyDown}
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("Profile.Email")}
                      required
                    />
                  </div>
                </form>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex-1 rounded-xl bg-blue-600 text-white py-3 font-extrabold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {t("Common.Save")}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/30 p-4 mt-4">
              <h3 className="font-extrabold flex items-center gap-2">
                <Lock size={18} />
                {t("Reset.ResetYourPassword")}
              </h3>
              {passwordStatus.kind !== "idle" && (
                <div className={[
                  "mt-4 rounded-xl border p-3 text-sm",
                  passwordStatus.kind === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
                  passwordStatus.kind === "error" && "border-rose-200 bg-rose-50 text-rose-800",
                ].join(" ")}>
                  {passwordStatus.message}
                </div>
              )}
              <form>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">{t("Profile.CurrentPassword")}</label>
                    <input
                      type="password"
                      onKeyDown={handleKeyDown}
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                      className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">{t("Profile.NewPassword")}</label>
                    <input
                      type="password"
                      onKeyDown={handleKeyDown}
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                      className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("Profile.PasswordPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">{t("Profile.ConfirmPassword")}</label>
                    <input
                      type="password"
                      onKeyDown={handleKeyDown}
                      value={passwords.newPassword_confirmation}
                      onChange={(e) => setPasswords((p) => ({ ...p, newPassword_confirmation: e.target.value }))}
                      className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("Profile.ConfirmPlaceholder")}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleSavePassword}
                    className="w-full rounded-xl bg-slate-900 dark:bg-blue-600 text-white py-3 font-extrabold hover:opacity-90 transition-colors"
                  >
                    {t("Reset.UpdatePassword")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}