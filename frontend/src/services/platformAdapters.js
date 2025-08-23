/**
 * Platform Adapters
 * Each returns a normalized object:
 * {
 *   easy, medium, hard, total,
 *   badges: string[],
 *   meta: { platform, username, fetchedAt (Date ISO), extra? }
 * }
 *
 * All adapters must NEVER throw raw errors upward; they return {error} inside meta
 * (Upper layers can aggregate).
 */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const memoryCache = new Map(); // key -> { expiry, data }

/* ---------- Generic Cache Helpers ---------- */
function cacheKey(platform, username) {
    return `${platform}::${username}`.toLowerCase();
}
function getCached(platform, username) {
    const key = cacheKey(platform, username);
    const hit = memoryCache.get(key);
    if (hit && hit.expiry > Date.now()) return hit.data;
    if (hit) memoryCache.delete(key);
    try {
        const ls = localStorage.getItem('pf_cache_' + key);
        if (ls) {
            const obj = JSON.parse(ls);
            if (obj.expiry > Date.now()) {
                memoryCache.set(key, obj);
                return obj.data;
            } else {
                localStorage.removeItem('pf_cache_' + key);
            }
        }
    } catch {}
    return null;
}
function setCached(platform, username, data) {
    const key = cacheKey(platform, username);
    const pack = { expiry: Date.now() + CACHE_TTL_MS, data };
    memoryCache.set(key, pack);
    try {
        localStorage.setItem('pf_cache_' + key, JSON.stringify(pack));
    } catch {}
}

/* ---------- Normalizer ---------- */
function normalize({ platform, username, easy = 0, medium = 0, hard = 0, badges = [], extra = {}, error = null }) {
    const e = Number(easy) || 0;
    const m = Number(medium) || 0;
    const h = Number(hard) || 0;
    return {
        easy: e,
        medium: m,
        hard: h,
        total: e + m + h,
        badges: Array.isArray(badges) ? badges : [],
        meta: {
            platform,
            username,
            fetchedAt: new Date().toISOString(),
            error,
            ...extra
        }
    };
}

/* ---------- LeetCode Adapter ---------- */
export async function fetchLeetCodeStats(username) {
    const platform = 'leetcode';
    if (!username) return normalize({ platform, username, error: 'NO_USERNAME' });

    // Check cache
    const cached = getCached(platform, username);
    if (cached) return cached;

    // Combined GraphQL with badges + fallback
    const query = `
    query userProfile($username: String!) {
      allQuestionsCount { difficulty count }
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
        badges {
          displayName
        }
        profile { reputation ranking }
      }
    }
  `;

    try {
        const res = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({ query, variables: { username } }),
            credentials: 'omit'
        });
        if (!res.ok) {
            return normalize({ platform, username, error: `HTTP_${res.status}` });
        }
        const json = await res.json();
        if (json.errors || !json.data?.matchedUser) {
            return normalize({ platform, username, error: 'NOT_FOUND' });
        }
        const acArr = json.data.matchedUser.submitStats?.acSubmissionNum || [];
        const easy = acArr.find(d => d.difficulty === 'Easy')?.count || 0;
        const medium = acArr.find(d => d.difficulty === 'Medium')?.count || 0;
        const hard = acArr.find(d => d.difficulty === 'Hard')?.count || 0;

        const badges = (json.data.matchedUser.badges || []).map(b => b.displayName).slice(0, 8); // limit

        const norm = normalize({
            platform,
            username,
            easy,
            medium,
            hard,
            badges,
            extra: {
                ranking: json.data.matchedUser.profile?.ranking ?? null
            }
        });

        setCached(platform, username, norm);
        return norm;
    } catch (err) {
        return normalize({ platform, username, error: 'NETWORK_ERROR', extra: { detail: err.message } });
    }
}

/* ---------- Codeforces Adapter (Solved counts not provided) ---------- */
export async function fetchCodeforcesStats(handle) {
    const platform = 'codeforces';
    if (!handle) return normalize({ platform, username: handle, error: 'NO_USERNAME' });

    const cached = getCached(platform, handle);
    if (cached) return cached;

    try {
        const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
        const infoJson = await infoRes.json();
        if (infoJson.status !== 'OK') {
            return normalize({ platform, username: handle, error: 'NOT_FOUND' });
        }
        // We could fetch user.status and dedupe problem IDs to estimate solved, but that’s heavy (rate).
        // Returning rating-only placeholder for now.
        const rating = infoJson.result[0].rating || 0;
        const maxRating = infoJson.result[0].maxRating || rating;
        const norm = normalize({
            platform,
            username: handle,
            easy: 0,
            medium: 0,
            hard: 0,
            badges: rating ? [`Rating ${rating}`] : [],
            extra: { rating, maxRating, note: 'Solved count not exposed by public API in summary.' }
        });
        setCached(platform, handle, norm);
        return norm;
    } catch (e) {
        return normalize({ platform, username: handle, error: 'NETWORK_ERROR', extra: { detail: e.message } });
    }
}

/* ---------- GFG (Manual placeholder) ---------- */
export async function fetchGfgStats(username) {
    const platform = 'gfg';
    if (!username) return normalize({ platform, username, error: 'NO_USERNAME' });

    const cached = getCached(platform, username);
    if (cached) return cached;

    // TODO: Implement scraping or backend aggregator. Placeholder returns manual flag.
    const norm = normalize({
        platform,
        username,
        easy: 0,
        medium: 0,
        hard: 0,
        badges: [],
        extra: { manual: true, note: 'GFG live fetch not implemented' }
    });
    setCached(platform, username, norm);
    return norm;
}

/* ---------- HackerRank (Manual placeholder) ---------- */
export async function fetchHackerRankStats(username) {
    const platform = 'hackerrank';
    if (!username) return normalize({ platform, username, error: 'NO_USERNAME' });

    const cached = getCached(platform, username);
    if (cached) return cached;

    const norm = normalize({
        platform,
        username,
        easy: 0,
        medium: 0,
        hard: 0,
        badges: [],
        extra: { manual: true, note: 'HackerRank live fetch not implemented' }
    });
    setCached(platform, username, norm);
    return norm;
}

/* ---------- Aggregator ---------- */
export async function fetchAllPlatformStats(codingProfiles = {}) {
    const results = {};
    const errors = [];

    const tasks = [
        ['leetcode', fetchLeetCodeStats],
        ['codeforces', fetchCodeforcesStats],
        ['gfg', fetchGfgStats],
        ['hackerrank', fetchHackerRankStats]
    ];

    await Promise.all(tasks.map(async ([platform, fn]) => {
        const user = codingProfiles[platform];
        if (!user) return;
        const data = await fn(user);
        results[platform] = data;
        if (data.meta.error) errors.push(`${platform}: ${data.meta.error}`);
    }));

    return { results, errors };
}