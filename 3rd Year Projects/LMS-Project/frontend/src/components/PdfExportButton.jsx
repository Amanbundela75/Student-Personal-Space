import React from 'react';
import { FaFilePdf } from 'react-icons/fa';

export default function PdfExportButton({ targetSelector = '.portfolio-wrapper' }) {
    const handleExport = async () => {
        const el = document.querySelector(targetSelector);
        if (!el) return;
        const [{ default: html2pdf }] = await Promise.all([
            import('html2pdf.js')
        ]);
        html2pdf(el, {
            margin: 10,
            filename: 'portfolio.pdf',
            image: { type: 'jpeg', quality: 0.92 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        });
    };
    return (
        <button className="btn subtle" onClick={handleExport} title="Export PDF">
            <FaFilePdf /> PDF
        </button>
    );
}