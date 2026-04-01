/**
 * Timezone utilities for ESAPListen
 * Handles auto-detection of user's current timezone and timezone conversions
 */

/**
 * Get the user's current timezone
 * Auto-detects from browser, updates when user travels
 */
export const getUserTimezone = (): string => {
  try {
    // Auto-detect from browser's Intl API
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone; // e.g., "America/New_York", "Asia/Dhaka", "Asia/Riyadh"
  } catch (error) {
    return 'UTC'; // Fallback to UTC
  }
};

/**
 * Format a UTC datetime for display in user's timezone
 * @param utcDateTime - ISO string in UTC
 * @param userTimezone - User's timezone (from getUserTimezone)
 */
export const formatInUserTimezone = (
  utcDateTime: string,
  userTimezone?: string
): string => {
  try {
    const tz = userTimezone || getUserTimezone();
    const date = new Date(utcDateTime);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    return formatter.format(date);
  } catch (error) {
    return utcDateTime;
  }
};

/**
 * Format a UTC datetime with custom format in user's timezone
 */
export const formatDateTime = (
  utcDateTime: string,
  options: Intl.DateTimeFormatOptions,
  userTimezone?: string
): string => {
  try {
    const tz = userTimezone || getUserTimezone();
    const date = new Date(utcDateTime);

    const formatter = new Intl.DateTimeFormat('en-US', {
      ...options,
      timeZone: tz,
    });

    return formatter.format(date);
  } catch (error) {
    return utcDateTime;
  }
};

/**
 * Get timezone offset in hours
 * Useful for displaying "UTC+3", "UTC-5", etc.
 */
export const getTimezoneOffset = (timezone?: string): string => {
  try {
    const tz = timezone || getUserTimezone();
    const now = new Date();

    // Get UTC offset in minutes
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    });

    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(part => part.type === 'timeZoneName');

    return offsetPart?.value || 'UTC';
  } catch (error) {
    return 'UTC';
  }
};

/**
 * Convert local date/time to UTC for API submission
 * @param localDate - YYYY-MM-DD
 * @param localTime - HH:MM (optional)
 * @param userTimezone - User's timezone
 * @returns ISO string in UTC
 */
export const localToUTC = (
  localDate: string,
  localTime?: string,
  userTimezone?: string
): string => {
  try {
    const tz = userTimezone || getUserTimezone();

    // Combine date and time
    const dateTimeStr = localTime
      ? `${localDate}T${localTime}:00`
      : `${localDate}T00:00:00`;

    // Parse as local time in user's timezone
    // Note: This creates a Date object, which will be interpreted as local time
    const dateObj = new Date(dateTimeStr);

    // Convert to UTC ISO string
    return dateObj.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
};
