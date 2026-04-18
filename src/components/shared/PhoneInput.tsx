import PhoneInputLib, { isValidPhoneNumber } from "react-phone-number-input";
import type { Value as E164Number } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** When true, shows a red ring if the value is set but invalid */
  showValidation?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  placeholder = "+1 (555) 000-0000",
  className,
  showValidation = false,
}: PhoneInputProps) {
  const isInvalid = showValidation && value && !isValidPhoneNumber(value);

  return (
    <PhoneInputLib
      international
      defaultCountry="KE"
      value={value as E164Number}
      onChange={(v) => onChange(v ?? "")}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(
        "phone-input-wrapper",
        isInvalid && "phone-input-invalid",
        className,
      )}
    />
  );
}

/** Returns true only if value is a valid E.164 phone number */
export { isValidPhoneNumber };
