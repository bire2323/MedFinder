import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Modal from "../../component/Modal";

export default function RegisterRoute() {
  const navigate = useNavigate();
  const location = useLocation();

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
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-pink-500"
                >
                  <rect
                    x="2"
                    y="7"
                    width="14"
                    height="10"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="rgba(236,72,153,0.08)"
                  />
                  <path
                    d="M16 8l5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 13l5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        </div>
    </Modal>
  );
}

