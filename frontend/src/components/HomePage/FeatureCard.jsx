import React from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

/*
  icon keys map to inline svg so we can keep color consistent.
*/
const ICONS = {
    dashboard: (
        <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="14" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
        </svg>
    ),
    connect: (
        <svg viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            <path d="M2 8c0-2.2.7-4.3 2-6" />
            <path d="M22 8c0-2.2-.7-4.3-2-6" />
        </svg>
    ),
    guidance: (
        <svg viewBox="0 0 24 24">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    portfolio: (
        <svg viewBox="0 0 24 24">
            <path d="M3 7h18" />
            <path d="M8 7V5a4 4 0 0 1 8 0v2" />
            <rect x="3" y="7" width="18" height="14" rx="2" />
        </svg>
    )
};

const FeatureCard = ({ data, expanded, onToggle }) => {
    return (
        <div
            className={`feature-card-adv ${expanded ? 'open' : ''}`}
            onClick={onToggle}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onToggle()}
            aria-expanded={expanded}
        >
            <div className="fc-top">
                <div className="fc-icon">{ICONS[data.icon]}</div>
                <div className="fc-text">
                    <h3>{data.title}</h3>
                    <p className="fc-short">{data.short_description}</p>
                </div>
                <div className="fc-toggle">{expanded ? <FaMinus /> : <FaPlus />}</div>
            </div>
            <div
                className="fc-details"
                style={{ maxHeight: expanded ? 260 : 0 }}
            >
                <p>{data.detailed_description}</p>
            </div>
        </div>
    );
};

export default FeatureCard;