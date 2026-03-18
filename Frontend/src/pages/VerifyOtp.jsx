import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { apiOtpVerify, apiOtpResend, apiUserResetPasswordVerifyOtp } from "../api/auth"; // ← assume you have resend API
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/UserAuthStore";


export default function VerifyOtp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();


  const phone = location.state?.phone;
  const issue = location.state?.issue;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [count, setCount] = useState(1);
  const [canResend, setCanResend] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const { setSession } = useAuthStore();
  console.log("session", setSession);

  const timerRef = useRef(null);

  // Redirect if no phone
  if (!phone) {
    navigate("/register");
    return null;
  }

  // Countdown timer
  useEffect(() => {
    // Start countdown only once when component mounts
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []); // ← empty dependency → runs once
  useEffect(() => {
    setCountdown(60 * count);
  }, [count])
  // Handle OTP input change + auto focus
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Handle paste (optional improvement)
  const handlePaste = (e, index) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{1,4}$/.test(pasted)) {
      const digits = pasted.split("").slice(0, 4);
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 4) newOtp[index + i] = d;
      });
      setOtp(newOtp);

      // Focus last filled or last input
      const nextFocus = Math.min(index + digits.length, 3);
      document.getElementById(`otp-${nextFocus}`)?.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const isblocked = localStorage.getItem("blockedphone");
    if ((isblocked === phone)) {
      localStorage.removeItem("blockedphone");
      setDisableButton(true);
      setError(t("VerifyOtp.TooManyAttempts") || "Too many attempts. Try again Later.")
    }
    const otpCode = otp.join("").trim();
    if (otpCode.length !== 4) {
      setError(t("Register.OtpIncomplete") || "Please enter 4 digits");
      return;
    }

    setLoading(true);

    try {
      if (issue === "resetting") {
        const res = await apiUserResetPasswordVerifyOtp({ phone, otp: otpCode });
        if (res.success) {
          const { token, phone } = res;

          navigate(
            `/login/reset-password/get-otp-resetting?token=${encodeURIComponent(token)}&phone=${encodeURIComponent(phone)}`
          );

        } else if (res.message === "OTP expired") {
          setError(t("VerifyOtp.ExpiredOtp") || "expired OTP");
        } else if (res.message === "Too many attempts") {

          localStorage.setItem("blockedphone", phone)
          setDisableButton(true);
        } else if (res.message === "Invalid OTP") {
          setError(t("VerifyOtp.ErrorOtpInvalid") || "Invalid OTP");
        }

      }
      else {

        const res = await apiOtpVerify({ phone, otp: otpCode });
      //  console.log(res.success);
        if (res.success) {
          setSession(res.user, res.roles);

          console.log(res.user);
          if(res.roles?.includes("pharmacyAgent")){
            navigate("/pharmacy-agent/dashboard");
          }else if (res.roles?.includes("hospitalAgent")) {
            navigate("/hospital-agent/dashboard");
          }else if (res.roles?.includes("admin")) {
            navigate("/admin/dashboard");
          }else{
          navigate("/");
          }
        } else if (res.message === "OTP expired") {
          console.log(res.message);
          setError(t("VerifyOtp.ExpiredOtp") || "expired OTP");
          setCanResend(true);
        } else if (res.message === "Too many attempts") {
          console.log(res.message);
          localStorage.setItem("blockedphone", phone);
          setDisableButton(true);
        } else if (res.message === "Invalid OTP") {
          setError(t("VerifyOtp.ErrorOtpInvalid") || "Invalid OTP");
        }
      }
    } catch (err) {
      setError(t("VerifyOtp.ErrorOtpInvalid") || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;

    setError("");
    setCanResend(false);


    try {
      // Call your resend API (you need to implement this endpoint)
      const res = await apiOtpResend({ phone });
      if (res.success) {
        // Optional: show toast/message "OTP resent"
        localStorage.removeItem("blockedphone");
        setCanResend(false);
        setCount((prev) => prev + 1);
        setDisableButton(false);
      }
      else if (res.message === "Please wait 1 minute before requesting new OTP") {
        setCanResend(true);
        setError(t("VerifyOtp.ResendWait") || "Wait before requesting new OTP!");
      }
      else if (res.message === "phone_required") {
        setError(t("VerifyOtp.PhoneRequired"));
      } else if (res.message === "no_pending_registration_found") {
        setError(t("VerifyOtp.NoPendingRegistration"));
        navigate("/register");
      }
    } catch (err) {
      setError(t("VerifyOtp.ResendFailed"));
    }

    // Restart timer
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="w-full md:w-1/2 py-10 md:px-4 mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        {t("VerifyOtp.Title") || "Verify OTP"}
      </h1>

      <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
        {t("VerifyOtp.EnterOtpSentTo") || "Enter the OTP sent to"}{" "}
        <span className="font-medium">{phone}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 sm:gap-4">
          {otp.map((value, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              onPaste={(e) => handlePaste(e, index)}
              className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || otp.join("").length !== 4 || disableButton}
          className="w-full max-w-xs mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 
            <>
            <div className="flex gap-1  justify-center items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>{ t("VerifyOtp.Verifying")}</span>
             </div>
             </>
            : t("VerifyOtp.VerifyOtp") || "Verify OTP"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-center text-red-600 dark:text-red-400 text-sm">
          {error}
        </p>
      )}

      {/* Resend section */}
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {countdown > 0 ? (
          <p>
            {t("VerifyOtp.ResendIn") || "Resend OTP in"}{" "}
            <span className="font-medium">{countdown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("VerifyOtp.ResendOtp") || "Resend OTP"}
          </button>
        )}
      </div>
    </div>
  );
}