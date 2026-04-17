// utils/routeInstructions.js

export function enhanceRouteSteps(route) {
  if (!route || !route.steps) return route;
  const isAmharic = localStorage.getItem("i18nextLng") === "am";

  const enhancedSteps = route.steps.map((step, index) => {
    // Handle depart step
    if (step.type === 'depart') {
      return {
        ...step,
        instruction: isAmharic ? "የ ካርታውን አቅጣጫ ይከተሉ" : "Start your journey, the map is ready",
        fullInstruction: isAmharic ? "የ ካርታውን አቅጣጫ ይከተሉ" : "Start your journey, the map is ready"
      };
    }

    // Handle arrive step
    if (step.type === 'arrive') {
      return {
        ...step,
        instruction: isAmharic ? "መዳረሻዎ ላይ ደርሰዋል" : "You have arrived at your destination",
        fullInstruction: isAmharic ? "መዳረሻዎ ላይ ደርሰዋል" : "You have arrived at your destination"
      };
    }

    // Calculate turn angle from previous step
    let turnAngle = 0;
    let turnDirection = "straight";

    if (index > 0 && index < route.steps.length - 1) {
      const prevStep = route.steps[index - 1];
      const nextStep = route.steps[index + 1];

      if (prevStep && nextStep) {
        turnAngle = calculateTurnAngle(
          prevStep.lat, prevStep.lng,
          step.lat, step.lng,
          nextStep.lat, nextStep.lng
        );
        turnDirection = getTurnDirection(turnAngle);
      }
    }

    // Generate instruction based on type and angle
    let instruction = "";
    let fullInstruction = "";
    const distance = Math.round(step.distance || 0);

    switch (step.type) {
      case "turn":
        if (turnDirection === "left") {
          instruction = isAmharic ? "ወደ ግራ ይታጠፉ" : "Turn left";
          fullInstruction = isAmharic
            ? `በ ${distance} ሜትሮች ወደ ግራ ይታጠፉ`
            : `In ${distance} meters, turn left`;
        } else if (turnDirection === "right") {
          instruction = isAmharic ? "ወደ ቀኝ ይታጠፉ" : "Turn right";
          fullInstruction = isAmharic
            ? `በ ${distance} ሜትሮች ወደ ቀኝ ይታጠፉ`
            : `In ${distance} meters, turn right`;
        } else if (turnDirection === "slight left") {
          instruction = isAmharic ? "በትንሹ ወደ ግራ ይታጠፉ" : "Bear left";
          fullInstruction = isAmharic
            ? `በ ${distance} ሜትሮች በትንሹ ወደ ግራ ይታጠፉ`
            : `In ${distance} meters, bear left`;
        } else if (turnDirection === "slight right") {
          instruction = isAmharic ? "በትንሹ ወደ ቀኝ ይታጠፉ" : "Bear right";
          fullInstruction = isAmharic
            ? `በ ${distance} ሜትሮች በትንሹ ወደ ቀኝ ይታጠፉ`
            : `In ${distance} meters, bear right`;
        } else {
          instruction = isAmharic ? "ቀጥ ብለው ይቀጥሉ" : "Continue straight";
          fullInstruction = isAmharic
            ? `በ ${distance} ሜትሮች ቀጥ ብለው ይቀጥሉ`
            : `Continue straight for ${distance} meters`;
        }
        break;

      case "end of road":
        if (turnDirection === "left") {
          instruction = isAmharic ? "መንገዱ መጨረሻ ወደ ግራ ይታጠፉ" : "At the end of the road, turn left";
          fullInstruction = isAmharic
            ? `መንገዱ መጨረሻ በ ${distance} ሜትሮች ወደ ግራ ይታጠፉ`
            : `At the end of the road, turn left in ${distance} meters`;
        } else if (turnDirection === "right") {
          instruction = isAmharic ? "መንገዱ መጨረሻ ወደ ቀኝ ይታጠፉ" : "At the end of the road, turn right";
          fullInstruction = isAmharic
            ? `መንገዱ መጨረሻ በ ${distance} ሜትሮች ወደ ቀኝ ይታጠፉ`
            : `At the end of the road, turn right in ${distance} meters`;
        } else {
          instruction = isAmharic ? "መንገዱ መጨረሻ ቀጥ ብለው ይቀጥሉ" : "At the end of the road, continue straight";
          fullInstruction = isAmharic
            ? `መንገዱ መጨረሻ በ ${distance} ሜትሮች ቀጥ ብለው ይቀጥሉ`
            : `At the end of the road, continue straight for ${distance} meters`;
        }
        break;

      case "roundabout":
        instruction = isAmharic ? "ወደ ክብ መስቀለኛ መንገድ ይግቡ" : "Enter roundabout";
        fullInstruction = isAmharic
          ? `በ ${distance} ሜትሮች ወደ ክብ መስቀለኛ መንገድ ይግቡ`
          : `In ${distance} meters, enter the roundabout`;
        break;

      case "exit roundabout":
        instruction = isAmharic ? "ከክብ መስቀለኛ መንገድ ይውጡ" : "Exit roundabout";
        fullInstruction = isAmharic ? "ከክብ መስቀለኛ መንገድ ይውጡ" : "Exit the roundabout";
        break;

      default:
        instruction = isAmharic ? "ቀጥ ብለው ይቀጥሉ" : "Continue straight";
        fullInstruction = isAmharic
          ? `በ ${distance} ሜትሮች ቀጥ ብለው ይቀጥሉ`
          : `Continue straight for ${distance} meters`;
    }

    return {
      ...step,
      instruction,
      fullInstruction,
      turnAngle,
      turnDirection
    };
  });

  return { ...route, steps: enhancedSteps };
}

// Helper: Calculate turn angle between three points
function calculateTurnAngle(lat1, lng1, lat2, lng2, lat3, lng3) {
  if (!lat3 || !lng3) return 0;

  const bearing1 = calculateBearing(lat1, lng1, lat2, lng2);
  const bearing2 = calculateBearing(lat2, lng2, lat3, lng3);

  let angle = bearing2 - bearing1;
  angle = ((angle + 540) % 360) - 180;

  return angle;
}

function calculateBearing(lat1, lng1, lat2, lng2) {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lng2 - lng1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let bearing = Math.atan2(y, x);
  bearing = toDegrees(bearing);
  return (bearing + 360) % 360;
}

function getTurnDirection(angle) {
  const absAngle = Math.abs(angle);

  if (absAngle < 15) return "straight";
  if (absAngle < 45) return angle > 0 ? "slight right" : "slight left";
  if (absAngle < 135) return angle > 0 ? "right" : "left";
  return angle > 0 ? "sharp right" : "sharp left";
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
  return radians * (180 / Math.PI);
}