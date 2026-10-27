import React from 'react';

export default function BackgroundDecor() {
  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
    >
      {/* 1. Subtle Dot Matrix & Blueprint Texture */}
      <div className="absolute inset-0 bg-dot-matrix opacity-70 dark:opacity-40 transition-opacity duration-300"></div>
      <div className="absolute inset-0 bg-blueprint-grid opacity-50 dark:opacity-30 transition-opacity duration-300"></div>

      {/* 2. Top-center Light Glow Beam */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-500/15 via-blue-500/5 to-transparent dark:from-indigo-500/20 dark:via-purple-500/10 blur-3xl rounded-full"></div>

      {/* 3. Floating Atmospheric Glow Orbs */}
      <div 
        className="absolute top-1/4 -left-48 w-[500px] h-[500px] rounded-full 
        bg-gradient-to-tr from-indigo-300/20 via-purple-200/15 to-transparent 
        dark:from-indigo-600/15 dark:via-purple-900/10 dark:to-transparent 
        blur-[90px] animate-orb-1"
      ></div>

      <div 
        className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full 
        bg-gradient-to-bl from-blue-200/25 via-cyan-100/15 to-transparent 
        dark:from-cyan-600/12 dark:via-blue-900/10 dark:to-transparent 
        blur-[90px] animate-orb-2"
      ></div>

      {/* 4. Sleek Linear Grid Crosshairs */}
      <div className="hidden xl:block absolute top-20 left-10 text-slate-400/30 dark:text-slate-600/30 font-mono text-xs select-none">
        +
      </div>
      <div className="hidden xl:block absolute top-20 right-10 text-slate-400/30 dark:text-slate-600/30 font-mono text-xs select-none">
        +
      </div>
    </div>
  );
}
