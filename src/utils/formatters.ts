/**
 * Utility functions for formatting data display
 */

export const formatCurrency = (
  amount: number,
  currency: string = "NZD"
): string => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "$0.00";
  }

  // For NZD, use $ symbol
  if (currency === "NZD") {
    return `$${amount.toFixed(2)}`;
  }

  // For other currencies, use Intl.NumberFormat
  try {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (error) {
    // Fallback if currency is not supported
    return `$${amount.toFixed(2)}`;
  }
};

export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    return dateObj.toLocaleDateString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

export const formatDateTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    return dateObj.toLocaleString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? "1 month ago" : `${months} months ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return years === 1 ? "1 year ago" : `${years} years ago`;
    }
  } catch (error) {
    return "Unknown";
  }
};

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  if (typeof value !== "number" || isNaN(value)) {
    return "0%";
  }

  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  if (typeof value !== "number" || isNaN(value)) {
    return "0";
  }

  return value.toLocaleString("en-NZ", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + "...";
};

export const formatStoreName = (storeName: string): string => {
  // Clean up store names for display
  return storeName
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

export const formatCategoryName = (category: string): string => {
  // Format category names consistently
  return category
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};
