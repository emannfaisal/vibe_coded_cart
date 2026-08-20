/**
 * Centralized Input Validation & Sanitization Module
 * Enforces strict input validation and XSS prevention across Storefront and Admin Portal.
 */

// Basic HTML escaping to prevent XSS injection in raw user inputs
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Generate URL-friendly slug
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

// Email format regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number regex (allows +, digits, spaces, dashes, parentheses)
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ----------------------------------------------------
// 1. CHECKOUT FORM VALIDATION
// ----------------------------------------------------
export interface CheckoutInput {
  customerName: string;
  phone: string;
  email?: string;
  notes?: string;
}

export function validateCheckoutInput(data: CheckoutInput): ValidationResult {
  const errors: Record<string, string> = {};

  const name = data.customerName?.trim() || '';
  if (!name) {
    errors.customerName = 'Full Name is required.';
  } else if (name.length < 2) {
    errors.customerName = 'Full Name must be at least 2 characters.';
  } else if (name.length > 100) {
    errors.customerName = 'Full Name cannot exceed 100 characters.';
  }

  const phone = data.phone?.trim() || '';
  if (!phone) {
    errors.phone = 'Phone / WhatsApp number is required.';
  } else if (!PHONE_REGEX.test(phone)) {
    errors.phone = 'Please enter a valid phone number (e.g. +92 300 1234567).';
  }

  const email = data.email?.trim() || '';
  if (email && !EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  const notes = data.notes?.trim() || '';
  if (notes.length > 1000) {
    errors.notes = 'Notes cannot exceed 1000 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ----------------------------------------------------
// 2. PRODUCT CUSTOMIZATION FORM VALIDATION
// ----------------------------------------------------
export interface CustomFieldDefinition {
  name: string;
  type: string;
  required: boolean;
}

export function validateCustomFields(
  fields: CustomFieldDefinition[],
  values: Record<string, string>
): ValidationResult {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    const val = (values[field.name] || '').trim();
    if (field.required && !val) {
      errors[field.name] = `${field.name} is required.`;
    } else if (val.length > 500) {
      errors[field.name] = `${field.name} cannot exceed 500 characters.`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ----------------------------------------------------
// 3. ADMIN LOGIN FORM VALIDATION
// ----------------------------------------------------
export function validateAdminLoginInput(email: string, password: string): ValidationResult {
  const errors: Record<string, string> = {};

  const cleanEmail = email?.trim() || '';
  if (!cleanEmail) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(cleanEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 4) {
    errors.password = 'Password must be at least 4 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ----------------------------------------------------
// 4. ADMIN PRODUCT FORM VALIDATION
// ----------------------------------------------------
export interface ProductInput {
  name: string;
  categoryId?: string;
  price: number;
  description: string;
  imageUrls: string[];
}

export function validateProductInput(data: ProductInput): ValidationResult {
  const errors: Record<string, string> = {};

  const name = data.name?.trim() || '';
  if (!name) {
    errors.name = 'Product name is required.';
  } else if (name.length < 2) {
    errors.name = 'Product name must be at least 2 characters.';
  } else if (name.length > 150) {
    errors.name = 'Product name cannot exceed 150 characters.';
  }

  if (data.price === undefined || data.price === null || isNaN(data.price)) {
    errors.price = 'Price is required.';
  } else if (data.price < 0) {
    errors.price = 'Price cannot be negative.';
  } else if (!Number.isInteger(data.price)) {
    errors.price = 'Price must be a whole integer in PKR.';
  }

  const desc = data.description?.trim() || '';
  if (!desc) {
    errors.description = 'Product description is required.';
  } else if (desc.length < 5) {
    errors.description = 'Description must be at least 5 characters.';
  } else if (desc.length > 3000) {
    errors.description = 'Description cannot exceed 3000 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ----------------------------------------------------
// 5. ADMIN CATEGORY FORM VALIDATION
// ----------------------------------------------------
export interface CategoryInput {
  name: string;
  slug?: string;
  imageUrl?: string;
}

export function validateCategoryInput(data: CategoryInput): ValidationResult {
  const errors: Record<string, string> = {};

  const name = data.name?.trim() || '';
  if (!name) {
    errors.name = 'Category name is required.';
  } else if (name.length < 2) {
    errors.name = 'Category name must be at least 2 characters.';
  } else if (name.length > 100) {
    errors.name = 'Category name cannot exceed 100 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ----------------------------------------------------
// 6. ADMIN SITE SETTINGS VALIDATION
// ----------------------------------------------------
export interface SiteSettingsInput {
  contact_email: string;
  brand_name: string;
  tagline?: string;
}

export function validateSiteSettingsInput(data: SiteSettingsInput): ValidationResult {
  const errors: Record<string, string> = {};

  const email = data.contact_email?.trim() || '';
  if (!email) {
    errors.contact_email = 'Contact email is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.contact_email = 'Please enter a valid email address.';
  }

  const brand = data.brand_name?.trim() || '';
  if (!brand) {
    errors.brand_name = 'Brand name is required.';
  } else if (brand.length < 2) {
    errors.brand_name = 'Brand name must be at least 2 characters.';
  } else if (brand.length > 100) {
    errors.brand_name = 'Brand name cannot exceed 100 characters.';
  }

  const tagline = data.tagline?.trim() || '';
  if (tagline.length > 250) {
    errors.tagline = 'Tagline cannot exceed 250 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
