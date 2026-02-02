import React, { useState } from "react";

import { apiRegister } from "../api/auth";
import { FaHospitalSymbol } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import VerifyOtp from "./verifyOtp";

export default function RegisterationForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
   const [phoneVerifingWithOTP,setPhoneVerifingWithOTP]=useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const trimmedName = (name || "").trim();
      const rawPhone = (phone || "").trim();
      const pwd = password || "";

      // Validations
      if (!trimmedName) {
        setError(t("Register.Error Name Required"));
        return;
      }
      if (trimmedName.length < 2) {
        setError(t("Register.Error Name Short"));
        return;
      }

      const digitsOnly = rawPhone.replace(/\D/g, "");
      if (!digitsOnly || digitsOnly.length !== 10) {
        setError(t("Register.Error Phone Invalid"));
        return;
      }

      if (!pwd) {
        setError(t("Register.Error Password Required"));
        return;
      }
      if (pwd.length < 8) {
        setError(t("Register.Error Password Short"));
        return;
      }
      if (pwd !== confirmPassword) {
        setError(t("Register.Password Do Not Match"));
        return;
      }

      const payload = {
        name: trimmedName,
        phone: digitsOnly,
        password: pwd,
      };

      // Await API call
      const res = await apiRegister(payload);

      if (res.success) {
       navigate("/register/verify-otp", { state: { phone: phone } });
      } if (!res.success) {
        if (res.errors) {
          const firstField = Object.keys(res.errors)[0];
          const firstMessage = res.errors[firstField][0];
         setError(t(mapBackendErrorToTranslation(firstMessage)));
        } else {
          setError(res.message || t("Register.Registration Failed"));
        }
      }
    }catch (err) {
      setError(err.message || t("Register.Registration Failed"));
    } finally {
      setLoading(false);
    }
  }
function mapBackendErrorToTranslation(errorKey) {
  const mapping = {
    phone_required: "Register.Error Phone Required",
    phone_taken: "Register.Error Phone Taken",
    name_required: "Register.Error Name Required",
    name_min_4: "Register.Error Name Min 4"
  };
  return mapping[errorKey] || errorKey; // fallback
}
  function openLoginRoute() {
    navigate("/login", { state: { background: location } });
  }


  return (
    
         
            <div className="w-full h-fit md:w-1/2 py-16 md:px-4 lg:px-16">
            <div className="flex items-center gap-3 mb-4 pb-10">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FaHospitalSymbol className="text-white text-xl" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("Register.Wellcome")}
                </span>
              </div>
            </div>

            <h2 className="text-2xl pb-8 font-bold mb-2 text-slate-900 dark:text-white">
              {t("Register.Register")}
            </h2>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-200">
                  {t("Register.Name")}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-10 py-2"
                  placeholder={t("Register.Name Placeholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-200">
                  {t("Register.Phone")}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2"
                  placeholder={t("Register.Phone Placeholder")}
                  required
                  maxLength="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-200">
                  {t("Register.Password")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2"
                  placeholder={t("Register.Password Placeholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-200">
                  {t("Register.Confirm Password")}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2"
                  placeholder={t("Register.Confirm Password Placeholder")}
                  required
                />
              </div>

              {error && <p className="text-[10px] text-red-500">{t(error)}</p>}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? t("Register.Registering") : t("Register.Register")}
                </button>
              </div>
            </form>

            <div className="mt-3 text-center text-sm text-slate-600 dark:text-slate-300">
              <span>{t("Register.Already Have Account")}</span>
              <button
                type="button"
                onClick={openLoginRoute}
                className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
              >
                {t("Register.Login")}
              </button>
            </div>
          </div>
    
  );
}
