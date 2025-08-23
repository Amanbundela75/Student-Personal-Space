import React from 'react';
import './SkillCloud.css';

export default function SkillCloud({ skills = [] }) {
    if (!skills.length) return <p className="sc-empty">No skills yet.</p>;
    const max = Math.max(...skills.map(s => s.count));
    return (
        <div className="skill-cloud">
            {skills.map(skill => {
                const weight = 0.6 + (skill.count / max) * 0.9; // scale 0.6 - 1.5
                return (
                    <span
                        key={skill.name}
                        className="skill-chip"
                        style={{
                            fontSize: `${0.75 * weight}rem`,
                            opacity: 0.55 + 0.45 * (skill.count / max)
                        }}
                        title={`${skill.name}: ${skill.count}`}
                    >
            {skill.name}
          </span>
                );
            })}
        </div>
    );
}