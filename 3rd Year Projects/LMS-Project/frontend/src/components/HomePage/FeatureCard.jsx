// src/components/FeatureCard.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FeatureCard = ({ feature, index, expandedIndex, setExpandedIndex }) => {
    const isOpen = index === expandedIndex;

    return (
        <motion.div
            className={`feature-card ${isOpen ? 'expanded' : ''}`}
            onClick={() => setExpandedIndex(isOpen ? null : index)}
            initial={{ borderRadius: "12px" }}
            animate={{ borderRadius: isOpen ? "20px" : "12px" }}
            transition={{ duration: 0.3 }}
        >
            <div className="card-content">
                <div className="card-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.short_description}</p>
                <motion.div
                    className="expand-icon"
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    ▼
                </motion.div>
            </div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.section
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="card-details"
                    >
                        <p>{feature.detailed_description}</p>
                    </motion.section>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FeatureCard;