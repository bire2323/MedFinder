import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiForgotPassword } from "../api/auth";
import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResettingPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const rawPhone = (phone || "").trim();
    const digitsOnly = rawPhone.replace(/\D/g, "");

    if (!digitsOnly || digitsOnly.length !== 10) {
      setError(t("Resetting.ErrorPhoneInvalid"));
      return;
    }

    setLoading(true);

    apiForgotPassword({ phone }).then((res) => {
      setLoading(false);

      if (res.success) {
        navigate("/login/reset-password/verify-otp", {
          state: { phone: phone, issue: "resetting" },
        });
      } else if (res.message === "User_not_found") {
        setError(t("Resetting.UserNotFound") || "Not registered!");
      } else {
        setError(t("Resetting.SendOtpFailed") || "Failed to send OTP!");
      }
    });
  };

  return (
    <div className="space-x-2 space-y-2 md:w-1/2 p-5">
      <div className="flex flex-col p-3">
        <h1 className="p-5 lg:pb-10 m-auto">{t("Resetting.InterPhone")}</h1>

        <form onSubmit={handleSubmit} className="m-auto">
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-200">
            {t("Resetting.Phone")}
          </label>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center md:gap-2">
            <div className="relative flex items-center justify-center">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-10 py-2"
                placeholder={t("Resetting.PhonePlaceholder")}
                required
              />
            </div>

            {error && <p className="text-[10px] text-red-500">{error}</p>}

            <div className="flex justify-end py-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? t("Resetting.SendingOtp") : t("Resetting.SendOtp")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
