import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
    FaArrowRight,
    FaChevronDown,
    FaPlay,
    FaBolt,
    FaGithub,
    FaLinkedin,
    FaSun,
    FaMoon,
    FaCheckCircle,
    FaArrowUp
} from 'react-icons/fa';
import FeatureCard from '../components/HomePage/FeatureCard';
import './HomePage.css';

/* --------------------------------------------------
   OPTIONAL: Framer Motion (graceful fallback)
-------------------------------------------------- */
let motion;
try {
    // eslint-disable-next-line global-require
    motion = require('framer-motion').motion;
} catch {
    motion = { div: (p) => <div {...p} /> };
}
const MotionDiv = motion.div;

/* --------------------------------------------------
   Feature Data
-------------------------------------------------- */
const featuresData = [
    {
        id: 1,
        icon: 'dashboard',
        title: 'Personal Dashboard',
        short_description: 'Manage progress, deadlines & academic pulse at a glance.',
        detailed_description:
            'Track courses, upcoming proctored tests, mentor notes, and skill growth – all synchronized into one adaptive, AI-enhanced dashboard.'
    },
    {
        id: 2,
        icon: 'connect',
        title: 'Direct Connectivity',
        short_description: 'Seamless channel to Mentor & TAP Cell.',
        detailed_description:
            'Book 1‑to‑1 sessions, push portfolio updates, request feedback, and receive actionable guidance instantly inside the platform.'
    },
    {
        id: 3,
        icon: 'guidance',
        title: 'Effective Guidance',
        short_description: 'Data‑driven personalized roadmap generation.',
        detailed_description:
            'Our logic analyzes test performance, coding stats & subject mastery to craft iterative learning sprints that keep you in flow.'
    },
    {
        id: 4,
        icon: 'portfolio',
        title: 'Unified Portfolio',
        short_description: 'Bring GitHub, LeetCode, Codeforces & more together.',
        detailed_description:
            'Auto-sync achievements, certifications, streaks & project metadata to present a recruiter‑ready live engineering profile.'
    }
];

/* --------------------------------------------------
   FAQ Data
-------------------------------------------------- */
const faqItems = [
    {
        q: 'Is the platform free for students?',
        a: 'Yes. Core learning, tracking, and mentorship features are free for enrolled institute students.'
    },
    {
        q: 'How is my coding data fetched?',
        a: 'We use public APIs / scraping adapters (where allowed) with rate limits and local caching to minimize load.'
    },
    {
        q: 'Can I hide parts of my profile?',
        a: 'Yes, you control visibility of projects, stats, achievements, and certifications through privacy toggles.'
    },
    {
        q: 'Do mentors see my real-time progress?',
        a: 'Mentors see aggregated metrics & flagged gaps. Detailed logs remain private unless you explicitly share.'
    }
];

/* --------------------------------------------------
   Simple Intersection Hook (Reveal Animations)
-------------------------------------------------- */
const useReveal = (threshold = 0.2) => {
    const ref = useRef(null);
    const [show, setShow] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShow(true);
                    obs.unobserve(el);
                }
            },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, show };
};

/* --------------------------------------------------
   Utility: Scroll Lock for Menu (optional)
-------------------------------------------------- */
const useBodyScrollLock = (locked) => {
    useEffect(() => {
        if (locked) {
            const prev = document.documentElement.style.overflow;
            document.documentElement.style.overflow = 'hidden';
            return () => (document.documentElement.style.overflow = prev);
        }
    }, [locked]);
};

