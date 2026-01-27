import React, { useState } from "react";

import { Phone } from "lucide-react";
import { FaHospitalSymbol } from "react-icons/fa";
import { apiLogin } from "../api/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwordReseting,setPasswordReseting]=useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
const rowPhone= (phone || "").trim();
      const digitsOnly = rowPhone.replace(/\D/g, "");
      if (!digitsOnly || digitsOnly.length !== 10) {
        setError(t("Login.Error Phone Invalid"));
        return;
      }
    if (!phone.trim() || !password) {
      setError(t("Login.Error Phone And Password Required"));
      return;
    }

    setLoading(true);
    try {
      const formData = { phone: phone.trim(), password };

      const res = await apiLogin(formData);

      if (res.success) {
        alert(t("Login.Login") + " " + "successful"); // optionally translate message
      navigate('/');
      } else {
        if (res.errors) {
          const firstField = Object.keys(res.errors)[0];
          const firstMessage = res.errors[firstField][0];
          setError(firstMessage); // can map to i18next key later
        } else if(res.message==='User_not_found') {
          setError(t("Login.user not found!"));
        }else if(res.message==='Invalid_credentials') {
          setError(t("Login.Invalid credentials"));
        }
      }
    } catch (err) {
      setError(err.message || t("Login.Login Failed"));
    } finally {
      setLoading(false);
    }
  }

  function openRegisterRoute() {
    navigate("/register", { state: { background: location } });
  }

  return (
   
          <div className="w-full md:w-1/2 md:p-6 lg:p-10 xl:p-24">
            <div className="flex items-center gap-3 mb-4 pb-10">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FaHospitalSymbol className="text-white text-xl" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                 {t("Registration.welcome")}
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white pb-10">
              {t("Login.Login")}
            </h2>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-200">
                  {t("Login.Phone")}
                </label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-10 py-2"
                    placeholder={t("Login.Phone Placeholder")}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-200">
                  {t("Login.Password")}
                </label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
                    placeholder={t("Login.Password Placeholder")}
                    required
                  />
                </div>
              </div>

              {error && <div className="text-[10px] text-red-500">{t(error)}</div>}
      <div className="flex justify-self-start items-center gap-3">
         <div className="text-[14px] text-gray-800 dark:text-gray-50">{t('Login.forget password')}</div>
       <div className="text-[14px] text-gray-800 dark:text-gray-50"><p onClick={()=>navigate("/login/reset-password")} className="cursor-pointer hover:underline focus:underline">{t('Login.click here')}</p></div>
      </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? t("Login.Signing In") : t("Login.Login")}
                </button>
              </div>
            </form>

            <div className="mt-3 text-center text-sm text-slate-600 dark:text-slate-300">
              <span>{t("Login.Don't Have Account")}</span>
              <button
                type="button"
                onClick={openRegisterRoute}
                className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
              >
                {t("Login.Register")}
              </button>
            </div>
          </div>
  );
}
