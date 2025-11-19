// validate.js - Validation functions for user input

/**
 * Validate user's full name
 * @param {string} name - User input for name
 * @returns {Object} - { valid: boolean, error?: string, cleaned?: string }
 */
function validateName(name) {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }
  if (name.length > 100) {
    return { valid: false, error: "Name is too long" };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { valid: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" };
  }
  return { valid: true, cleaned: name.trim() };
}

/**
 * Validate email address
 * @param {string} email - User input for email
 * @returns {Object} - { valid: boolean, error?: string, cleaned?: string }
 */
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { valid: false, error: "Invalid email format. Example: user@example.com" };
  }
  return { valid: true, cleaned: email.toLowerCase().trim() };
}

/**
 * Validate UK phone number
 * @param {string} phone - User input for phone number
 * @returns {Object} - { valid: boolean, error?: string, cleaned?: string }
 */
function validatePhone(phone) {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');

  // UK formats: 07700123456 or +447700123456
  const regex = /^(\+44|0)7\d{9}$/;

  if (!regex.test(cleaned)) {
    return {
      valid: false,
      error: "Invalid UK phone number. Use format: 07700123456 or +447700123456"
    };
  }

  // Standardize to +44 format
  const standardized = cleaned.startsWith('+44')
    ? cleaned
    : '+44' + cleaned.substring(1);

  return { valid: true, cleaned: standardized };
}

/**
 * Validate number of items
 * @param {string} items - User input for number of items
 * @returns {Object} - { valid: boolean, error?: string, cleaned?: number }
 */
function validateItems(items) {
  const num = parseInt(items);

  if (isNaN(num)) {
    return { valid: false, error: "Please enter a valid number" };
  }
  if (num < 1) {
    return { valid: false, error: "Number of items must be at least 1" };
  }
  if (num > 10000) {
    return { valid: false, error: "Number seems too high. Please verify." };
  }

  return { valid: true, cleaned: num };
}

module.exports = {
  validateName,
  validateEmail,
  validatePhone,
  validateItems
};
