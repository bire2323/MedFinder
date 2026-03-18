import React, { useEffect, useMemo, useState } from "react";
import { Camera, Lock, Save, User as UserIcon } from "lucide-react";
import useAuthStore from "../../../store/UserAuthStore";

function validatePhone(phone) {
  const v = String(phone ?? "").trim();
  if (!v) return false;
  return v.length >= 6;
}

export default function Profile() {
  const { user, roles } = useAuthStore();

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  const [status, setStatus] = useState({ kind: "idle", message: "" }); // idle | success | error | warning

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user?.Name ?? prev.name ?? "",
      phone: user?.Phone ?? prev.phone ?? "",
    }));
  }, [user]);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const photoLabel = useMemo(() => {
    if (!profilePhotoFile) return "Upload profile picture";
    return `Selected: ${profilePhotoFile.name}`;
  }, [profilePhotoFile]);

  const handleSaveProfile = () => {
    setStatus({ kind: "idle", message: "" });

    if (!profile.name.trim()) {
      setStatus({ kind: "error", message: "Name is required." });
      return;
    }
    if (!validatePhone(profile.phone)) {
      setStatus({ kind: "error", message: "Phone number looks invalid." });
      return;
    }

    // Backend note:
    // Current Laravel backend user model only includes Name, Phone, Password.
    // This UI is ready for Address + photo endpoints; until then we keep it client-side.
    setStatus({ kind: "success", message: "Profile updated locally. Connect backend endpoints to persist changes." });
  };

  const handleSavePassword = () => {
    setStatus({ kind: "idle", message: "" });

    const { currentPassword, newPassword, confirmNewPassword } = passwords;
    if (!currentPassword) {
      setStatus({ kind: "error", message: "Current password is required." });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ kind: "error", message: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setStatus({ kind: "error", message: "Passwords do not match." });
      return;
    }

    // Backend note:
    // Reset password flow in this repo uses OTP endpoints; this button is a UI placeholder.
    setStatus({ kind: "warning", message: "Password change UI is ready, but OTP-based backend flow isn’t wired here yet." });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800/40 border border-slate-200 dark:border-gray-700 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold">Profile</h2>
            <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Manage your personal info and security settings.</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
              Role(s): {Array.isArray(roles) && roles.length ? roles.join(", ") : "patient"}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-700 dark:text-blue-300 flex items-center justify-center">
            <UserIcon size={22} />
          </div>
        </div>

        {status.kind !== "idle" && (
          <div
            className={[
              "mt-4 rounded-xl border p-3 text-sm",
              status.kind === "success" && "border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200",
              status.kind === "error" && "border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-200",
              status.kind === "warning" && "border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200",
            ].join(" ")}
          >
            {status.message}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-3xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 overflow-hidden flex items-center justify-center">
                  {profilePhotoPreview ? (
                    <img src={profilePhotoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={22} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold truncate">Profile Photo</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300 mt-1 truncate">{photoLabel}</p>
                </div>
              </div>

              <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 cursor-pointer">
                <Camera size={16} />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (!file) return;
                    if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
                    setProfilePhotoFile(file);
                    setProfilePhotoPreview(URL.createObjectURL(file));
                  }}
                />
              </label>

              <p className="text-xs text-slate-500 dark:text-gray-400 mt-3">
                Connect backend upload endpoint to persist this photo.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/30 p-4">
              <h3 className="font-extrabold">Personal Information</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">Name</label>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">Phone</label>
                  <input
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">Address</label>
                  <input
                    value={profile.address}
                    onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bole Road, Mega Building"
                  />
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
                    Address field is UI-ready; current backend user table doesn’t store address.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex-1 rounded-xl bg-blue-600 text-white py-3 font-extrabold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Profile
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/30 p-4 mt-4">
              <h3 className="font-extrabold flex items-center gap-2">
                <Lock size={18} />
                Change Password
              </h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">Current password</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">New password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-600 dark:text-gray-300">Confirm</label>
                  <input
                    type="password"
                    value={passwords.confirmNewPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirmNewPassword: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleSavePassword}
                  className="w-full rounded-xl bg-slate-900 dark:bg-blue-600 text-white py-3 font-extrabold hover:opacity-90 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

