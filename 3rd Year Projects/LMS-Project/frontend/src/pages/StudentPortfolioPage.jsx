import React, {
    useState,
    useEffect,
    useContext,
    useRef,
    useMemo,
    useCallback
} from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import HeatMap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {
    FaEdit,
    FaAward,
    FaCodeBranch,
    FaTimes,
    FaLinkedin,
    FaGithub,
    FaSun,
    FaMoon,
    FaShareAlt,
    FaChartPie,
    FaChartBar,
    FaExternalLinkAlt,
    FaCopy,
    FaPrint,
    FaFire,
    FaSyncAlt,
    FaBolt,
    FaLevelUpAlt
} from 'react-icons/fa';

import './StudentPortfolioPage.css';
import useLocalStorage from '../hooks/useLocalStorage';
import AnimatedNumber from '../components/AnimatedNumber';
import SkillCloud from '../components/SkillCloud';
import ComparePanel from '../components/ComparePanel';
import PdfExportButton from '../components/PdfExportButton';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
);

// Optional framer-motion fallback
let motion;
try {
    motion = require('framer-motion').motion;
} catch {
    motion = { div: (p) => <div {...p} /> };
}
const MotionDiv = motion.div;

/* --------------------------------------------------
   CONSTANTS
-------------------------------------------------- */
const PLATFORM_LIST = [
    { key: 'leetcode', name: 'LeetCode', icon: '/images/leetcode.png', color: '#f89f1b' },
    { key: 'gfg', name: 'GFG', icon: '/images/gfg.png', color: '#0f9d58' },
    { key: 'codeforces', name: 'Codeforces', icon: '/images/codeforces.png', color: '#1f8acb' },
    { key: 'hackerrank', name: 'HackerRank', icon: '/images/hackerrank.png', color: '#2ec866' }
];

const deepClone = (o) => JSON.parse(JSON.stringify(o));

/* --------------------------------------------------
   PLATFORM ADAPTERS (basic placeholders)
-------------------------------------------------- */
async function fetchLeetCodeStats(username) {
    if (!username) throw new Error('Missing LeetCode username');
    const query = `query userProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } }
    }
  }`;
    const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
        body: JSON.stringify({ query, variables: { username } }),
        credentials: 'omit'
    });
    const json = await res.json();
    const arr = json?.data?.matchedUser?.submitStats?.acSubmissionNum || [];
    const easy = arr.find(d => d.difficulty === 'Easy')?.count || 0;
    const medium = arr.find(d => d.difficulty === 'Medium')?.count || 0;
    const hard = arr.find(d => d.difficulty === 'Hard')?.count || 0;
    return { easy, medium, hard, total: easy + medium + hard, badges: [] };
}

