import { useTranslation } from "react-i18next";

import { useEffect, useState } from "react";
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isActive, setIsActive] = useState("");
  useEffect(() => {
    setIsActive(localStorage.getItem("active"));
  }, []);
  return (
    <>
      {/* <div className="hidden md:flex p-0.5 bg-gray-200 dark:bg-gray-400 rounded-sm border gap-x-0.5 w-20">
        <div
          className={`${
            isActive === "en" ? "border font-bold" : "border-none"
          } p-0.5  cursor-pointer`}
          onClick={() => {
            i18n.changeLanguage("en");
            setIsActive("en");
            localStorage.setItem("active", "en");
          }}
        >
          <img src={lang_en} alt="EN" className="w-9 h-6" />
        </div>
        <div
          className={`${
            isActive === "am" ? "border font-bold" : "border-none"
          } p-0.5  cursor-pointer`}
          onClick={() => {
            i18n.changeLanguage("am");
            setIsActive("am");
            localStorage.setItem("active", "am");
          }}
        >
          <img src={lang_am} alt="አማ" className="w-9 h-6" />
        </div>
      </div> */}
      <div className="flex  items-center gap-2">
        <select
          className="border border-gray-100 focus:ring-0 rounded bg-gray-50 dark:bg-gray-400 px-2 py-1"
          value={i18n.language}
          onChange={(e) => {
            i18n.changeLanguage(e.target.value);
            setIsActive(e.target.value);
          }}
        >
          <option
            value="en"
            className="text-[10px] bg-gray-50 dark:bg-gray-400 md:text-sm"
          >
            En
          </option>
          <option
            value="am"
            className="text-[10px] bg-gray-50 dark:bg-gray-400 md:text-sm"
          >
            አማ
          </option>
        </select>
      </div>
    </>
  );
}
