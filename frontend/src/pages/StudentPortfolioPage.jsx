import React, {
    useState,
    useEffect,
    useContext,
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
    FaEdit, FaAward, FaCodeBranch, FaTimes, FaLinkedin, FaGithub, FaSun, FaMoon,
    FaShareAlt, FaChartPie, FaChartBar, FaExternalLinkAlt, FaCopy, FaPrint,
    FaFire, FaSyncAlt, FaBolt, FaLevelUpAlt, FaInfoCircle, FaDownload, FaClipboard
} from 'react-icons/fa';

import useLocalStorage from '../hooks/useLocalStorage';
import usePortfolio from '../hooks/usePortfolio';
import AnimatedNumber from '../components/AnimatedNumber';
import SkillCloud from '../components/SkillCloud';
import ComparePanel from '../components/ComparePanel';
import PdfExportButton from '../components/PdfExportButton';
import './StudentPortfolioPage.css';

/* ----------------------------------------------------------------
  ChartJS registration
------------------------------------------------------------------ */
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

/* ----------------------------------------------------------------
  Motion fallback
------------------------------------------------------------------ */
let motion;
try { motion = require('framer-motion').motion; } catch { motion = { div: (p) => <div {...p} /> }; }
const MotionDiv = motion.div;

/* ----------------------------------------------------------------
  Platforms Meta
------------------------------------------------------------------ */
const PLATFORM_LIST = [
    { key: 'leetcode', name: 'LeetCode', icon: '/images/leetcode.png', color: '#f89f1b' },
    { key: 'gfg', name: 'GFG', icon: '/images/gfg.png', color: '#0f9d58' },
    { key: 'codeforces', name: 'Codeforces', icon: '/images/codeforces.png', color: '#1f8acb' },
    { key: 'hackerrank', name: 'HackerRank', icon: '/images/hackerrank.png', color: '#2ec866' }
];

/* ----------------------------------------------------------------
  Difficulty Ring (same logic)
------------------------------------------------------------------ */
const DifficultyRing = ({ easy = 0, medium = 0, hard = 0 }) => {
    const total = Math.max(1, easy + medium + hard);
    const r = 52;
    const C = 2 * Math.PI * r;
    const seg = v => (v / total) * C;
    const offMedium = seg(easy);
    const offHard = seg(easy) + seg(medium);
    return (
        <svg className="diff-ring" width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} className="ring-bg" strokeWidth="10" />
            <circle cx="60" cy="60" r={r} strokeWidth="10" className="ring-easy"
                    strokeDasharray={`${seg(easy)} ${C - seg(easy)}`}/>
            <circle cx="60" cy="60" r={r} strokeWidth="10" className="ring-medium"
                    strokeDasharray={`${seg(medium)} ${C - seg(medium)}`}
                    strokeDashoffset={-offMedium}/>
            <circle cx="60" cy="60" r={r} strokeWidth="10" className="ring-hard"
                    strokeDasharray={`${seg(hard)} ${C - seg(hard)}`}
                    strokeDashoffset={-offHard}/>
            <text x="60" y="64" textAnchor="middle" className="ring-total">
                {easy + medium + hard}
            </text>
        </svg>
    );
};

/* ----------------------------------------------------------------
  Heatmap color class
------------------------------------------------------------------ */
const heatClass = v => !v || !v.count ? 'color-empty' : `level-${Math.min(v.count, 4)}`;

/* ----------------------------------------------------------------
  Daily Goal Ring
------------------------------------------------------------------ */
const DailyGoalRing = ({ current = 0, goal = 5 }) => {
    const pct = Math.min(1, current / goal);
    const radius = 26;
    const C = 2 * Math.PI * radius;
    return (
        <div className="daily-goal-ring">
            <svg width="70" height="70" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r={radius} strokeWidth="6" className="goal-bg" />
                <circle cx="35" cy="35" r={radius} strokeWidth="6"
                        className="goal-progress"
                        strokeDasharray={`${pct * C} ${C - pct * C}`}/>
                <text x="35" y="39" textAnchor="middle" className="goal-text">
                    {Math.round(pct * 100)}%
                </text>
            </svg>
            <span className="goal-caption">Daily</span>
        </div>
    );
};

