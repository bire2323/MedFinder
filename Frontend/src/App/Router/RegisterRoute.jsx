import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Modal from "../../component/Modal";
import { useTranslation } from "react-i18next";
import am_white from "../../assets/am_white.png";
import en_white from "../../assets/en_white.png";
import am_black from "../../assets/am_black.png";
import en_black from "../../assets/en_black.png";

export default function RegisterRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const {t} = useTranslation();
  const isAmharic = localStorage.getItem("i18nextLng") === "am";
  const handleClose = () => {
    if (location.pathname.startsWith("/register")) {
      navigate("/"); // go back to home when modal closes
    }
  };

  return (
    <Modal isOpen={true} onClose={handleClose}>
       <div className="relative">
        <button
          onClick={() => {
           
            navigate('/');
          }}
          className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
        >
          ✕
        </button>

    <div className="flex flex-col md:flex-row md:min-h-[420px] m-0">
     
      <Outlet /> {/* Nested routes render here */}
     
       <div className="hidden md:flex w-1/2 items-stretch">
            <div className="flex-1 flex items-center justify-center h-full bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-gray-800 p-6">
              <div className="w-full h-full flex items-center justify-center">
                <img src={isAmharic ? am_white : en_white} alt={t("Register.Welcome")} className="object-contain" />
              </div>
            </div>
          </div>
        </div>
        </div>
    </Modal>
  );
}

