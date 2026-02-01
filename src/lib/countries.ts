import { countries as countriesData } from "countries-list";

// Convert countries-list object to our format: { label: string, value: string }
// countries-list format: { TRL: { name: "Turkey", native: "Türkiye", ... }, ... }
export const countries = Object.values(countriesData)
    .map((country) => ({
        label: country.name,
        value: country.name, // Using name as value for simplicity and consistency with previous impl
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
