// ConditionalStep3.jsx
import { useParams } from "react-router-dom";
import Step3PharmacyVerification from "./Step3PharmacyVerification";
import Step3HospitalVerification from "./Step3HospitalVerification";

/**
 * ConditionalStep3 Component
 * This component renders different verification steps based on the 'type' parameter from URL.
 * It serves as a conditional router for Step3 verification process.
 */
const Step3Selector = () => {
  // Extract the 'type' parameter from URL using useParams hook
  const { type } = useParams();
  
  if (type === "pharmacy") {
    return <Step3PharmacyVerification />;
  } else if (type === "hospital") {
    return <Step3HospitalVerification />;
  }
  
  // Default or fallback
  return <Step3PharmacyVerification />;
};
export default Step3Selector;