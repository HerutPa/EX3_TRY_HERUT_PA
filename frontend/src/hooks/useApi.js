import { useState, useCallback } from 'react';

/**
 * Custom Hook לניהול קריאות API
 * מפשט את הטיפול בטעינה, שגיאות ונתונים
 */
function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * מבצע קריאת GET API
     * @param {string} url - הכתובת לקריאה
     * @returns {Promise} - התוצאה של הקריאה
     */
    const get = useCallback(async (url) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * מבצע קריאת POST API
     * @param {string} url - הכתובת לקריאה
     * @param {Object} body - הנתונים לשליחה
     * @returns {Promise} - התוצאה של הקריאה
     */
    const post = useCallback(async (url, body) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * מבצע קריאת PUT API
     * @param {string} url - הכתובת לקריאה
     * @param {Object} body - הנתונים לעדכון
     * @returns {Promise} - התוצאה של הקריאה
     */
    const put = useCallback(async (url, body) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * מבצע קריאת DELETE API
     * @param {string} url - הכתובת לקריאה
     * @returns {Promise} - התוצאה של הקריאה
     */
    const del = useCallback(async (url) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * מנקה שגיאות
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        get,
        post,
        put,
        delete: del,
        clearError
    };
}

export default useApi;