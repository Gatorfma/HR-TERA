import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
};

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "TR", name: "Türkiye", dialCode: "+90", flag: "🇹🇷", placeholder: "5xxxxxxxxx" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", placeholder: "2025550123" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", placeholder: "7123456789" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪", placeholder: "15123456789" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", placeholder: "612345678" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱", placeholder: "612345678" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸", placeholder: "612345678" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹", placeholder: "3123456789" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", placeholder: "4165550123" },
  { code: "AE", name: "UAE", dialCode: "+971", flag: "🇦🇪", placeholder: "501234567" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦", placeholder: "512345678" },
];

const getCountryByCode = (code: string) =>
  COUNTRY_OPTIONS.find((country) => country.code === code) ?? COUNTRY_OPTIONS[0];

const dialCodeSorted = [...COUNTRY_OPTIONS].sort(
  (a, b) => b.dialCode.replace(/\D/g, "").length - a.dialCode.replace(/\D/g, "").length
);

const parsePhoneValue = (value: string, fallbackCode: string) => {
  const fallback = getCountryByCode(fallbackCode);

  if (!value) {
    return { country: fallback, local: "" };
  }

  const numeric = value.replace(/\D/g, "");
  const matched = dialCodeSorted.find((country) =>
    numeric.startsWith(country.dialCode.replace(/\D/g, ""))
  );

  if (!matched) {
    return { country: fallback, local: numeric };
  }

  const dialDigits = matched.dialCode.replace(/\D/g, "");
  return { country: matched, local: numeric.slice(dialDigits.length) };
};

const buildPhoneValue = (country: CountryOption, local: string) => {
  const localDigits = local.replace(/\D/g, "");
  const dialDigits = country.dialCode.replace(/\D/g, "");
  if (!localDigits) return "";
  return `+${dialDigits}${localDigits}`;
};

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: string;
  id?: string;
  disabled?: boolean;
}

const PhoneInput = ({ value, onChange, defaultCountry = "TR", id, disabled }: PhoneInputProps) => {
  const parsed = useMemo(() => parsePhoneValue(value, defaultCountry), [value, defaultCountry]);
  const [countryCode, setCountryCode] = useState(parsed.country.code);
  const [localNumber, setLocalNumber] = useState(parsed.local);

  useEffect(() => {
    setCountryCode(parsed.country.code);
    setLocalNumber(parsed.local);
  }, [parsed.country.code, parsed.local]);

  const selectedCountry = useMemo(() => getCountryByCode(countryCode), [countryCode]);

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    const nextCountry = getCountryByCode(code);
    onChange(buildPhoneValue(nextCountry, localNumber));
  };

  const handleNumberChange = (nextValue: string) => {
    const digitsOnly = nextValue.replace(/\D/g, "");
    setLocalNumber(digitsOnly);
    onChange(buildPhoneValue(selectedCountry, digitsOnly));
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select value={countryCode} onValueChange={handleCountryChange} disabled={disabled}>
        <SelectTrigger className="w-full rounded-xl sm:w-[200px]">
          <div className="flex items-center gap-2">
            <span className="text-base">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.name}</span>
            <span className="text-xs text-muted-foreground">{selectedCountry.dialCode}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[260px]">
          {COUNTRY_OPTIONS.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex w-full items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span className="text-sm">{country.name}</span>
                </span>
                <span className="text-xs text-muted-foreground">{country.dialCode}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        value={localNumber}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder={selectedCountry.placeholder}
        className="rounded-xl"
        disabled={disabled}
      />
    </div>
  );
};

export default PhoneInput;
