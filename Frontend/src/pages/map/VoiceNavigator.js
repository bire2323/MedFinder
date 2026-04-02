/**
 * VoiceNavigator.js
 * A production-ready vanilla JavaScript module for location-based voice navigation.
 */

export class VoiceNavigator {
    constructor(options = {}) {
        this.currentSteps = [];
        this.currentStepIndex = -1;
        this.isMuted = false;
        this.proximityThreshold = options.proximityThreshold || 50; // meters
        this.nowThreshold = options.nowThreshold || 15; // meters
        this.isSupported = 'speechSynthesis' in window;
        
        // Track if we've already announced the upcoming turn
        this._lastSpokenStepIndex = -1;
        this._lastAnnouncedDistance = null;

        // Voice configuration
        this.config = {
            rate: options.rate || 0.9,
            pitch: options.pitch || 1.0,
            lang: options.lang || 'en-US'
        };
    }
    
    /**
     * Start a new navigation session
     * @param {Array} steps - Enhanced route steps with fullInstruction property
     */
    start(steps) {
        if (!this.isSupported) {
            console.error("Voice Navigator: Web Speech API not supported.");
            return;
        }
        
        if (!steps || steps.length === 0) {
            console.error("Voice Navigator: No steps provided.");
            return;
        }
        
        this.currentSteps = steps;
        this.currentStepIndex = 0;
        this._lastSpokenStepIndex = -1;
        this._lastAnnouncedDistance = null;

        // Announce the first instruction
        const firstStep = steps[0];
        if (firstStep) {
            this.speak(firstStep, 'start');
        }
    }

    /**
     * Update the user's current location and trigger voice cues if necessary
     * @param {number} lat 
     * @param {number} lng 
     */
    update(lat, lng) {
        // Check if navigation is active
        if (this.currentStepIndex < 0 || this.currentStepIndex >= this.currentSteps.length) {
            return;
        }

        // Check if we've reached the end
        if (this.currentStepIndex === this.currentSteps.length - 1) {
            // Already at last step (arrive)
            if (this.currentSteps[this.currentStepIndex]?.type === 'arrive') {
                this.speak(this.currentSteps[this.currentStepIndex], 'now');
                this.currentStepIndex++; // Mark as completed
            }
            return;
        }

        const currentStep = this.currentSteps[this.currentStepIndex];
        const nextStep = this.currentSteps[this.currentStepIndex + 1];

        // Skip if no next step (shouldn't happen)
        if (!nextStep) return;

        // Calculate distance to the next maneuver
        const distanceToTurn = (nextStep.lat && nextStep.lng)
            ? this.calculateDistance(lat, lng, nextStep.lat, nextStep.lng)
            : Infinity;

        // Special handling for arrival
        if (nextStep.type === 'arrive') {
            if (distanceToTurn <= this.nowThreshold && this._lastSpokenStepIndex !== this.currentStepIndex) {
                this.speak(nextStep, 'now');
                this._lastSpokenStepIndex = this.currentStepIndex;
            }
            return;
        }

        // Proximity trigger (prepare user for upcoming maneuver)
        if (distanceToTurn <= this.proximityThreshold && distanceToTurn > this.nowThreshold) {
            // Check if we haven't already announced this step
            if (this._lastSpokenStepIndex !== this.currentStepIndex) {
                // Only announce if distance has changed significantly (avoid repeated announcements)
                if (!this._lastAnnouncedDistance || 
                    Math.abs(this._lastAnnouncedDistance - distanceToTurn) > 10) {
                    this.speak(nextStep, 'near', distanceToTurn);
                    this._lastSpokenStepIndex = this.currentStepIndex;
                    this._lastAnnouncedDistance = distanceToTurn;
                }
            }
        }

        // Now trigger (immediate action required)
        if (distanceToTurn <= this.nowThreshold) {
            // Move to next step only if we haven't already
            if (this._lastSpokenStepIndex !== this.currentStepIndex + 1) {
                this.speak(nextStep, 'now');
                this.currentStepIndex++;
                this._lastSpokenStepIndex = this.currentStepIndex;
                this._lastAnnouncedDistance = null;
            }
        }
    }

