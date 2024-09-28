export function handleActionError(errorMessage, throwable, returnValue) {
  if (throwable) throw new Error(errorMessage);
  else {
    console.error(errorMessage);
    return returnValue;
  }
}

export function handleCaughtActionError(
  errorMessageStart,
  errorMessage,
  throwable,
  returnValue
) {
  throwableErrorMessage = errorMessage || errorMessageStart;
  errorMessage = errorMessage
    ? `${errorMessageStart}: ${errorMessage}`
    : errorMessageStart;
  console.error(errorMessage);
  if (throwable) throw new Error(throwableErrorMessage);
  else return returnValue;
}

export function resolveUrl(url, defaultUrl) {
  if (!url) return defaultUrl;
  const trimmedUrl = url.trim();
  try {
    new URL(trimmedUrl);
    return trimmedUrl;
  } catch {
    return defaultUrl;
  }
}

export function getInitials(name) {
  const nameParts = name.split(" ");
  const initials = nameParts.map((part) => part.charAt(0)).join("");
  return initials.toUpperCase();
}

export const sanitizeNumberInput = (input) => {
  return input === "" || isNaN(Number(input)) ? 0 : Number(input);
};
