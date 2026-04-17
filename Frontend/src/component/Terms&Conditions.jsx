import React from "react";
import { useTranslation } from "react-i18next";

const TermsConditions = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 md:px-10 lg:px-20">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg dark:shadow-md rounded-2xl p-6 md:p-10">
        
        <h1 className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-6 text-center">
          {t("terms.title")}
        </h1>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
          
          <p>{t("terms.introduction")}</p>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {t("terms.acceptance.title")}
            </h2>
            <p>{t("terms.acceptance.content")}</p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {t("terms.use.title")}
            </h2>
            <p>{t("terms.use.content")}</p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {t("terms.accounts.title")}
            </h2>
            <p>{t("terms.accounts.content")}</p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {t("terms.data.title")}
            </h2>
            <p>{t("terms.data.content")}</p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {t("terms.chatbot.title")}
            </h2>
            <p>{t("terms.chatbot.content")}</p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {t("terms.inventory.title")}
            </h2>
            <p>{t("terms.inventory.content")}</p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {t("terms.liability.title")}
            </h2>
            <p>{t("terms.liability.content")}</p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {t("terms.security.title")}
            </h2>
            <p>{t("terms.security.content")}</p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {t("terms.termination.title")}
            </h2>
            <p>{t("terms.termination.content")}</p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {t("terms.changes.title")}
            </h2>
            <p>{t("terms.changes.content")}</p>
          </section>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            {t("terms.footer")}
          </p>

        </div>
      </div>
    </div>
  );
};

export default TermsConditions;