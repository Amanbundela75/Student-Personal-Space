// self.onmessage expects { type: 'AGGREGATE', payload: { stats } }
self.onmessage = (e) => {
    const { type, payload } = e.data || {};
    if (type === 'AGGREGATE') {
        const { stats } = payload;
        const result = Object.entries(stats || {}).reduce((acc, [platform, s]) => {
            acc.totalEasy += s.easy || 0;
            acc.totalMedium += s.medium || 0;
            acc.totalHard += s.hard || 0;
            acc.total += s.total || 0;
            return acc;
        }, { totalEasy: 0, totalMedium: 0, totalHard: 0, total: 0 });
        self.postMessage({ type: 'AGGREGATE_RESULT', payload: result });
    }
};