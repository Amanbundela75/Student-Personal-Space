// NOTE: Add real fetch logic + error handling & API tokens where required.
export async function fetchLeetCodeStats(username) {
    // GraphQL endpoint: https://leetcode.com/graphql
    const query = `query userProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } }
    }
  }`;
    const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { username } }),
        credentials: 'omit'
    });
    const data = await res.json();
    if (!data.data?.matchedUser) throw new Error('User not found');
    const arr = data.data.matchedUser.submitStats.acSubmissionNum;
    const easy = arr.find(d => d.difficulty === 'Easy')?.count || 0;
    const medium = arr.find(d => d.difficulty === 'Medium')?.count || 0;
    const hard = arr.find(d => d.difficulty === 'Hard')?.count || 0;
    return { easy, medium, hard, total: easy + medium + hard };
}

export async function fetchCodeforcesStats(handle) {
    const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const infoData = await infoRes.json();
    if (infoData.status !== 'OK') throw new Error('CF user not found');

    const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
    const ratingData = await ratingRes.json();
    let ratingHistory = [];
    if (ratingData.status === 'OK') {
        ratingHistory = ratingData.result.map(r => ({ time: r.ratingUpdateTimeSeconds * 1000, rating: r.newRating }));
    }
    return {
        rating: infoData.result[0].rating || 0,
        maxRating: infoData.result[0].maxRating || 0,
        ratingHistory
    };
}

// Placeholder manual ones:
export async function fetchGfgStats(username) {
    return { easy: 0, medium: 0, hard: 0, total: 0, manual: true };
}
export async function fetchHackerRankStats(username) {
    return { easy: 0, medium: 0, hard: 0, total: 0, manual: true };
}