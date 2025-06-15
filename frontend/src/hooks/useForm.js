import { useState, useCallback } from 'react';

/**
 * Custom Hook לניהול טפסים
 * מפשט את הטיפול בערכים, שגיאות ואימותים
 * גרסה מתוקנת עם dependencies נכונים
 */
function useForm(initialValues = {}, validationRules = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    /**
     * מטפל בשינוי ערך בשדה
     * @param {string} name - שם השדה
     * @param {any} value - הערך החדש
     */
    const handleChange = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));

        // ניקוי שגיאה כשהמשתמש מתחיל להקליד
        setErrors(prev => {
            if (prev[name]) {
                return { ...prev, [name]: '' };
            }
            return prev; // אם אין שגיאה, לא משנים כלום
        });
    }, []); // dependency array ריק כי משתמשים ב-prev

    /**
     * מאמת שדה בודד
     * @param {string} fieldName - שם השדה
     * @param {any} value - הערך לאימות
     * @param {Object} currentValues - הערכים הנוכחיים (אופציונלי)
     * @returns {boolean} - האם השדה תקין
     */
    const validateField = useCallback((fieldName, value, currentValues = null) => {
        const rule = validationRules[fieldName];
        if (!rule) return true;

        // אם לא קיבלנו currentValues, נשתמש בvalues הנוכחיים
        const formValues = currentValues || values;
        let error = '';

        // בדיקת שדה חובה
        if (rule.required && (!value || !value.toString().trim())) {
            error = rule.requiredMessage || `${fieldName} is required`;
        }
        // בדיקת אורך מינימלי
        else if (rule.minLength && value && value.toString().length < rule.minLength) {
            error = rule.minLengthMessage || `${fieldName} must be at least ${rule.minLength} characters`;
        }
        // בדיקת אורך מקסימלי
        else if (rule.maxLength && value && value.toString().length > rule.maxLength) {
            error = rule.maxLengthMessage || `${fieldName} cannot be more than ${rule.maxLength} characters`;
        }
        // בדיקת תבנית (regex)
        else if (rule.pattern && value && !rule.pattern.test(value.toString())) {
            error = rule.patternMessage || `${fieldName} format is invalid`;
        }
        // אימות מותאם אישית
        else if (rule.custom && typeof rule.custom === 'function') {
            const customError = rule.custom(value, formValues);
            if (customError) {
                error = customError;
            }
        }

        // עדכון השגיאה
        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return !error;
    }, [validationRules, values]);

    /**
     * מטפל בהוספת שדה לרשימת השדות שנגעו בהם
     * @param {string} name - שם השדה
     */
    const handleBlur = useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }));

        // אימות השדה כשיוצאים ממנו
        setValues(currentValues => {
            validateField(name, currentValues[name], currentValues);
            return currentValues; // לא משנים את הערכים, רק מאמתים
        });
    }, [validateField]);

    /**
     * מאמת את כל הטופס
     * @returns {boolean} - האם הטופס תקין
     */
    const validate = useCallback(() => {
        let isValid = true;

        // סימון כל השדות כשנגעו בהם
        const allFieldsAsTouched = Object.keys(validationRules).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allFieldsAsTouched);

        // אימות כל השדות עם הערכים הנוכחיים
        setValues(currentValues => {
            Object.keys(validationRules).forEach(fieldName => {
                const fieldValue = currentValues[fieldName];
                const isFieldValid = validateField(fieldName, fieldValue, currentValues);

                if (!isFieldValid) {
                    isValid = false;
                }
            });
            return currentValues;
        });

        return isValid;
    }, [validationRules, validateField]);

    /**
     * מאפס את הטופס לערכי ההתחלה
     */
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    /**
     * מעדכן ערכי טופס מרובים בבת אחת
     * @param {Object} newValues - הערכים החדשים
     */
    const setFormValues = useCallback((newValues) => {
        setValues(prev => ({ ...prev, ...newValues }));
    }, []);

    /**
     * מעדכן שגיאות מרובות בבת אחת
     * @param {Object} newErrors - השגיאות החדשות
     */
    const setFormErrors = useCallback((newErrors) => {
        setErrors(prev => ({ ...prev, ...newErrors }));
    }, []);

    /**
     * בודק האם יש שגיאות בטופס
     */
    const hasErrors = Object.values(errors).some(error => error !== '');

    /**
     * בודק האם השדה הספציפי תקין (אין שגיאה ונגעו בו)
     * @param {string} fieldName - שם השדה
     */
    const isFieldValid = useCallback((fieldName) => {
        return touched[fieldName] && !errors[fieldName];
    }, [touched, errors]);

    /**
     * בודק האם השדה הספציפי לא תקין (יש שגיאה ונגעו בו)
     * @param {string} fieldName - שם השדה
     */
    const isFieldInvalid = useCallback((fieldName) => {
        return touched[fieldName] && !!errors[fieldName];
    }, [touched, errors]);

    return {
        values,
        errors,
        touched,
        hasErrors,
        handleChange,
        handleBlur,
        validate,
        validateField,
        reset,
        setFormValues,
        setFormErrors,
        isFieldValid,
        isFieldInvalid
    };
}

export default useForm;