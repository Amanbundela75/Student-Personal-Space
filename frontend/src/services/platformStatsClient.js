/* Robust client with:
   - Optional explicit base via VITE_PLATFORM_API
   - One attempt + (optional) fallback
   - Distinguish 404 (server missing) vs other errors
   - Returns { stats, errors } OR throws error with code
*/
const explicitBase = import.meta.env.VITE_PLATFORM_API?.trim();
const CTRL_HEADER = { 'Content-Type': 'application/json' };

function resolveBase() {
    if (explicitBase) return explicitBase.replace(/\/$/, '');
    return window.location.origin;
}

async function httpJSON(url, bodyObj) {
    const res = await fetch(url, {
        method: 'POST',
        headers: CTRL_HEADER,
        body: JSON.stringify(bodyObj || {})
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err = new Error(`HTTP_${res.status}`);
        err.status = res.status;
        err.payload = text;
        throw err;
    }
    return res.json();
}

export async function fetchPlatformStats(codingProfiles) {
    const base = resolveBase();
    const primary = `${base}/api/platform-stats`;
    try {
        return await httpJSON(primary, { codingProfiles });
    } catch (e) {
        // If explicit base used and fails AND not same-origin, optionally try same-origin proxy
        if (explicitBase && base !== window.location.origin) {
            try {
                const fallback = `${window.location.origin}/api/platform-stats`;
                return await httpJSON(fallback, { codingProfiles });
            } catch (e2) {
                e.message += ` | fallback:${e2.message}`;
            }
        }
        // Attach a code to interpret upstream
        if (e.status === 404) e.code = 'BACKEND_NOT_FOUND';
        else if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) e.code = 'NETWORK';
        else e.code = 'BACKEND_ERROR';
        throw e;
    }
}