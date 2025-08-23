import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const usePortfolio = () => {
    const { token } = useContext(AuthContext);
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState('');
    const [lastSync, setLastSync] = useState(null);

    // Axios instance ko component ke bahar define na karein, ya useMemo ka istemal karein
    // Lekin is case mein, hum ise useCallback ke andar hi rakhenge for simplicity

    const fetchPortfolio = useCallback(async () => {
        if (!token) {
            setLoading(false);
            setError("No auth token found. Cannot fetch portfolio.");
            return;
        }

        // Axios instance ko yahan banayein
        const api = axios.create({
            baseURL: '/api/v1', // Proxy isko http://localhost:5001 par bhej dega
            headers: { 'Authorization': `Bearer ${token}` }
        });

        try {
            setLoading(true);
            const res = await api.get('/portfolio'); // Yeh ab /api/v1/portfolio par request karega
            setPortfolio(res.data);
            if (res.data.updatedAt) {
                setLastSync(new Date(res.data.updatedAt));
            }
        } catch (err) {
            console.error("Error fetching portfolio:", err);
            setError('Failed to fetch portfolio data.');
        } finally {
            setLoading(false);
        }
    }, [token]); // <-- SABSE ZAROORI BADLAV YAHAN HAI

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]); // useEffect ab sirf fetchPortfolio function ke badalne par chalega

    const savePortfolio = async (updatedData) => {
        const api = axios.create({
            baseURL: '/api/v1',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        try {
            setError('');
            const res = await api.put('/portfolio', updatedData);
            setPortfolio(res.data);
        } catch (err) {
            setError('Failed to save profile.');
            throw err;
        }
    };

    const manualSync = async () => {
        const api = axios.create({
            baseURL: '/api/v1',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        try {
            setError('');
            setSyncing(true);
            const res = await api.post('/portfolio/sync');
            setPortfolio(res.data);
            setLastSync(new Date());
        } catch (err) {
            setError('Sync failed. Please try again.');
        } finally {
            setSyncing(false);
        }
    };

    return { portfolio, loading, syncing, lastSync, error, savePortfolio, manualSync };
};

export default usePortfolio;