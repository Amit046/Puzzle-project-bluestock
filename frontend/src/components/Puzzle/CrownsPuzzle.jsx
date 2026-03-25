import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Defined region colors for up to 10 regions
const regionColors = [
    'bg-rose-900/40 border-rose-700',
    'bg-blue-900/40 border-blue-700',
    'bg-green-900/40 border-green-700',
    'bg-amber-900/40 border-amber-700',
    'bg-purple-900/40 border-purple-700',
    'bg-cyan-900/40 border-cyan-700',
    'bg-orange-900/40 border-orange-700',
    'bg-indigo-900/40 border-indigo-700',
    'bg-teal-900/40 border-teal-700',
    'bg-fuchsia-900/40 border-fuchsia-700'
];

export default function CrownsPuzzle({ puzzle, boardState, onToggle, onSubmit, gameState }) {
    const { size, grid } = puzzle;
    const isPlaying = gameState === 'playing';

    // Figure out thick borders between regions
    const getBorders = (r, c) => {
        const currentRegion = grid[r][c];
        let borders = ' ';
        // Top border
        if (r === 0 || grid[r - 1][c] !== currentRegion) borders += 'border-t-2 border-t-slate-300 ';
        else borders += 'border-t border-t-transparent ';
        // Bottom border
        if (r === size - 1 || grid[r + 1][c] !== currentRegion) borders += 'border-b-2 border-b-slate-300 ';
        else borders += 'border-b border-b-transparent ';
        // Left border
        if (c === 0 || grid[r][c - 1] !== currentRegion) borders += 'border-l-2 border-l-slate-300 ';
        else borders += 'border-l border-l-transparent ';
        // Right border
        if (c === size - 1 || grid[r][c + 1] !== currentRegion) borders += 'border-r-2 border-r-slate-300 ';
        else borders += 'border-r border-r-transparent ';
        return borders;
    };

    const countPlaced = boardState.filter(s => s === 2).length;

    return (
        <div className="flex flex-col items-center w-full">
            <div 
                className="grid gap-0"
                style={{
                    gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                    width: '100%',
                    maxWidth: size <= 7 ? '320px' : size === 8 ? '360px' : '400px',
                    aspectRatio: '1/1'
                }}
            >
                {Array.from({ length: size * size }).map((_, idx) => {
                    const r = Math.floor(idx / size);
                    const c = idx % size;
                    const region = grid[r][c];
                    const state = boardState[idx];
                    const colorClass = regionColors[region % regionColors.length];
                    const borders = getBorders(r, c);

                    let content = null;
                    if (state === 1) {
                        content = <span className="text-slate-500/50 text-xl font-bold">✕</span>;
                    } else if (state === 2) {
                        content = (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-2xl drop-shadow-md"
                            >
                                👑
                            </motion.span>
                        );
                    }

                    return (
                        <div 
                            key={idx}
                            onClick={() => onToggle(idx)}
                            className={`flex items-center justify-center cursor-pointer transition-colors duration-200 select-none
                                ${colorClass} ${borders}
                                hover:brightness-110 active:scale-95
                                ${!isPlaying ? 'opacity-80 pointer-events-none' : ''}
                            `}
                        >
                            {content}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-[320px]">
                <p className="text-slate-400 text-sm font-display tracking-wide">
                    {countPlaced} / {size} Crowns Placed
                </p>
                {isPlaying && (
                    <button 
                        onClick={onSubmit}
                        className="btn-primary w-full py-3 text-lg"
                    >
                        Submit
                    </button> // We can leave disabled to logic or let submit tell user they didn't finish
                )}
            </div>
        </div>
    );
}
