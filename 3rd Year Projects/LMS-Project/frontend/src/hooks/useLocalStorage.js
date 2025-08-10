import { useState, useEffect } from 'react';

/**
 * Persisted state hook with JSON serialization
 * @param {string} key
 * @param {*} initial
 */
export default function useLocalStorage(key, initial) {
    const [value, setValue] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw !== null ? JSON.parse(raw) : initial;
        } catch {
            return initial;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // ignore
        }
    }, [value, key]);

    return [value, setValue];
}