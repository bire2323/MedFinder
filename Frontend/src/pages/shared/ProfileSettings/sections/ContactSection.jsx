import React from "react";
import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionWrapper, InputField } from "../components/FormFields";

const ContactSection = ({ data, onChange, error, theme }) => {
  const { t } = useTranslation();

  return (
    <SectionWrapper id="contact" title={t("Settings.ContactInfo")} theme={theme}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <InputField
            label={t("Settings.EmergencyContact")}
            icon={<Phone size={14} />}
            value={data.contact_phone}
            onChange={(v) => onChange("contact_phone", v)}
            error={error?.contact_phone}
            theme={theme}
            placeholder="0911223344"
         />
         <InputField
            label={t("Settings.PublicEmail")}
            icon={<Mail size={14} />}
            value={data.contact_email}
            onChange={(v) => onChange("contact_email", v)}
            error={error?.contact_email}
            theme={theme}
            placeholder="[EMAIL_ADDRESS]"
         />
      </div>
    </SectionWrapper>
  );
};

export default ContactSection;