/* ----------------------------------------------------------------
  Lazy Bar Chart
------------------------------------------------------------------ */
const BarLazy = ({ data }) => {
    const [Comp, setComp] = useState(null);
    useEffect(() => { import('react-chartjs-2').then(m => setComp(() => m.Bar)); }, []);
    if (!Comp) return <div className="bar-loading">Loading..</div>;
    return (
        <Comp
            data={data}
            options={{
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } },
                scales: { y: { beginAtZero: true } }
            }}
        />
    );
};

/* ----------------------------------------------------------------
  Platform Stat Card (Extracted)
------------------------------------------------------------------ */
const PlatformStatCard = ({ platformMeta, stat }) => {
    if (!stat) {
        return (
            <div className="platform-card empty">
                <div className="platform-card-header">
                    <img src={platformMeta.icon} alt={platformMeta.name} className="platform-icon-lg" />
                    <h4>{platformMeta.name}</h4>
                </div>
                <div className="empty-platform-hint">
                    <p>Add username to fetch stats.</p>
                </div>
            </div>
        );
    }
    return (
        <div className={`platform-card ${stat.meta?.error ? 'has-error' : ''}`}>
            <div className="platform-card-header">
                <img src={platformMeta.icon} alt={platformMeta.name} className="platform-icon-lg" />
                <h4>{platformMeta.name}</h4>
            </div>
            <DifficultyRing easy={stat.easy} medium={stat.medium} hard={stat.hard} />
            <div className="platform-stats">
                <div className="line"><span>Easy</span><strong>{stat.easy}</strong></div>
                <div className="line"><span>Medium</span><strong>{stat.medium}</strong></div>
                <div className="line"><span>Hard</span><strong>{stat.hard}</strong></div>
                <div className="sep" />
                <div className="line total"><span>Total</span><strong><AnimatedNumber value={stat.total} /></strong></div>
                {Boolean(stat.badges?.length) && (
                    <div className="mini-badges">
                        {stat.badges.slice(0,3).map(b => <span key={b}>{b}</span>)}
                        {stat.badges.length > 3 && <span className="more">+{stat.badges.length - 3}</span>}
                    </div>
                )}
                {stat.meta?.error && (
                    <div className="stat-error" title={stat.meta?.error + (stat.meta?.detail ? (' : ' + stat.meta.detail) : '')}>
                        <FaInfoCircle /> {stat.meta.error}
                    </div>
                )}
                {!stat.meta?.error && stat.meta?.fetchedAt && (
                    <div className="stat-fetched-at">
                        Updated {new Date(stat.meta.fetchedAt).toLocaleTimeString()}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ----------------------------------------------------------------
  Inline Modal
------------------------------------------------------------------ */
const EditProfileModal = ({ portfolio, onClose, onSave }) => {
    const [form, setForm] = useState(() => JSON.parse(JSON.stringify(portfolio)));
    const [saving, setSaving] = useState(false);

    const handle = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setForm(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(form);
        setSaving(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <form className="modal-form" onSubmit={submit}>
                    <div className="modal-header">
                        <h3>Edit Your Profile</h3>
                        <button type="button" className="close-btn" onClick={onClose}><FaTimes /></button>
                    </div>
                    <div className="modal-body">
                        <h4>About You</h4>
                        <label>Bio</label>
                        <textarea name="bio" maxLength={250} value={form.bio || ''} onChange={handle} />
                        <div className="char-inline">{(form.bio || '').length}/250</div>

                        <h4>Social Links</h4>
                        <label>LinkedIn</label>
                        <input name="linkedin" type="url" value={form.socialLinks?.linkedin || ''} onChange={(e) => handle(e, 'socialLinks')} />
                        <label>GitHub</label>
                        <input name="github" type="url" value={form.socialLinks?.github || ''} onChange={(e) => handle(e, 'socialLinks')} />

                        <h4>Platform Usernames</h4>
                        {PLATFORM_LIST.map(p => (
                            <div key={p.key} className="form-group">
                                <label>{p.name}</label>
                                <input
                                    name={p.key}
                                    placeholder={`${p.name} username`}
                                    value={form.codingProfiles?.[p.key] || ''}
                                    onChange={(e) => handle(e, 'codingProfiles')}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="button-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button-save" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ----------------------------------------------------------------
  Main Component
------------------------------------------------------------------ */
const StudentPortfolioPage = () => {
    const { currentUser } = useContext(AuthContext);
    const {
        portfolio,
        loading,
        syncing,
        lastSync,
        error,
        savePortfolio,
        manualSync
    } = usePortfolio();

    const [darkMode, setDarkMode] = useLocalStorage('portfolio_darkmode', false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [chartVariant, setChartVariant] = useState('doughnut');
    const [showRawJson, setShowRawJson] = useState(false);

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('portfolio-dark');
        else document.documentElement.classList.remove('portfolio-dark');
    }, [darkMode]);

    const stats = portfolio?.stats || {};
    const sum = useCallback(
        (key) => Object.values(stats).reduce((acc, s) => acc + (s?.[key] || 0), 0),
        [stats]
    );

    const totalProblems = sum('total');
    const xp = sum('easy') * 10 + sum('medium') * 25 + sum('hard') * 60;
    const level = Math.floor(Math.sqrt(xp / 50)) + 1;
    const nextLevelXP = Math.pow(level, 2) * 50;
    const prevLevelXP = Math.pow(level - 1, 2) * 50;
    const levelPct = (xp - prevLevelXP) / Math.max(1, nextLevelXP - prevLevelXP);
    const today = new Date().toISOString().slice(0, 10);
    const todaySolved = portfolio?.streakValues?.find(v => v.date === today)?.count || 0;

    /* Charts */
    const combinedDoughnutData = useMemo(() => ({
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
            data: [sum('easy'), sum('medium'), sum('hard')],
            backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
            borderWidth: 2
        }]
    }), [sum]);

    const combinedBarData = useMemo(() => ({
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: PLATFORM_LIST.map(p => ({
            label: p.name,
            data: [
                stats[p.key]?.easy || 0,
                stats[p.key]?.medium || 0,
                stats[p.key]?.hard || 0
            ],
            backgroundColor: (stats[p.key]?.meta?.error ? '#999' : p.color) + 'cc'
        }))
    }), [stats]);

    const chartOptions = {
        maintainAspectRatio: true,
        plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true } } },
        responsive: true,
        cutout: '65%'
    };

    /* Actions */
    const share = () => {
        const url = window.location.href;
        if (navigator.share) navigator.share({ title: 'My Coding Portfolio', url }).catch(() => {});
        else { navigator.clipboard.writeText(url); alert('Link copied!'); }
    };
    const copy = () => { navigator.clipboard.writeText(window.location.href); alert('Copied'); };
    const printPort = () => window.print();
    const downloadJSON = () => {
        const blob = new Blob([JSON.stringify(portfolio, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'portfolio_stats.json';
        a.click();
    };
    const copyStats = () => {
        navigator.clipboard.writeText(JSON.stringify(portfolio.stats, null, 2));
        alert('Stats JSON copied.');
    };

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
    if (!portfolio) return <div className="portfolio-wrapper"><h2>Unable to load</h2></div>;

    const initials = `${currentUser?.user?.firstName?.[0] || 'U'}${currentUser?.user?.lastName?.[0] || ''}`;

    const allBadges = Object.values(stats).flatMap(s => (s?.badges || []).map((b, i) => ({
        text: b,
        id: (s.meta?.platform || 'pf') + '-' + i,
        platform: s.meta?.platform
    })));

    const skillData = [
        { name: 'DP', count: 28 }, { name: 'Graphs', count: 22 }, { name: 'Arrays', count: 54 },
        { name: 'Strings', count: 42 }, { name: 'Math', count: 18 }
    ];

    const prevCompare = {
        easy: Math.round(sum('easy') * 0.8),
        medium: Math.round(sum('medium') * 0.75),
        hard: Math.round(sum('hard') * 0.7),
        total: Math.round(totalProblems * 0.78)
    };
    const currentCompare = {
        easy: sum('easy'),
        medium: sum('medium'),
        hard: sum('hard'),
        total: totalProblems
    };

    return (
        <div className="portfolio-wrapper">
            <MotionDiv className="portfolio-header-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                <div className="header-left">
                    <div className="avatar-outer">
                        <div className="avatar-big">{initials}</div>
                        <span className="streak-label"><FaFire /> {portfolio.streakValues?.length || 0} entries</span>
                        <DailyGoalRing current={todaySolved} goal={5} />
                    </div>
                    <div className="user-meta">
                        <h1>{currentUser?.user?.firstName} {currentUser?.user?.lastName}</h1>
                        <p className="email">{currentUser?.user?.email}</p>
                        <p className="bio-text">{portfolio.bio}</p>

                        <div className="xp-level-wrapper">
                            <div className="level-chip"><FaLevelUpAlt /> Level {level}</div>
                            <div className="level-progress-bar"><div className="fill" style={{ width: `${(levelPct * 100).toFixed(1)}%` }} /></div>
                            <small className="next-level">Next: {Math.max(0, nextLevelXP - xp)} XP</small>
                        </div>

                        <div className="social-buttons">
                            {portfolio.socialLinks?.github && <a href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer"><FaGithub /> GitHub <FaExternalLinkAlt className="ext" /></a>}
                            {portfolio.socialLinks?.linkedin && <a href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /> LinkedIn <FaExternalLinkAlt className="ext" /></a>}
                        </div>

                        <div className="header-actions">
                            <button className="btn outline" onClick={() => setIsModalOpen(true)}><FaEdit /> Edit</button>
                            <button className="btn subtle" onClick={share}><FaShareAlt /> Share</button>
                            <button className="btn subtle" onClick={copy}><FaCopy /> Copy</button>
                            <PdfExportButton />
                            <button className="btn subtle" onClick={printPort}><FaPrint /> Print</button>
                            <button className="btn subtle" disabled={syncing} onClick={manualSync}>
                                <FaSyncAlt className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing...' : 'Sync'}
                            </button>
                            <button className="btn subtle" onClick={downloadJSON}><FaDownload /> JSON</button>
                            <button className="btn subtle" onClick={() => { setShowRawJson(r => !r); }}><FaClipboard /> Raw</button>
                            <button className="btn toggle" onClick={() => setDarkMode(d => !d)}>{darkMode ? <FaSun /> : <FaMoon />}</button>
                        </div>
                        {lastSync && <small className="last-sync">Last sync: {lastSync.toLocaleTimeString()}</small>}
                        {error && <small className="error-msg">{error}</small>}
                    </div>
                </div>
                <div className="header-right">
                    <div className="total-solves-card">
                        <h3>Total Solved</h3>
                        <AnimatedNumber value={totalProblems} className="total-number" />
                        <div className="total-breakdown">
                            <span>Easy: {sum('easy')}</span>
                            <span>Medium: {sum('medium')}</span>
                            <span>Hard: {sum('hard')}</span>
                        </div>
                    </div>
                    <div className="global-chart-switch">
                        <div className="switch-buttons">
                            <button className={chartVariant === 'doughnut' ? 'active' : ''} onClick={() => setChartVariant('doughnut')}><FaChartPie /></button>
                            <button className={chartVariant === 'bar' ? 'active' : ''} onClick={() => setChartVariant('bar')}><FaChartBar /></button>
                        </div>
                        <div className="chart-stub">
                            {chartVariant === 'doughnut'
                                ? <Doughnut data={combinedDoughnutData} options={chartOptions} />
                                : <div className="bar-wrapper"><BarLazy data={combinedBarData} /></div>}
                        </div>
                        {syncing && <div className="inline-sync-note">Fetching latest platform stats...</div>}
                    </div>
                </div>
            </MotionDiv>

            {/* RAW JSON TOGGLE */}
            {showRawJson && (
                <div className="raw-json-box">
                    <pre>{JSON.stringify(stats, null, 2)}</pre>
                    <button className="btn tiny" onClick={copyStats}><FaClipboard /> Copy JSON</button>
                </div>
            )}

            <div className="tabs-bar">
                {['overview', 'platforms', 'badges', 'activity', 'compare', 'skills'].map(tab => (
                    <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="tab-panels">
                {/* Overview */}
                {activeTab === 'overview' && (
                    <MotionDiv className="panel-grid" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                        {PLATFORM_LIST.map(p => (
                            <PlatformStatCard
                                key={p.key}
                                platformMeta={p}
                                stat={stats[p.key]}
                            />
                        ))}
                    </MotionDiv>
                )}

                {/* Platforms (per platform chart) */}
                {activeTab === 'platforms' && (
                    <MotionDiv className="panel-platform-charts" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                        {PLATFORM_LIST.map(p => {
                            const s = stats[p.key];
                            if (!s) {
                                return (
                                    <div className="mini-chart-card empty" key={p.key}>
                                        <div className="title-row"><img src={p.icon} alt="" /><h5>{p.name}</h5></div>
                                        <div className="no-username">No data – add username</div>
                                    </div>
                                );
                            }
                            const data = {
                                labels: ['Easy', 'Medium', 'Hard'],
                                datasets: [{
                                    data: [s.easy, s.medium, s.hard],
                                    backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
                                    borderWidth: 1.5
                                }]
                            };
                            return (
                                <div className={`mini-chart-card ${s.meta?.error ? 'err' : ''}`} key={p.key}>
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
                                    <div className="mini-total">Total <strong>{s.total}</strong></div>
                                    {s.meta?.error && <small className="stat-error small">Err: {s.meta.error}</small>}
                                </div>
                            );
                        })}
                    </MotionDiv>
                )}

                {/* Badges */}
                {activeTab === 'badges' && (
                    <MotionDiv className="panel-badges" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                        <h3><FaAward /> Badges & Achievements</h3>
                        <div className="badges-flex">
                            {allBadges.length === 0 && <p>No badges yet.</p>}
                            {allBadges.map(b => {
                                const icon = PLATFORM_LIST.find(pl => pl.key === b.platform)?.icon;
                                return (
                                    <div className="badge-chip" key={b.id}>
                                        {icon && <img src={icon} alt={b.platform} />}
                                        <span>{b.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </MotionDiv>
                )}

                {/* Activity */}
                {activeTab === 'activity' && (
                    <MotionDiv className="panel-activity" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="heatmap-wrapper">
                            <h3><FaCodeBranch /> Coding Streaks</h3>
                            <HeatMap
                                startDate={new Date(new Date().setMonth(new Date().getMonth() - 6))}
                                endDate={new Date()}
                                values={portfolio.streakValues || []}
                                squareSize={13}
                                gutterSize={3}
                                classForValue={heatClass}
                                showWeekdayLabels
                                titleForValue={(v) => v?.date ? `${v.date} – ${v.count} submissions` : 'No activity'}
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
                                {(portfolio.activityLog || []).map(evt => (
                                    <li key={evt.id}>
                                        <div className="dot" />
                                        <div className="content">
                                            <time>{evt.date}</time>
                                            <p>{evt.text}</p>
                                        </div>
                                    </li>
                                ))}
                                {(!portfolio.activityLog || portfolio.activityLog.length === 0) && (
                                    <li className="empty-activity">No timeline entries yet.</li>
                                )}
                            </ul>
                        </div>
                    </MotionDiv>
                )}

                {/* Compare */}
                {activeTab === 'compare' && (
                    <MotionDiv className="panel-badges" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                        <h3><FaBolt /> Period Comparison</h3>
                        <ComparePanel current={currentCompare} previous={prevCompare} />
                    </MotionDiv>
                )}

                {/* Skills */}
                {activeTab === 'skills' && (
                    <MotionDiv className="panel-badges" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                        <h3>Skill Cloud</h3>
                        <SkillCloud skills={skillData} />
                    </MotionDiv>
                )}
            </div>

            {isModalOpen && (
                <EditProfileModal
                    portfolio={portfolio}
                    onClose={() => setIsModalOpen(false)}
                    onSave={savePortfolio}
                />
            )}
        </div>
    );
};

export default StudentPortfolioPage;