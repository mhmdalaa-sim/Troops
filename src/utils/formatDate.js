/**
 * Formats a date string or Date object to a readable format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats a date to time string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return 'N/A';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculates the number of days between two dates
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {number} Number of days
 */
export const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Checks if a date is in the past
 * @param {Date|string} date 
 * @returns {boolean}
 */
export const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Checks if a date is in the future
 * @param {Date|string} date 
 * @returns {boolean}
 */
export const isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Formats currency
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
