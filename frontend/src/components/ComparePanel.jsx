import React from 'react';
import AnimatedNumber from './AnimatedNumber';
import './ComparePanel.css';

export default function ComparePanel({ current = {}, previous = {} }) {
    const keys = Object.keys(current);
    return (
        <div className="compare-grid">
            {keys.map(k => {
                const c = current[k] ?? 0;
                const p = previous[k] ?? 0;
                const diff = c - p;
                const pct = p ? ((diff / p) * 100).toFixed(1) : '—';
                const cls = diff > 0 ? 'up' : diff < 0 ? 'down' : '';
                return (
                    <div className="compare-card" key={k}>
                        <h4>{k}</h4>
                        <div className="values">
                            <AnimatedNumber value={c} />
                            <span className={`badge-diff ${cls}`}>
                {diff === 0 ? '0' : (diff > 0 ? '+' : '') + diff} ({pct}%)
              </span>
                        </div>
                        <small>Prev: {p}</small>
                    </div>
                );
            })}
        </div>
    );
}