import React, { useEffect, useRef, useState } from 'react';

const easeOutQuad = (t) => t * (2 - t);

/**
 * AnimatedNumber
 * Props:
 *  value (number)
 *  duration (ms)
 *  className
 *  format (fn)
 */
const AnimatedNumber = ({ value = 0, duration = 1200, className = '', format }) => {
    const [display, setDisplay] = useState(0);
    const startRef = useRef();
    const fromRef = useRef(0);
    const targetRef = useRef(value);

    useEffect(() => {
        fromRef.current = display;
        targetRef.current = value;
        startRef.current = performance.now();

        let raf;
        const animate = (time) => {
            const elapsed = time - startRef.current;
            const progress = Math.min(1, elapsed / duration);
            const eased = easeOutQuad(progress);
            const current = fromRef.current + (targetRef.current - fromRef.current) * eased;
            setDisplay(current);
            if (progress < 1) {
                raf = requestAnimationFrame(animate);
            }
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const shown = format ? format(display) : Math.round(display).toLocaleString();
    return <span className={className}>{shown}</span>;
};

export default AnimatedNumber;