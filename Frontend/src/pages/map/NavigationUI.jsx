import { ArrowUp, Navigation2, Volume2, VolumeX, X } from "lucide-react";

export default function NavigationUI({ currentRoute, currentStepIndex, isMuted, toggleMute, handleStopNavigation, testSpeak }) {
    // Add safety check
    const currentStep = currentRoute?.steps?.[currentStepIndex];

    if (!currentStep) {
        return null;
    }

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-sm backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-5 flex flex-col gap-4 border border-white/20 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                        <ArrowUp size={28} />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                            {currentStep.instruction || "Arriving..."}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                                <Navigation2 size={14} fill="currentColor" />
                                <span>{(currentStep.distance || 0).toFixed(0)}m</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                Step {currentStepIndex + 1} of {currentRoute.steps.length}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleMute}
                        className={`p-2 rounded-xl transition-colors ${isMuted ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button
                        onClick={handleStopNavigation}
                        className="p-2 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                        title="Exit Navigation"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                <div
                    onClick={testSpeak}
                    className="flex-1 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group"
                    title="Click to repeat instruction"
                >
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Distance</p>
                    <p className="text-lg font-black text-gray-800 dark:text-gray-100">
                        {(currentRoute.distance / 1000).toFixed(1)} <span className="text-xs font-medium">km</span>
                    </p>
                </div>
                <div className="flex-1 bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                    <p className="text-[10px] text-blue-500 uppercase tracking-widest mb-1 font-bold">Time Left</p>
                    <p className="text-lg font-black text-blue-700 dark:text-blue-300">
                        {(currentRoute.duration / 60).toFixed(0)} <span className="text-xs font-medium text-blue-600/70">min</span>
                    </p>
                </div>
            </div>
        </div>
    );
}