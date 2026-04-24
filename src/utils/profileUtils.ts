const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Converts a YYYY-MM string to "Mon YYYY" (e.g. "2024-01" → "Jan 2024").
export function formatYearMonth(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length < 2) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return dateStr;
    return `${MONTHS[month - 1]} ${year}`;
}

// Formats a work experience date range as "Jan 2022 – Dec 2023" or "Jan 2024 – Present".
export function formatWorkDuration(
    startDate?: string | null,
    endDate?: string | null,
    currentlyWorking?: boolean
): string {
    const start = formatYearMonth(startDate);
    if (!start) return "";
    const end = currentlyWorking ? "Present" : formatYearMonth(endDate);
    return end ? `${start} – ${end}` : start;
}

// Formats an experience_years int for display.
// Returns "< 1 year" for 0, "1 year" for 1, "N years" otherwise.
export function formatExperienceYears(years: number | null | undefined): string {
    if (years == null) return "-";
    if (years === 0) return "< 1 year";
    if (years === 1) return "1 year";
    return `${years} years`;
}
