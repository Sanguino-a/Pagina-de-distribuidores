import { useState } from "react";

export function useForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const runValidation = (nextValues = values) => {
    const e = validate ? validate(nextValues) : {};
    setErrors(e);
    return e;
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    // Validación en tiempo real cuando el campo ya fue tocado
    if (touched[name]) runValidation(next);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (!touched[name]) setTouched((t) => ({ ...t, [name]: true }));
    runValidation(values);
  };

  const focusFirstError = (e) => {
    const keys = Object.keys(e);
    if (keys.length > 0) {
      const first = keys[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el && typeof el.focus === "function") el.focus();
    }
  };

  const handleSubmit = async (e) => {
    // Previene el comportamiento por defecto del formulario (evita recargar la página)
    e.preventDefault();
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const eNow = runValidation(values);
    if (Object.keys(eNow).length > 0) {
      setSubmitError("Corrige los campos marcados.");
      focusFirstError(eNow);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      await onSubmit?.(values, { reset });
    } catch (err) {
      setSubmitError(err?.message || "Ocurrió un error al enviar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitError("");
  };

  return {
    values, setValues,
    errors, touched,
    isSubmitting, submitError,
    handleChange, handleBlur, handleSubmit, reset,
    runValidation
  };
}