/* --------------------------------------------------
   Main HomePage
-------------------------------------------------- */
const HomePage = () => {
    const { currentUser } = useAuth();
    const [expandedFeature, setExpandedFeature] = useState(null);
    const [faqOpen, setFaqOpen] = useState(null);
    const [dark, setDark] = useState(() => localStorage.getItem('lms_dark_home') === '1');
    const [navSolid, setNavSolid] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

    useBodyScrollLock(mobileMenu);

    useEffect(() => {
        const handler = () => {
            const sc = window.scrollY;
            setNavSolid(sc > 40);
            setShowScrollTop(sc > 400);
        };
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        if (dark) document.documentElement.classList.add('home-dark');
        else document.documentElement.classList.remove('home-dark');
        localStorage.setItem('lms_dark_home', dark ? '1' : '0');
    }, [dark]);

    const handleExpand = (id) => {
        setExpandedFeature((prev) => (prev === id ? null : id));
    };

    const heroReveal = useReveal(0.35);

    /* === CHANGE #2: BUTTON LINK FIX START === */
    // Correct path for the student dashboard
    const primaryCTA = currentUser ? '/student/dashboard' : '/register';
    /* === BUTTON LINK FIX END === */

    return (
        <div className="home-root">
            {/* Floating Decorative Blobs */}
            <div className="bg-blob blob-a" />
            <div className="bg-blob blob-b" />
            <div className="bg-blob blob-c" />

            {/* Navbar */}
            <header className={`home-nav ${navSolid ? 'solid' : ''}`}>
                <div className="nav-inner">
                    <Link to="/" className="brand">
                        <span className="brand-mark">ITM</span>
                        <span className="brand-text">Learning Hub</span>
                    </Link>
                    <nav className={`nav-links ${mobileMenu ? 'open' : ''}`}>
                        <Link to="/" onClick={() => setMobileMenu(false)}>Home</Link>
                        <a href="#features" onClick={() => setMobileMenu(false)}>Features</a>
                        <a href="#mentorship" onClick={() => setMobileMenu(false)}>Mentors</a>
                        <a href="#tests" onClick={() => setMobileMenu(false)}>Tests</a>
                        <a href="#faq" onClick={() => setMobileMenu(false)}>FAQ</a>
                        <Link to={currentUser ? '/portfolio' : '/login'} className="nav-profile" onClick={() => setMobileMenu(false)}>
                            {currentUser ? 'Portfolio' : 'Login'}
                        </Link>
                    </nav>
                    <div className="nav-actions">
                        <button
                            className="theme-toggle"
                            onClick={() => setDark((d) => !d)}
                            aria-label="Toggle theme"
                        >
                            {dark ? <FaSun /> : <FaMoon />}
                        </button>
                        <button
                            className={`burger ${mobileMenu ? 'active' : ''}`}
                            onClick={() => setMobileMenu((o) => !o)}
                            aria-label="Menu"
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="hero" ref={heroReveal.ref}>
                <div className="hero-media-layer">
                    <video
                        className="hero-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="/images/bg_fallback.webp"
                    >
                        <source src="/videos/Home_Background.mp4" type="video/mp4" />
                    </video>
                    <div className="hero-gradient-overlay" />
                </div>
                <div className={`hero-content-wrapper ${heroReveal.show ? 'show' : ''}`}>
                    <MotionDiv
                        className="hero-badge"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <FaBolt /> Your Own Career Platform
                    </MotionDiv>
                    <MotionDiv
                        className="hero-title"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Hello ITMians
                    </MotionDiv>
                    {/* === CHANGE #1: DESCRIPTION UPDATE START === */}
                    <MotionDiv
                        className="hero-sub"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        From classroom to career, your complete academic and professional toolkit.
                    </MotionDiv>
                    {/* === DESCRIPTION UPDATE END === */}
                    <MotionDiv
                        className="hero-ctas"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link to={primaryCTA} className="btn-hero primary">
                            {currentUser ? 'Go to Dashboard' : 'Start Practicing'} <FaArrowRight />
                        </Link>
                        <a href="#features" className="btn-hero ghost">
                            Explore Features
                        </a>
                    </MotionDiv>
                    <MotionDiv
                        className="hero-mini-stats"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                    >
                        <div>
                            <span className="value">12K+</span>
                            <span className="label">Submissions</span>
                        </div>
                        <div>
                            <span className="value">240+</span>
                            <span className="label">Mentor Sessions</span>
                        </div>
                        <div>
                            <span className="value">98%</span>
                            <span className="label">Integrity Rate</span>
                        </div>
                    </MotionDiv>
                </div>
                <div className="hero-bottom-fade" />
            </section>

            {/* Scrolling marquee stats */}
            <section className="stats-marquee">
                <div className="marquee-track">
                    {[
                        'Adaptive Proctored Tests',
                        'Live Portfolio Sync',
                        'Mentor Scheduling',
                        'Gamified XP System',
                        'Subject Mastery Maps',
                        'AI Difficulty Insights',
                        'Progress Heatmaps'
                    ].map((text, i) => (
                        <span key={i} className="marquee-item">
              <FaCheckCircle /> {text}
            </span>
                    ))}
                    {/* duplicate for seamless loop */}
                    {[
                        'Adaptive Proctored Tests',
                        'Live Portfolio Sync',
                        'Mentor Scheduling',
                        'Gamified XP System',
                        'Subject Mastery Maps',
                        'AI Difficulty Insights',
                        'Progress Heatmaps'
                    ].map((text, i) => (
                        <span key={`dup-${i}`} className="marquee-item">
              <FaCheckCircle /> {text}
            </span>
                    ))}
                </div>
            </section>

            {/* Feature Hub */}
            <section className="feature-hub" id="features">
                <div className="section-head">
                    <h2>Your Personal Success Hub</h2>
                    <p>Centralize learning, analytics & mentorship. Expand a card to learn more.</p>
                </div>
                <div className="feature-grid">
                    {featuresData.map((f) => (
                        <FeatureCard
                            key={f.id}
                            data={f}
                            expanded={expandedFeature === f.id}
                            onToggle={() => handleExpand(f.id)}
                        />
                    ))}
                </div>
            </section>

            {/* Portfolio Highlight */}
            <SectionSplit
                id="portfolio"
                direction="normal"
                title="Showcase Your Skills. Build Your Coder Identity."
                text="An integrated portfolio unifies your coding streaks, solved problem distribution, academic metrics, achievements & certifications – streamed live for mentors and recruiters."
                bullets={[
                    'Connect GitHub / LeetCode / Codeforces / HackerRank',
                    'Real-time difficulty distribution & streak analytics',
                    'Public share link + PDF export ready',
                    'Skill taxonomy & tag-based problem density tracking'
                ]}
                image="/images/portfolio-showcase.svg"
            />

            {/* Mentorship */}
            <section className="mentorship" id="mentorship">
                <div className="section-head light">
                    <h2>Learn From Those Ahead of You</h2>
                    <p>Real alumni & senior mentors who shaped their path – and now guide yours.</p>
                </div>
                <div className="mentor-cards">
                    {[
                        {
                            name: 'Priya Sharma',
                            role: 'Software Engineer @ Google',
                            img: '/images/seniors/mentor1.jpg',
                            link: '/seniors/priya-sharma'
                        },
                        {
                            name: 'Rohan Verma',
                            role: 'Data Scientist @ Microsoft',
                            img: '/images/seniors/mentor2.jpg',
                            link: '/seniors/rohan-verma'
                        },
                        {
                            name: 'Anjali Singh',
                            role: 'Product Manager @ Amazon',
                            img: '/images/seniors/mentor3.jpg',
                            link: '/seniors/anjali-singh'
                        }
                    ].map((m) => (
                        <div className="mentor-card" key={m.name}>
                            <div className="mentor-img-wrap">
                                <img src={m.img} alt={m.name} loading="lazy" />
                            </div>
                            <h3>{m.name}</h3>
                            <p className="role">{m.role}</p>
                            <a
                                href={m.link}
                                className="mentor-link"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Roadmap <FaArrowRight />
                            </a>
                        </div>
                    ))}
                </div>
            </section>

            {/* Proctored Tests */}
            <SectionSplit
                id="tests"
                direction="reverse"
                theme="dark"
                title="Forge Skills Under Real Conditions"
                text="Interview‑style proctored exams with anti-cheat tracking to ensure authenticity. Every result feeds your growth engine & mentor insights."
                bullets={[
                    'Seniors design domain-authentic scenarios',
                    'Camera + focus shift integrity layer',
                    'Adaptive retest scheduling',
                    'Performance deltas across sessions'
                ]}
                image="/images/proctored-tests.svg"
            />

            {/* Subjects */}
            <section className="subject-master">
                <div className="section-head">
                    <h2>Master Your Fundamentals</h2>
                    <p>Structured subject clusters with growth rings & revision cycles.</p>
                </div>
                <div className="subject-grid">
                    {[
                        ['💻', 'Data Structures'],
                        ['🧠', 'Algorithms'],
                        ['⚙️', 'Operating Systems'],
                        ['🌐', 'Computer Networks'],
                        ['🗃️', 'DBMS'],
                        ['👨‍💻', 'OOP'],
                        ['🔐', 'Cyber Security'],
                        ['🤖', 'AI / ML Basics']
                    ].map(([icon, label]) => (
                        <div className="subject-card" key={label}>
                            <div className="subject-icon">{icon}</div>
                            <h3>{label}</h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="faq" id="faq">
                <div className="section-head">
                    <h2>Frequently Asked Questions</h2>
                    <p>Still unsure? We’ve got clarity.</p>
                </div>
                <div className="faq-list">
                    {faqItems.map((item, i) => {
                        const open = faqOpen === i;
                        return (
                            <div className={`faq-item ${open ? 'open' : ''}`} key={item.q}>
                                <button
                                    className="faq-question"
                                    onClick={() => setFaqOpen(open ? null : i)}
                                    aria-expanded={open}
                                >
                                    <span>{item.q}</span>
                                    <FaChevronDown />
                                </button>
                                <div
                                    className="faq-answer"
                                    style={{ maxHeight: open ? '220px' : '0px' }}
                                >
                                    <p>{item.a}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* CTA */}
            <section
                className="final-cta"
                style={{
                    backgroundImage: `url("/images/cta-background.jpg")`
                }}
            >
                <div className="cta-inner">
                    <h2>Ready To Build Your Advantage?</h2>
                    <p>Join peers leveraging structured mentorship, adaptive testing & real-time performance intelligence.</p>
                    <div className="cta-actions">
                        <Link to={primaryCTA} className="cta-btn primary">
                            {currentUser ? 'Open Dashboard' : 'Create Your Account'}
                        </Link>
                        <a href="#features" className="cta-btn ghost">
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {showScrollTop && (
                <button
                    className="scroll-top-btn"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Scroll to top"
                >
                    <FaArrowUp />
                </button>
            )}
        </div>
    );
};

/* --------------------------------------------------
   Reusable Split Section Component
-------------------------------------------------- */
const SectionSplit = ({
                          id,
                          direction = 'normal',
                          theme = 'light',
                          title,
                          text,
                          bullets = [],
                          image
                      }) => {
    const { ref, show } = useReveal(0.25);
    return (
        <section
            id={id}
            ref={ref}
            className={`split-section ${direction} ${theme} ${show ? 'reveal' : ''}`}
        >
            <div className="split-inner">
                <div className="split-media">
                    <div className="media-frame">
                        <img src={image} alt={title} loading="lazy" />
                    </div>
                </div>
                <div className="split-text">
                    <h2>{title}</h2>
                    <p className="lead">{text}</p>
                    <ul className="bullet-list">
                        {bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                        ))}
                    </ul>
                    <div className="split-buttons">
                        <a href="#features" className="btn-split">
                            Learn More <FaArrowRight />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePage;