// utils/routeInstructions.js

export function enhanceRouteSteps(route) {
  if (!route || !route.steps) return route;
  const isAmharic = localStorage.getItem("i18nextLng") === "am";
  //console.log(isAmharic);
  const enhancedSteps = route.steps.map((step, index) => {
    // Skip depart and arrive steps
    if (step.type === 'depart') {
      return {
        ...step,
        instruction:  isAmharic ? " ካርታው ዝግጁ ነው " : "Start your journey the map is ready",
        fullInstruction: isAmharic ? " ካርታው ዝግጁ ነው " : "Start your journey the map is ready"
      };
    }
    
    if (step.type === 'arrive') {
      return {
        ...step,
        instruction: isAmharic ? "መዳረሻዎ ላይ ደርሰዋል" :"You have arrived at your destination",
        fullInstruction: isAmharic ? "መዳረሻዎ ላይ ደርሰዋል" :"You have arrived at your destination"
      };
    }
    
    // Calculate turn angle from previous step
    let turnAngle = 0;
    let turnDirection = "straight";
    
    if (index > 1) {
      const prevStep = route.steps[index - 1];
      const currentStep = step;
      
      turnAngle = calculateTurnAngle(
        prevStep.lat, prevStep.lng,
        currentStep.lat, currentStep.lng,
        route.steps[index + 1]?.lat, route.steps[index + 1]?.lng
      );
      
      turnDirection = getTurnDirection(turnAngle);
    }
    
    // Generate instruction based on type and angle
    let instruction = "";
    let fullInstruction = "";
    
    switch (step.type) {
      case "turn":
        if (turnDirection === "left") {
          instruction = `${isAmharic ? `ወደ ግራ ይታጠፉ` : `Turn left`}`;
          fullInstruction = `${isAmharic ? `በ ${Math.round(step.distance)} ሜትሮች ወደ ግራ ታጥፈው ይጓዙ` : `In ${Math.round(step.distance)}  meters, turn left`}`;
        } else if (turnDirection === "right") {
          instruction = `${isAmharic ? `ወደ ቀኝ ይታጠፉ` : `Turn right`}`;
          fullInstruction = `${isAmharic ? `በ ${Math.round(step.distance)} ሜትሮች ወደ ቀኝ ታጥፈው ይጓዙ` : `In ${Math.round(step.distance)}  meters, turn right`}`;
        } else if (turnDirection === "slight left") {
          instruction = `${isAmharic ? `ወደ ግራ ይታጠፉ` : `Bear left`}`;
          fullInstruction = `${isAmharic ? `በ ${Math.round(step.distance)} ሜትሮች ወደ ግራ ታጥፈው ይጓዙ` : `In ${Math.round(step.distance)}  meters, bear left`}`;
        } else if (turnDirection === "slight right") {
          instruction = `${isAmharic ? `ወደ ቀኝ ይታጠፉ` : `Bear right`}`;
          fullInstruction = `${isAmharic ? `በ ${Math.round(step.distance)} ሜትሮች ወደ ቀኝ ታጥፈው ይጓዙ` : `In ${Math.round(step.distance)}  meters, bear right`}`;
        } else if (turnDirection === "sharp left") {
          instruction = `${isAmharic ? `ወደ ግራ ይታጠፉ` : `Sharp left`}`;
          fullInstruction = `${isAmharic ? `በ ${Math.round(step.distance)} ሜትሮች ወደ ፊት ታጥፈው ይጓዙ` : `In ${Math.round(step.distance)}  meters, make a sharp left`}`;
        } else if (turnDirection === "sharp right") {
          instruction = `${isAmharic ? `ወደ ቀኝ ይታጠፉ` : `Sharp right`}`;
          fullInstruction = `${isAmharic ? `በ ${Math.round(step.distance)} ሜትሮች ወደ ፊት ታጥፈው ይጓዙ` : `In ${Math.round(step.distance)}  meters, make a sharp right`}`;
        } else {
          instruction = `${isAmharic ? `ወደ ፊት` : `Continue straight`}`;
          fullInstruction = `${isAmharic ? `በ ${Math.round(step.distance)} ሜትሮች ወደ ፊት ታጥፈው ይጓዙ` : `Continue straight for ${Math.round(step.distance)}  meters`}`;
        }
        break;
        
      case "end of road":
        if (turnDirection === "left") {
          instruction = `${ isAmharic ?  `መንገዱ መጨረሻ ወደ ግራ ይታጠፉ` : `At th  e end of the road, turn left`}`;
          fullInstruction = `${isAmharic ? `መንገዱ መጨረሻ  በ ${Math.round(step.distance)} ሜትሮች ወደ ግራ ታጥፈው ይጓዙ` : `At the end of the road, turn left in ${Math.round(step.distance)}  meters`}`;
        } else if (turnDirection === "right") {
          instruction = `${isAmharic ? `መንገዱ መጨረሻ ወደ ቀኝ ይታጠፉ` : `At the end of the road, turn right`}`;
          fullInstruction = `${isAmharic ? `መንገዱ መጨረሻ በ ${Math.round(step.distance)} ሜትሮች ወደ ቀኝ ታጥፈው ይጓዙ` : `At the end of the road, turn right in ${Math.round(step.distance)} meters `}`;
        } else {
          instruction = `${isAmharic ? "መንገዱ መጨረሻ ይቀጥሉ" : `At the end of the road, continue`}`;
          fullInstruction = `${isAmharic ? `መንገዱ መጨረሻ በ ${Math.round(step.distance)} ሜትሮች ወደ ፊት ታጥፈው ይጓዙ` : `At the end of the road, continue straight for ${Math.round(step.distance)}  meters`}`;
        }
        break;
        
      case "roundabout":
        instruction = `${isAmharic ? `ወደ ፊት` : `Enter roundabout`}`;
        fullInstruction = `${isAmharic ? `በ ${Math.round(step.distance)} ሜትሮች ወደ ፊት ይጓዙ` : `In ${Math.round(step.distance)} meters, enter the roundabout`}`;
        break;
        
      case "exit roundabout":
        instruction = `${isAmharic ? `ወደ ፊት` : `Exit roundabout`}`;
        fullInstruction = `${isAmharic ? `በ ${Math.round(step.distance)} ሜትሮች ወደ ፊት ይጓዙ` : `Exit the roundabout`}`;
        break;
        
      default:
        instruction = `${isAmharic ? `ወደ ፊት` : `Continue straight`}`;
        fullInstruction = `${isAmharic ? `በ ${Math.round(step.distance)} ሜትሮች ወደ ፊት ይጓዙ` : `Continue straight for ${Math.round(step.distance)}  meters`}`;
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
  
  // Calculate bearings
  const bearing1 = calculateBearing(lat1, lng1, lat2, lng2);
  const bearing2 = calculateBearing(lat2, lng2, lat3, lng3);
  
  let angle = bearing2 - bearing1;
  
  // Normalize to -180 to 180
  angle = ((angle + 540) % 360) - 180;
  
  return angle;
}

function calculateBearing(lat1, lng1, lat2, lng2) {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lng2 - lng1);
  
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
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