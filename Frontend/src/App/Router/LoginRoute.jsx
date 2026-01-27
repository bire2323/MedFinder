import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

import Modal from "../../component/Modal";

export default function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();

  
  return (
    <>
   
      <Modal isOpen={true} onClose={() => navigate(-1)}>
           <div className="relative">
             <button
               onClick={() => {
                 navigate("/");
               }}
               className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
             >
               ✕
             </button>
     
             <div className="flex flex-col md:flex-row md:min-h-[360px]">
              <Outlet/>
            <div className="hidden md:flex w-1/2 items-stretch">
            <div className="flex-1 flex items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900 dark:to-gray-800 p-6">
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-indigo-500"
                >
                  <rect x="2" y="7" width="14" height="10" rx="5" stroke="currentColor" strokeWidth="1.5" fill="rgba(99,102,241,0.08)" />
                  <path d="M16 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 13l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
    </>
  );
}
