import { useState, useEffect, useCallback } from 'react';

export default function useAsync(fn, deps = [], { immediate = true } = {}) {
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);
    const [value, setValue] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true); setError(null);
        try {
            const v = await fn(...args);
            setValue(v);
            return v;
        } catch (e) {
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => { if (immediate) execute(); }, [execute, immediate]);

    return { loading, error, value, execute };
}