import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiResetPassword } from "../api/auth";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/UserAuthStore";


export default function ResetForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuthStore();

  const [searchParams] = useSearchParams();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setError(t("Reset.PasswordMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("Reset.PasswordNotMatch"));
      return;
    }

    setError("");

    const phone = searchParams.get("phone");
    const token = searchParams.get("token");

    apiResetPassword({ phone: phone, token: token, new_password: password }).then((res) => {
      if (res.success) {
        login(res.user, res.token, res.roles);
        if (res.roles?.includes('pharmacyAgent')) {
          navigate('/pharmacy-agent/dashboard');

        } else if (res.roles?.includes('hospitalAgent')) {
          navigate('/hospital-agent/dashboard');

        }
        else if (res.roles?.includes('admin')) {
          navigate('/admin/dashboard');

        } else {
          navigate('/');

        }
      } else {
        setError(t("Reset.password_reset_failed") || "Password reset failed!");
      }
    })
    console.log("Password reset:", password);
  };

  return (
    <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        {t("Reset.ResetYourPassword")}
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {t("Reset.EnterNewPassword")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("Reset.NewPassword")}
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("Reset.ConfirmPassword")}
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        {/* Show Password */}
        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="showPassword" className="text-gray-600 dark:text-gray-400">
            {t("Reset.ShowPassword")}
          </label>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition"
        >
          {t("Reset.UpdatePassword")}
        </button>
      </form>
    </div>
  );
}