    /**
     * Convert step to spoken instruction
     * @param {Object} step - Enhanced step with fullInstruction property
     * @param {string} type - 'start', 'near', 'now'
     * @param {number} distance - Distance to turn (optional)
     */
    speak(step, type = 'near', distance = null) {
        if (this.isMuted || !this.isSupported) return;

        // Use enhanced instruction if available
        let instruction = step.fullInstruction || step.instruction;
        
        // If no instruction available, generate a fallback
        if (!instruction || instruction === "") {
            instruction = this._generateFallbackInstruction(step, type, distance);
        }
console.log("instr", instruction);
        // Check if instruction contains Amharic characters
        const isAmharic = /[\u1200-\u137F]/.test(instruction);
        console.log("isAmharic", isAmharic);
        let message = "";
        
        switch (type) {
            case 'start':
                message = isAmharic 
                    ? `ጉዞ ተጀምሯል። ${instruction}`
                    : `Navigation started. ${instruction}`;
                break;
                
            case 'near':
                // If distance is provided, use it; otherwise use proximityThreshold
                const announceDistance = distance !== null ? Math.round(distance) : Math.round(this.proximityThreshold);
                message = isAmharic
                    ? `${announceDistance} ሜትር ውስጥ፣ ${instruction}`
                    : `In ${announceDistance} meters, ${instruction}`;
                break;
                
            case 'now':
                message = isAmharic 
                    ? `${instruction} አሁን።`
                    : `${instruction} now.`;
                break;
                
            default:
                message = instruction;
        }

        // Execute speech
        this._executeSpeech(message, isAmharic ? 'am-ET' : this.config.lang);
    }

    /**
     * Generate a fallback instruction if none exists
     * @private
     */
    _generateFallbackInstruction(step, type, distance) {
         const isAmharic = localStorage.getItem("i18nextLng") === "am";
         console.log(isAmharic);
        if (step.type === 'depart') {
            return `${isAmharic ? "ጉዞ ተጀምሯል።" : 'Start your journey'}`;
        }
        
        if (step.type === 'arrive') {
            return `${isAmharic ? "ጉዞ ተጠናቀቁ።" : 'You have arrived at your destination'}`;
        }
        
        if (step.type === 'turn') {
            const direction = step.turnDirection || "straight";
            const distanceText = distance ? `${Math.round(distance)} meters` : "";
            
            if (type === 'now') {
                return `${direction.charAt(0).toUpperCase() + direction.slice(1)} now`;
            }
            
            return `Turn ${direction}`;
        }
        
        if (step.type === 'end of road') {
            const direction = step.turnDirection || "left or right";
            return `${isAmharic ? "መንገዱን አጠናቀቁ።" : 'At the end of the road, turn ${direction}'}`;
        }
        
        if (step.distance) {
            return `${isAmharic ? "በ ${Math.round(step.distance)} ሜትሮች ወደ ፊት ይጓዙ" : 'Continue for ${Math.round(step.distance)} meters'}`;
        }
        
        return `${isAmharic ? "ወደ ፊት" : 'Continue straight'}`;
    }

    /**
     * Execute speech synthesis
     * @private
     */
    _executeSpeech(text, lang) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.config.rate;
        utterance.pitch = this.config.pitch;
        utterance.lang = lang || this.config.lang;

        // Try to find a natural voice if possible
        const voices = speechSynthesis.getVoices();
        
        // Priority: Google voices > Premium voices > Native voices
        const preferred = voices.find(v => 
            v.lang === utterance.lang && 
            (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural'))
        ) || voices.find(v => v.lang === utterance.lang);
        
        if (preferred) utterance.voice = preferred;

        // Add error handling
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
        };

        speechSynthesis.speak(utterance);
    }

    /**
     * Calculate distance between two coordinates in meters
     * @private
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in meters
    }

    /**
     * Stop navigation and cancel speech
     */
    stop() {
        this.currentSteps = [];
        this.currentStepIndex = -1;
        this._lastSpokenStepIndex = -1;
        this._lastAnnouncedDistance = null;
        speechSynthesis.cancel();
    }

    /**
     * Toggle mute state
     * @returns {boolean} New mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        // If unmuting, don't automatically speak - wait for next trigger
        if (!this.isMuted) {
            console.log("Voice navigation unmuted");
        } else {
            // Cancel any ongoing speech when muting
            speechSynthesis.cancel();
        }
        
        return this.isMuted;
    }

    /**
     * Get current mute state
     * @returns {boolean}
     */
    getMuteState() {
        return this.isMuted;
    }

    /**
     * Manually announce current instruction (useful for repeat button)
     */
    repeatCurrentInstruction() {
        if (this.currentStepIndex >= 0 && this.currentStepIndex < this.currentSteps.length) {
            const currentStep = this.currentSteps[this.currentStepIndex];
            if (currentStep) {
                this.speak(currentStep, 'repeat');
            }
        }
    }
}