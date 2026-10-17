import React from 'react';

export default function RadarMark({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="RivalRadar Mark"
    >
      {/* Outer concentric precision ring */}
      <circle cx="12" cy="12" r="9.5" stroke="#68745C" strokeWidth="1.25" />
      {/* Inner range ring */}
      <circle cx="12" cy="12" r="5" stroke="#68745C" strokeWidth="0.85" strokeDasharray="1.5 1.5" />
      {/* Fine crosshairs */}
      <line x1="12" y1="2.5" x2="12" y2="21.5" stroke="#68745C" strokeWidth="0.75" />
      <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="#68745C" strokeWidth="0.75" />
      {/* Focal target pip */}
      <circle cx="12" cy="12" r="1.5" fill="#68745C" />
      {/* Detected coordinate indicator (subtle offset) */}
      <circle cx="16" cy="8" r="1.25" fill="#B66A45" />
    </svg>
  );
}
