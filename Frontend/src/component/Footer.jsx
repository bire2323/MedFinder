import React from "react";
import { useTranslation } from "react-i18next";
import { FaHospital } from "react-icons/fa";

export default function Footer() {

    const { t } = useTranslation();
    return (
        <footer className="bg-slat-50 dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <FaHospital className="text-white text-xl" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">Med<span className="text-blue-500">Fi</span>nder</span>
                    </div>
                    <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">{t("footer.tagline")}</p>
                </div>

                <div>
                    <h4 className="font-bold dark:text-white mb-6">{t("footer.columns.platform")}</h4>
                    <ul className="space-y-4 text-sm text-slate-500 dark:text-gray-400">
                        <li><a href="#" className="hover:text-blue-600">{t("footer.links.find_hospital")}</a></li>
                        <li><a href="#" className="hover:text-blue-600">{t("footer.links.find_pharmacy")}</a></li>
                        <li><a href="#" className="hover:text-blue-600">{t("footer.links.ai_chatbot")}</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold dark:text-white mb-6">{t("footer.columns.support")}</h4>
                    <ul className="space-y-4 text-sm text-slate-500 dark:text-gray-400">
                        <li><a href="#" className="hover:text-blue-600">{t("footer.links.help_center")}</a></li>
                        <li><a href="#" className="hover:text-blue-600">{t("footer.links.privacy")}</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold dark:text-white mb-6">{t("footer.columns.feedback")}</h4>
                    <div className="flex flex-col gap-y-2">
                        <form>
                            <div className="flex flex-col gap-y-2">
                                <input type="email" placeholder={t("footer.email_placeholder")} className="bg-slate-100 dark:bg-gray-800 px-4 py-2 rounded-lg outline-none w-full dark:text-white" required />
                                <input type="text" placeholder={t("footer.feedback_placeholder")} className="bg-slate-100 dark:bg-gray-800 px-4 py-2 rounded-lg outline-none w-full dark:text-white" required />
                            </div>
                            <div className="flex justify-end">
                                <button className="bg-blue-600 text-white px-4 py-2 w-fit rounded-lg font-bold">{t("footer.feedback_submit_btn")}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="text-center text-slate-400 dark:text-gray-600 text-xs border-t border-slate-50 dark:border-gray-800 pt-8">
                © {new Date().getFullYear()} MedFinder AI. {t("footer.rights")}
            </div>
        </footer>
    );
}