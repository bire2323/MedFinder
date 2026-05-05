// AlertModal.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const AlertModal = ({ onClose }) => {

    const { t } = useTranslation();



    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/35 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6 text-center">
                {/* Alert Icon */}
                <div className="flex justify-center mb-4">
                    <svg
                        className="w-12 h-12 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01M12 5a7 7 0 100 14a7 7 0 000-14z"
                        />
                    </svg>
                </div>

                {/* Message */}
                <p className="text-lg font-semibold text-gray-800 mb-6">
                    {t("headingNav.profile_dropdown.inactive")}
                </p>

                {/* Back Button */}
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                    >
                        {t("Common.Back")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
