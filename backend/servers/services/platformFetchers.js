const axios = require('axios');

// --- LeetCode Fetcher (Yeh pehle se hai) ---
const fetchLeetCodeData = async (username) => {
    if (!username) return null;
    try {
        const response = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`);
        // LeetCode API badges nahin bhejti, isliye humein yahan se nahin milenge
        return {
            total: response.data.totalSolved,
            easy: response.data.easySolved,
            medium: response.data.mediumSolved,
            hard: response.data.hardSolved,
            badges: [], // Yahan badges ka data API se aana chahiye
            meta: { fetchedAt: new Date() }
        };
    } catch (error) {
        return { total: 0, easy: 0, medium: 0, hard: 0, meta: { error: 'User not found', detail: error.message, fetchedAt: new Date() } };
    }
};

// --- GFG Fetcher (Yeh add karein) ---
const fetchGfgData = async (username) => {
    if (!username) return null;
    try {
        // NOTE: Yeh ek example API URL hai. Aapko GFG ke liye sahi API dhoondhni padegi.
        // const response = await axios.get(`https-gfg-api-url/${username}`);
        console.log(`Fetching GFG data for ${username} (Not Implemented Yet)`);
        // Abhi ke liye dummy data
        return { total: 50, easy: 20, medium: 25, hard: 5, badges: ["GFG Beginner"], meta: { fetchedAt: new Date() } };
    } catch (error) {
        return { total: 0, easy: 0, medium: 0, hard: 0, meta: { error: 'GFG Fetch Failed', fetchedAt: new Date() } };
    }
};

// --- Codeforces Fetcher (Yeh add karein) ---
const fetchCodeforcesData = async (username) => {
    if (!username) return null;
    try {
        // NOTE: Codeforces ki official API hai: https://codeforces.com/api/user.status
        console.log(`Fetching Codeforces data for ${username} (Not Implemented Yet)`);
        return { total: 120, easy: 40, medium: 60, hard: 20, badges: ["Specialist"], meta: { fetchedAt: new Date() } };
    } catch (error) {
        return { total: 0, easy: 0, medium: 0, hard: 0, meta: { error: 'Codeforces Fetch Failed', fetchedAt: new Date() } };
    }
};

// ... Isi tarah HackerRank ke liye bhi function banayein ...

// --- Mukhya Function Ko Update Karein ---
const syncPortfolioData = async (portfolio) => {
    const { codingProfiles } = portfolio;

    const platformsToSync = [
        // Pehle se tha
        { key: 'leetcode', fetcher: fetchLeetCodeData, username: codingProfiles.leetcode },
        // Naye platforms add karein
        { key: 'gfg', fetcher: fetchGfgData, username: codingProfiles.gfg },
        { key: 'codeforces', fetcher: fetchCodeforcesData, username: codingProfiles.codeforces },
        // { key: 'hackerrank', fetcher: fetchHackerRankData, username: codingProfiles.hackerrank },
    ];

    // ... baaki code waisa hi rahega ...

    const promises = platformsToSync
        .filter(p => p.username) // Sirf un platforms ko sync karein jinka username diya gaya hai
        .map(p => p.fetcher(p.username));

    const results = await Promise.allSettled(promises);

    let i = 0;
    platformsToSync.forEach(platform => {
        if(platform.username){
            const result = results[i];
            if (result.status === 'fulfilled' && result.value) {
                portfolio.stats[platform.key] = result.value;
            } else {
                portfolio.stats[platform.key] = {
                    total: 0, easy: 0, medium: 0, hard: 0,
                    meta: { error: 'Sync failed', fetchedAt: new Date() }
                };
            }
            i++;
        }
    });

    portfolio.updatedAt = new Date();
    await portfolio.save();
    return portfolio;
};

module.exports = { syncPortfolioData };