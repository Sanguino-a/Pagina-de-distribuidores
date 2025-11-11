import { useState, useEffect, useCallback, useRef } from "react";

export function useForm({ 
  initialValues, 
  validate, 
  onSubmit,
  debounceMs = 300,
  enableRealTimeValidation = true,
  validateOnMount = false
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [fieldValidationStatus, setFieldValidationStatus] = useState({});
  
  const debounceRef = useRef();
  const mountedRef = useRef(false);

  // Validate function with debouncing
  const runValidation = useCallback((nextValues = values) => {
    if (!validate) return {};
    
    setIsValidating(true);
    const validationErrors = validate(nextValues);
    setErrors(validationErrors);
    setIsValidating(false);
    return validationErrors;
  }, [values, validate]);

  // Debounced validation for real-time feedback
  const runDebouncedValidation = useCallback((nextValues) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      runValidation(nextValues);
    }, debounceMs);
  }, [debounceMs, runValidation]);

  // Validation on mount (if enabled)
  useEffect(() => {
    if (validateOnMount && !mountedRef.current) {
      mountedRef.current = true;
      runValidation();
    }
  }, [validateOnMount, runValidation]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    const next = { ...values, [name]: nextValue };
    
    setValues(next);
    
    // Update field validation status
    setFieldValidationStatus(prev => ({
      ...prev,
      [name]: { validating: true, validated: false }
    }));

    // Real-time validation (debounced) when field is touched
    if (enableRealTimeValidation && touched[name]) {
      runDebouncedValidation(next);
    }

    // Mark field as validating, then as validated after debounce
    setTimeout(() => {
      setFieldValidationStatus(prev => ({
        ...prev,
        [name]: { validating: false, validated: true }
      }));
    }, debounceMs);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
    
    // Run validation immediately on blur if real-time validation is disabled
    if (!enableRealTimeValidation) {
      runValidation();
    }
  };

  const handleFieldChange = (name, value, validateImmediately = true) => {
    const next = { ...values, [name]: value };
    setValues(next);
    
    // Update field validation status
    setFieldValidationStatus(prev => ({
      ...prev,
      [name]: { validating: true, validated: false }
    }));

    if (validateImmediately && enableRealTimeValidation && touched[name]) {
      runDebouncedValidation(next);
    }

    // Mark field as validated after debounce
    setTimeout(() => {
      setFieldValidationStatus(prev => ({
        ...prev,
        [name]: { validating: false, validated: true }
      }));
    }, debounceMs);
  };

  const focusFirstError = (errorKeys) => {
    if (errorKeys.length > 0) {
      const first = errorKeys[0];
      // Handle nested error keys (e.g., "user.email")
      const fieldName = first.includes('.') ? first.split('.')[0] : first;
      const el = document.querySelector(`[name="${fieldName}"]`) || 
                 document.querySelector(`#${fieldName}`);
      
      if (el && typeof el.focus === "function") {
        el.focus();
        // Scroll to element if it's not in view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const validateField = (fieldName) => {
    if (!validate) return {};
    
    // Create a custom validation function for a single field
    const singleFieldValidate = (allValues) => {
      const allErrors = validate(allValues) || {};
      return allErrors[fieldName] ? { [fieldName]: allErrors[fieldName] } : {};
    };
    
    const fieldErrors = singleFieldValidate(values);
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors[fieldName] || null
    }));
    
    // Clean up undefined errors
    if (!fieldErrors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    return fieldErrors;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Clear previous submit error
    setSubmitError("");

    // Run validation
    const validationErrors = runValidation();
    
    if (Object.keys(validationErrors).length > 0) {
      setSubmitError("Por favor corrige los campos marcados.");
      focusFirstError(Object.keys(validationErrors));
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit?.(values, { 
        reset, 
        setValues, 
        setErrors, 
        setTouched,
        validateField
      });
    } catch (err) {
      const errorMessage = err?.message || "Ocurrió un error al enviar.";
      setSubmitError(errorMessage);
      
      // In development, log the error
      if (process.env.NODE_ENV === 'development') {
        console.error('Form submission error:', err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = (newInitialValues = initialValues) => {
    setValues(newInitialValues);
    setErrors({});
    setTouched({});
    setSubmitError("");
    setFieldValidationStatus({});
    mountedRef.current = false;
  };

  const setFieldError = (fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    if (error) {
      setTouched(prev => ({ ...prev, [fieldName]: true }));
    }
  };

  const clearFieldError = (fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Get form validity status
  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isTouched = Object.keys(touched).length > 0;

  // Get validation status for a specific field
  const getFieldValidationStatus = (fieldName) => {
    const status = fieldValidationStatus[fieldName] || { validating: false, validated: false };
    const hasError = !!errors[fieldName];
    const isTouchedField = !!touched[fieldName];
    
    return {
      ...status,
      hasError,
      isTouched: isTouchedField,
      shouldShow: isTouchedField && status.validated
    };
  };

  return {
    values, setValues,
    errors, touched,
    isSubmitting, submitError,
    isValidating,
    isValid, isDirty, isTouched,
    handleChange, handleBlur, handleSubmit, 
    handleFieldChange,
    reset, runValidation, validateField,
    setFieldError, clearFieldError,
    getFieldValidationStatus,
    fieldValidationStatus
  };
}

// Utility functions for common validations
export const validators = {
  required: (message = "Este campo es obligatorio") => (value) => {
    if (value === null || value === undefined || value === '') return message;
    if (Array.isArray(value) && value.length === 0) return message;
    return null;
  },

  minLength: (min, message = `Mínimo ${min} caracteres`) => (value) => {
    if (!value || value.length < min) return message;
    return null;
  },

  maxLength: (max, message = `Máximo ${max} caracteres`) => (value) => {
    if (value && value.length > max) return message;
    return null;
  },

  email: (message = "Email inválido") => (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return message;
    return null;
  },

  number: (message = "Debe ser un número") => (value) => {
    if (value && isNaN(Number(value))) return message;
    return null;
  },

  min: (min, message = `Mínimo ${min}`) => (value) => {
    if (value && Number(value) < min) return message;
    return null;
  },

  max: (max, message = `Máximo ${max}`) => (value) => {
    if (value && Number(value) > max) return message;
    return null;
  },

  pattern: (pattern, message = "Formato inválido") => (value) => {
    if (value && !pattern.test(value)) return message;
    return null;
  },

  custom: (validatorFn, message = "Valor inválido") => (value) => {
    if (value && !validatorFn(value)) return message;
    return null;
  }
};

// Combine multiple validators for a field
export const combineValidators = (...validators) => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};
