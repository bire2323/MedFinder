import { useTranslation } from "react-i18next"
export default function Loading(params) {

    const {t} = useTranslation();
    return (
        <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
             <div className="flex flex-col justify-center items-center gap-1.5">
                 <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce px-1.5"></span>
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <div> <p className="text-gray-500 animate-pulse">{t("Common.Loading")}</p></div>
       
             </div>
            </div>
    )
}