async function fetchCodeforcesStats(handle) {
    if (!handle) throw new Error('Missing Codeforces handle');
    const info = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`).then(r => r.json());
    if (info.status !== 'OK') throw new Error('CF user not found');
    // Codeforces does not directly give solved counts via API; we skip real counts.
    return { easy: 0, medium: 0, hard: 0, total: 0, badges: [`Rating:${info.result[0].rating || 'N/A'}`] };
}

// Placeholder manual fetchers (extend later)
async function fetchGfgStats() {
    return { easy: 0, medium: 0, hard: 0, total: 0, badges: [] };
}
async function fetchHackerRankStats() {
    return { easy: 0, medium: 0, hard: 0, total: 0, badges: [] };
}

/* --------------------------------------------------
   EDIT PROFILE MODAL
-------------------------------------------------- */
const EditProfileModal = ({ portfolio, onClose, onSave }) => {
    const [formData, setFormData] = useState(() => deepClone(portfolio));
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef(null);

    const handleChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };

    // Focus trap + body scroll lock
    useEffect(() => {
        const previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';

        const previouslyFocused = document.activeElement;
        const focusable = modalRef.current?.querySelectorAll(
            'button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])'
        );

        focusable && focusable[0]?.focus();

        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Tab' && focusable && focusable.length) {
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.documentElement.style.overflow = previousOverflow;
            previouslyFocused && previouslyFocused.focus();
        };
    }, [onClose]);

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
            aria-label="Edit profile modal"
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
            >
                <div className="modal-header">
                    <h3>Edit Your Profile</h3>
                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <h4>About You</h4>
                        <label htmlFor="bio">Bio <span className="hint">(Max 250 chars)</span></label>
                        <textarea
                            id="bio"
                            name="bio"
                            maxLength={250}
                            value={formData.bio || ''}
                            onChange={handleChange}
                            placeholder="A short description..."
                        />
                        <div className="char-count">
                            {(formData.bio || '').length}/250
                        </div>

                        <h4>Social Links</h4>
                        <label htmlFor="linkedin">LinkedIn Profile URL</label>
                        <input
                            id="linkedin"
                            type="url"
                            name="linkedin"
                            value={formData.socialLinks?.linkedin || ''}
                            onChange={(e) => handleChange(e, 'socialLinks')}
                            placeholder="https://linkedin.com/in/username"
                        />

                        <label htmlFor="github">GitHub Profile URL</label>
                        <input
                            id="github"
                            type="url"
                            name="github"
                            value={formData.socialLinks?.github || ''}
                            onChange={(e) => handleChange(e, 'socialLinks')}
                            placeholder="https://github.com/username"
                        />

                        <h4>Coding Platform Usernames</h4>
                        {PLATFORM_LIST.map(p => (
                            <div className="form-group" key={p.key}>
                                <label htmlFor={p.key}>{p.name} Username</label>
                                <input
                                    id={p.key}
                                    type="text"
                                    name={p.key}
                                    value={formData.codingProfiles?.[p.key] || ''}
                                    onChange={(e) => handleChange(e, 'codingProfiles')}
                                    placeholder={`Your ${p.name} username`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="button-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="button-save" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
/* --------------------------------------------------
   Difficulty Ring
-------------------------------------------------- */
const DifficultyRing = ({ easy, medium, hard, size = 110 }) => {
    const total = Math.max(1, easy + medium + hard);
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const seg = (val) => (val / total) * circumference;
    const offsets = {
        easy: 0,
        medium: seg(easy),
        hard: seg(easy) + seg(medium)
    };
    return (
        <svg className="diff-ring" width={size} height={size} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} className="ring-bg" strokeWidth="10" />
            <circle
                cx="60" cy="60" r={radius}
                className="ring-easy"
                strokeDasharray={`${seg(easy)} ${circumference - seg(easy)}`}
                strokeDashoffset="0"
                strokeWidth="10"
            />
            <circle
                cx="60" cy="60" r={radius}
                className="ring-medium"
                strokeDasharray={`${seg(medium)} ${circumference - seg(medium)}`}
                strokeDashoffset={-offsets.medium}
                strokeWidth="10"
            />
            <circle
                cx="60" cy="60" r={radius}
                className="ring-hard"
                strokeDasharray={`${seg(hard)} ${circumference - seg(hard)}`}
                strokeDashoffset={-offsets.hard}
                strokeWidth="10"
            />
            <text x="60" y="64" textAnchor="middle" className="ring-total">
                {easy + medium + hard}
            </text>
        </svg>
    );
};

/* --------------------------------------------------
   Heatmap class
-------------------------------------------------- */
const heatClass = (v) => {
    if (!v || !v.count) return 'color-empty';
    return `level-${Math.min(v.count, 4)}`;
};

/* --------------------------------------------------
   Daily Goal Ring (SVG)
-------------------------------------------------- */
const DailyGoalRing = ({ current = 0, goal = 5 }) => {
    const pct = Math.min(1, current / goal);
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    return (
        <div className="daily-goal-ring" title={`Daily Goal: ${current}/${goal}`}>
            <svg width="70" height="70" viewBox="0 0 70 70">
                <circle
                    cx="35"
                    cy="35"
                    r={radius}
                    strokeWidth="6"
                    className="goal-bg"
                />
                <circle
                    cx="35"
                    cy="35"
                    r={radius}
                    strokeWidth="6"
                    className="goal-progress"
                    strokeDasharray={`${pct * circumference} ${circumference - pct * circumference}`}
                    strokeDashoffset="0"
                />
                <text x="35" y="39" textAnchor="middle" className="goal-text">
                    {Math.round(pct * 100)}%
                </text>
            </svg>
            <span className="goal-caption">Daily Goal</span>
        </div>
    );
};

/* --------------------------------------------------
   Lazy Bar Chart
-------------------------------------------------- */
const BarLazy = ({ data }) => {
    const ref = useRef(null);
    const [Comp, setComp] = useState(null);
    useEffect(() => {
        let mount = true;
        import('react-chartjs-2').then(m => {
            if (mount) setComp(() => m.Bar);
        });
        return () => { mount = false; };
    }, []);
    if (!Comp) return <div className="bar-loading">Loading chart...</div>;
    return (
        <Comp
            ref={ref}
            data={data}
            options={{
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } },
                scales: { y: { beginAtZero: true } }
            }}
        />
    );
};

/* --------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------- */
const StudentPortfolioPage = () => {
    const { currentUser } = useContext(AuthContext);
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [darkMode, setDarkMode] = useLocalStorage('portfolio_darkmode', false);
    const [activeTab, setActiveTab] = useState('overview'); // overview | platforms | badges | activity | compare | skills
    const [chartVariant, setChartVariant] = useState('doughnut');
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Simulated initial fetch
    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => {
            setPortfolio({
                bio: 'A passionate full-stack developer and competitive programmer.',
                socialLinks: { linkedin: 'https://linkedin.com/in/aman', github: 'https://github.com/aman' },
                codingProfiles: {
                    leetcode: 'aman_bundela',
                    gfg: 'aman_gfg',
                    codeforces: 'aman_cf',
                    hackerrank: 'aman_hr'
                },
                stats: {
                    leetcode: { easy: 60, medium: 165, hard: 42, total: 267, badges: ['Python', 'SQL'] },
                    gfg: { easy: 80, medium: 120, hard: 30, total: 230, badges: ['Java', 'Arrays'] },
                    codeforces: { easy: 25, medium: 50, hard: 10, total: 85, badges: ['Div2', 'Specialist'] },
                    hackerrank: { easy: 40, medium: 60, hard: 5, total: 105, badges: ['Problem Solving'] }
                },
                streakValues: [
                    { date: '2025-08-09', count: 4 },
                    { date: '2025-08-08', count: 5 },
                    { date: '2025-08-07', count: 2 },
                    { date: '2025-08-06', count: 1 },
                    { date: '2025-07-26', count: 3 },
                    { date: '2025-07-25', count: 2 },
                    { date: '2025-07-15', count: 4 },
                    { date: '2025-07-05', count: 1 }
                ]
            });
            setLoading(false);
        }, 650);
        return () => clearTimeout(t);
    }, []);

    // Apply dark mode
    useEffect(() => {
        const cls = 'portfolio-dark';
        if (darkMode) document.documentElement.classList.add(cls);
        else document.documentElement.classList.remove(cls);
    }, [darkMode]);

    const handleSavePortfolio = async (data) => {
        setPortfolio(data);
    };

    const stats = portfolio?.stats;
    const totalProblems = useMemo(
        () => stats ? Object.values(stats).reduce((a, p) => a + (p.total || 0), 0) : 0,
        [stats]
    );
    const sumDifficulty = useCallback(
        (k) => stats ? Object.values(stats).reduce((a, p) => a + (p[k] || 0), 0) : 0,
        [stats]
    );

    /* XP + Level */
    const xp = useMemo(() => {
        const easy = sumDifficulty('easy');
        const medium = sumDifficulty('medium');
        const hard = sumDifficulty('hard');
        return easy * 10 + medium * 25 + hard * 60;
    }, [sumDifficulty]);

    const level = useMemo(() => Math.floor(Math.sqrt(xp / 50)) + 1, [xp]);
    const nextLevelXP = (Math.pow(level, 2) * 50);
    const prevLevelXP = (Math.pow(level - 1, 2) * 50);
    const levelPct = ((xp - prevLevelXP) / Math.max(1, nextLevelXP - prevLevelXP));

    /* Daily goal progress (use latest streak date) */
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = portfolio?.streakValues?.find(v => v.date === today);
    const todaySolved = todayEntry?.count || 0;
    const DAILY_GOAL = 5;

    /* Combined Charts */
    const combinedDoughnutData = useMemo(() => ({
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
            data: [sumDifficulty('easy'), sumDifficulty('medium'), sumDifficulty('hard')],
            backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
            borderWidth: 2
        }]
    }), [sumDifficulty]);

    const combinedBarData = useMemo(() => ({
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: PLATFORM_LIST.map(p => ({
            label: p.name,
            data: [
                stats?.[p.key]?.easy || 0,
                stats?.[p.key]?.medium || 0,
                stats?.[p.key]?.hard || 0
            ],
            backgroundColor: p.color + 'cc'
        }))
    }), [stats]);

    const chartOptions = {
        maintainAspectRatio: true,
        plugins: {
            legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 14 } }
        },
        responsive: true,
        cutout: '68%'
    };

    /* Share / Copy / Print */
    const shareProfile = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: 'My Coding Portfolio', url }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url);
            alert('Profile link copied!');
        }
    };
    const copyProfile = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard.');
    };
    const printPortfolio = () => window.print();

    /* Live Sync */
    const syncLiveStats = async () => {
        if (!portfolio) return;
        setSyncing(true);
        setErrorMsg('');
        try {
            const cp = portfolio.codingProfiles || {};
            const newStats = { ...portfolio.stats };

            // Each fetch protected by try/catch so one failure won't break others
            if (cp.leetcode) {
                try {
                    const lc = await fetchLeetCodeStats(cp.leetcode);
                    newStats.leetcode = { ...newStats.leetcode, ...lc };
                } catch (e) {
                    console.warn('LeetCode fetch failed', e);
                }
            }
            if (cp.codeforces) {
                try {
                    const cf = await fetchCodeforcesStats(cp.codeforces);
                    newStats.codeforces = { ...newStats.codeforces, ...cf };
                } catch (e) {
                    console.warn('CF fetch failed', e);
                }
            }
            if (cp.gfg) {
                // placeholder manual logic
                try {
                    const g = await fetchGfgStats(cp.gfg);
                    newStats.gfg = { ...newStats.gfg, ...g };
                } catch {}
            }
            if (cp.hackerrank) {
                try {
                    const hr = await fetchHackerRankStats(cp.hackerrank);
                    newStats.hackerrank = { ...newStats.hackerrank, ...hr };
                } catch {}
            }

            // recalc totals if missing
            Object.keys(newStats).forEach(k => {
                const s = newStats[k];
                if (s) s.total = (s.easy || 0) + (s.medium || 0) + (s.hard || 0);
            });

            setPortfolio(prev => ({ ...prev, stats: newStats }));
            setLastSync(new Date());
        } catch (err) {
            setErrorMsg(err.message || 'Sync failed');
        } finally {
            setSyncing(false);
        }
    };

    /* Derived badge list */
    const allBadges = stats
        ? Object.entries(stats).flatMap(([platformKey, data]) =>
            (data.badges || []).map((badge, i) => ({
                platform: platformKey,
                badge,
                id: platformKey + '-' + i
            }))
        )
        : [];

    /* Activity timeline (demo) */
    const activityTimeline = [
        { date: '2025-08-09', event: 'Solved 4 problems (2 Medium, 2 Easy) on LeetCode' },
        { date: '2025-08-08', event: 'Solved 5 problems on GFG' },
        { date: '2025-08-07', event: 'Earned badge "SQL" on LeetCode' },
        { date: '2025-08-06', event: 'Participated in Codeforces contest' }
    ];

    const userInitials = `${currentUser?.user?.firstName?.[0] || 'U'}${currentUser?.user?.lastName?.[0] || ''}`;

    /* Skills (demo) */
    const skillData = [
        { name: 'DP', count: 28 },
        { name: 'Graphs', count: 22 },
        { name: 'Arrays', count: 54 },
        { name: 'Strings', count: 42 },
        { name: 'Math', count: 18 },
        { name: 'Trees', count: 26 },
        { name: 'Hashing', count: 21 },
        { name: 'Greedy', count: 19 }
    ];

    /* Previous period (mock) for compare */
    const prevCompare = {
        easy: Math.round(sumDifficulty('easy') * 0.8),
        medium: Math.round(sumDifficulty('medium') * 0.75),
        hard: Math.round(sumDifficulty('hard') * 0.7),
        total: Math.round(totalProblems * 0.78)
    };
    const currentCompare = {
        easy: sumDifficulty('easy'),
        medium: sumDifficulty('medium'),
        hard: sumDifficulty('hard'),
        total: totalProblems
    };

    /* Loading skeleton */
    if (loading) {
        return (
            <div className="portfolio-wrapper">
                <div className="skeleton-layout">
                    <div className="skeleton-card big shimmer" />
                    <div className="skeleton-grid">
                        <div className="skeleton-card shimmer" />
                        <div className="skeleton-card shimmer" />
                        <div className="skeleton-card shimmer" />
                        <div className="skeleton-card shimmer" />
                    </div>
                    <div className="skeleton-wide shimmer" />
                </div>
            </div>
        );
    }

    if (!portfolio) {
        return <div className="portfolio-wrapper"><h2 style={{ textAlign: 'center' }}>Unable to load portfolio.</h2></div>;
    }

    return (
        <div className="portfolio-wrapper">
            <MotionDiv
                className="portfolio-header-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="header-left">
                    <div className="avatar-outer">
                        <div className="avatar-big">{userInitials}</div>
                        <span className="streak-label" title="Total streak entries">
              <FaFire /> {portfolio.streakValues?.length || 0} entries
            </span>
                        <DailyGoalRing current={todaySolved} goal={DAILY_GOAL} />
                    </div>
                    <div className="user-meta">
                        <h1>{currentUser?.user?.firstName} {currentUser?.user?.lastName}</h1>
                        <p className="email">{currentUser?.user?.email}</p>
                        <p className="bio-text">{portfolio.bio}</p>

                        <div className="xp-level-wrapper">
                            <div className="level-chip" title={`XP: ${xp.toLocaleString()}`}>
                                <FaLevelUpAlt /> Level {level}
                            </div>
                            <div className="level-progress-bar">
                                <div className="fill" style={{ width: `${(levelPct * 100).toFixed(1)}%` }} />
                            </div>
                            <small className="next-level">Next Level: {Math.max(0, nextLevelXP - xp)} XP</small>
                        </div>

                        <div className="social-buttons">
                            {portfolio.socialLinks?.github && (
                                <a href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer">
                                    <FaGithub /> <span>GitHub</span> <FaExternalLinkAlt className="ext" />
                                </a>
                            )}
                            {portfolio.socialLinks?.linkedin && (
                                <a href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                                    <FaLinkedin /> <span>LinkedIn</span> <FaExternalLinkAlt className="ext" />
                                </a>
                            )}
                        </div>

                        <div className="header-actions">
                            <button className="btn outline" onClick={() => setIsModalOpen(true)}>
                                <FaEdit /> Edit
                            </button>
                            <button className="btn subtle" onClick={shareProfile}>
                                <FaShareAlt /> Share
                            </button>
                            <button className="btn subtle" onClick={copyProfile}>
                                <FaCopy /> Copy Link
                            </button>
                            <PdfExportButton />
                            <button className="btn subtle" onClick={printPortfolio}>
                                <FaPrint /> Print
                            </button>
                            <button
                                className="btn subtle"
                                onClick={syncLiveStats}
                                disabled={syncing}
                                title="Live Sync (LeetCode / Codeforces)"
                            >
                                <FaSyncAlt className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing' : 'Sync'}
                            </button>
                            <button
                                className="btn toggle"
                                onClick={() => setDarkMode(d => !d)}
                                aria-label="Toggle theme"
                            >
                                {darkMode ? <FaSun /> : <FaMoon />}
                            </button>
                        </div>
                        {lastSync && <small className="last-sync">Last Sync: {lastSync.toLocaleTimeString()}</small>}
                        {errorMsg && <small className="error-msg">{errorMsg}</small>}
                    </div>
                </div>

                <div className="header-right">
                    <div className="total-solves-card">
                        <h3>Total Solved</h3>
                        <AnimatedNumber value={totalProblems} className="total-number" />
                        <div className="total-breakdown">
                            <span className="easy-dot">Easy: {sumDifficulty('easy')}</span>
                            <span className="med-dot">Medium: {sumDifficulty('medium')}</span>
                            <span className="hard-dot">Hard: {sumDifficulty('hard')}</span>
                        </div>
                    </div>
                    <div className="global-chart-switch">
                        <div className="switch-buttons">
                            <button
                                className={chartVariant === 'doughnut' ? 'active' : ''}
                                onClick={() => setChartVariant('doughnut')}
                            >
                                <FaChartPie />
                            </button>
                            <button
                                className={chartVariant === 'bar' ? 'active' : ''}
                                onClick={() => setChartVariant('bar')}
                            >
                                <FaChartBar />
                            </button>
                        </div>
                        <div className="chart-stub">
                            {chartVariant === 'doughnut' ? (
                                <Doughnut data={combinedDoughnutData} options={chartOptions} />
                            ) : (
                                <div className="bar-wrapper">
                                    <BarLazy data={combinedBarData} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </MotionDiv>

            {/* Tabs */}
            <div className="tabs-bar">
                {['overview', 'platforms', 'badges', 'activity', 'compare', 'skills'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="tab-panels">
                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                    <MotionDiv
                        className="panel-grid"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {stats && PLATFORM_LIST.map(p => {
                            const s = stats[p.key];
                            if (!s) return null;
                            return (
                                <div className="platform-card" key={p.key}>
                                    <div className="platform-card-header">
                                        <img src={p.icon} alt={p.name} className="platform-icon-lg" />
                                        <h4>{p.name}</h4>
                                    </div>
                                    <DifficultyRing easy={s.easy} medium={s.medium} hard={s.hard} />
                                    <div className="platform-stats">
                                        <div className="line">
                                            <span>Easy</span><strong>{s.easy}</strong>
                                        </div>
                                        <div className="line">
                                            <span>Medium</span><strong>{s.medium}</strong>
                                        </div>
                                        <div className="line">
                                            <span>Hard</span><strong>{s.hard}</strong>
                                        </div>
                                        <div className="sep" />
                                        <div className="line total">
                                            <span>Total</span>
                                            <strong><AnimatedNumber value={s.total} /></strong>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </MotionDiv>
                )}

                {/* PLATFORMS */}
                {activeTab === 'platforms' && (
                    <MotionDiv
                        className="panel-platform-charts"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {stats && PLATFORM_LIST.map(p => {
                            const s = stats[p.key];
                            if (!s) return null;
                            const data = {
                                labels: ['Easy', 'Medium', 'Hard'],
                                datasets: [{
                                    data: [s.easy, s.medium, s.hard],
                                    backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
                                    borderWidth: 2
                                }]
                            };
                            return (
                                <div className="mini-chart-card" key={p.key}>
                                    <div className="title-row">
                                        <img src={p.icon} alt={p.name} />
                                        <h5>{p.name}</h5>
                                    </div>
                                    <Doughnut
                                        data={data}
                                        options={{
                                            ...chartOptions,
                                            plugins: { ...chartOptions.plugins, legend: { display: false } }
                                        }}
                                    />
                                    <div className="mini-total">
                                        Total <strong>{s.total}</strong>
                                    </div>
                                </div>
                            );
                        })}
                    </MotionDiv>
                )}

                {/* BADGES */}
                {activeTab === 'badges' && (
                    <MotionDiv
                        className="panel-badges"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3><FaAward /> Badges & Achievements</h3>
                        <div className="badges-flex">
                            {allBadges.map(b => {
                                const platform = PLATFORM_LIST.find(p => p.key === b.platform);
                                return (
                                    <div className="badge-chip" key={b.id}>
                                        <img src={platform.icon} alt={platform.name} />
                                        <span>{b.badge}</span>
                                    </div>
                                );
                            })}
                            {allBadges.length === 0 && <p>No badges yet.</p>}
                        </div>
                    </MotionDiv>
                )}

                {/* ACTIVITY */}
                {activeTab === 'activity' && (
                    <MotionDiv
                        className="panel-activity"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="heatmap-wrapper">
                            <h3><FaCodeBranch /> Coding Streaks</h3>
                            <HeatMap
                                startDate={new Date(new Date().setMonth(new Date().getMonth() - 6))}
                                endDate={new Date()}
                                values={portfolio.streakValues || []}
                                squareSize={13}
                                gutterSize={3}
                                classForValue={heatClass}
                                showWeekdayLabels={true}
                                titleForValue={(v) => v?.date ? `${v.date} – ${v.count} submission(s)` : 'No activity'}
                            />
                            <div className="legend">
                                <span>Less</span>
                                <div className="legend-box level-1" />
                                <div className="legend-box level-2" />
                                <div className="legend-box level-3" />
                                <div className="legend-box level-4" />
                                <span>More</span>
                            </div>
                        </div>
                        <div className="timeline">
                            <h3>Recent Activity</h3>
                            <ul className="timeline-list">
                                {activityTimeline.map(item => (
                                    <li key={item.date}>
                                        <div className="dot" />
                                        <div className="content">
                                            <time>{item.date}</time>
                                            <p>{item.event}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </MotionDiv>
                )}

                {/* COMPARE */}
                {activeTab === 'compare' && (
                    <MotionDiv
                        className="panel-badges"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3><FaBolt /> Period Comparison</h3>
                        <ComparePanel current={currentCompare} previous={prevCompare} />
                    </MotionDiv>
                )}

                {/* SKILLS */}
                {activeTab === 'skills' && (
                    <MotionDiv
                        className="panel-badges"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3>Skill Cloud</h3>
                        <SkillCloud skills={skillData} />
                    </MotionDiv>
                )}
            </div>

            {isModalOpen && (
                <EditProfileModal
                    portfolio={portfolio}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSavePortfolio}
                />
            )}
        </div>
    );
};

export default StudentPortfolioPage;