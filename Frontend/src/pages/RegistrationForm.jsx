import React, { useState } from "react";

import { apiRegister } from "../api/auth";
import { FaHospitalSymbol } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
//import VerifyOtp from "./verifyOtp";
import handleKeyDown from "../hooks/handleKeyDown";
import { FcGoogle } from "react-icons/fc";

import am_white from "../assets/am_white.png";
import en_white from "../assets/en_white.png";
import am_black from "../assets/am_black.png";
import en_black from "../assets/en_black.png";
import en_logo from "../assets/en_logo.png";
import am_logo from "../assets/አም_logo.png";
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
  const [phoneVerifingWithOTP, setPhoneVerifingWithOTP] = useState(false);

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
    } catch (err) {
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


  const isAmharic = localStorage.getItem("i18nextLng") === "am";
  return (


    <div className="w-full h-fit md:w-1/2 py-10 md:px-4 lg:px-16 overflow-y-auto max-h-[80vh]">

      <h2 className="text-2xl  font-bold mb-2 text-slate-900 dark:text-white">
        {t("Register.Register")}
      </h2>
      <div className="w-12 h-1 mb-8 bg-emerald-500 rounded-full mt-2" />


      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-200">
            {t("Register.Name")}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full rounded-md border-gray-200 dark:text-white dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-10 py-2"
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
            onKeyDown={handleKeyDown}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-200 dark:text-white dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2"
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
            onKeyDown={handleKeyDown}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-200 dark:text-white dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2"
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
            onKeyDown={handleKeyDown}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-200 dark:text-white dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2"
            placeholder={t("Register.Confirm Password Placeholder")}
            required
          />
        </div>

        {error && <p className="text-[10px] text-red-500">{t(error)}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-800 hover:bg-green-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ?
              <>
                <div className="flex gap-1">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t("Register.Registering")} </span>
                </div>
              </> : t("Register.Register")}
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
      <div
        className="flex justify-center items-center text-sm gap-1.5 border p-2 mb-2 hover:bg-gray-50 hover:shadow-2xs transform dark:text-white
                dark:hover:bg-gray-400 transition-all duration-500 shadow-black rounded-2xl cursor-pointer"
        onClick={() =>
        (window.location.href =
          "https://medfinder.com/api/auth/google/redirect")
        }
      >
        <FcGoogle className="w-6 h-6" />
        <p className="dark:hover:text-white select-none">
          {t("Login.sign_up_with_google")}
        </p>
      </div>
    </div>

  );
}
