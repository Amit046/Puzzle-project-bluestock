import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import { usePuzzle } from "../../hooks/usePuzzle";
import CrownsPuzzle from "./CrownsPuzzle";
import InstructionsModal from "./InstructionsModal";

// ── Confetti ────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"][
      i % 6
    ],
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.8 + Math.random() * 1.2,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: "110vh",
            rotate: 720,
            scale: 0.5,
            opacity: [1, 1, 1, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

// ── Badge toast ──────────────────────────────────────────────────
function BadgeToast({ badge, onClose }) {
  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      className="fixed top-20 right-4 z-50 bg-yellow-950 border border-yellow-700/60 rounded-xl p-3.5 max-w-[220px] shadow-2xl"
    >
      <p className="text-yellow-300 font-bold text-sm">{badge.title}</p>
      <p className="text-yellow-600 text-xs mt-0.5">{badge.desc}</p>
      <button
        onClick={onClose}
        className="absolute top-2 right-2.5 text-yellow-700 hover:text-yellow-400 text-base leading-none"
      >
        ✕
      </button>
    </motion.div>
  );
}

// ── Difficulty badge ─────────────────────────────────────────────
function DiffBadge({ d }) {
  return (
    <span
      className={`badge ${d === "easy" ? "badge-green" : d === "medium" ? "badge-yellow" : "badge-red"}`}
    >
      {d?.toUpperCase()}
    </span>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function PuzzlePage() {
  const {
    puzzle,
    loading,
    error,
    gameState,
    boardState,
    toggleCell,
    hintsUsed,
    hintVisible,
    useHint,
    maxHints,
    timer,
    fmt,
    mistakes,
    score,
    streak,
    totalSolved,
    newBadges,
    alreadyDone,
    showInstructions,
    setShowInstructions,
    submit,
    startGame,
  } = usePuzzle();

  const [badgeIdx, setBadgeIdx] = useState(0);
  const [toastMsg, setToastMsg] = useState(null);
  const today = dayjs().format("dddd, MMMM D");
  const attemptsLeft = puzzle ? puzzle.maxAttempts - mistakes : 0;

  const handleSubmit = async () => {
      const res = await submit();
      if (res.result === 'incomplete') {
          setToastMsg('Please place all crowns before submitting.');
          setTimeout(() => setToastMsg(null), 3000);
      } else if (res.result === 'mistake') {
          setToastMsg(`Incorrect layout! ${res.remaining} attempts left.`);
          setTimeout(() => setToastMsg(null), 3000);
      }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-5xl drop-shadow-lg"
        >
          👑
        </motion.div>
        <p className="text-slate-500 font-display text-sm tracking-widest uppercase">
          Building Grid...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-sm mx-auto mt-12 card text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-red-400 font-display font-bold">
          Failed to load puzzle
        </p>
        <p className="text-slate-500 text-sm mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary mt-4 w-full"
        >
          Reload
        </button>
      </div>
    );

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in flex flex-col items-center">
      {/* Badge toasts */}
      <AnimatePresence>
        {newBadges[badgeIdx] && (
          <BadgeToast
            badge={newBadges[badgeIdx]}
            onClose={() => setBadgeIdx((i) => i + 1)}
          />
        )}
        
        {toastMsg && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-950 text-red-300 px-4 py-2 rounded-xl shadow-xl text-sm border border-red-800"
            >
              {toastMsg}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti on win */}
      {gameState === "won" && !alreadyDone && <Confetti />}

      {/* Instructions modal */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* ── Header ── */}
      <div className="text-center mb-6 w-full">
        <p className="text-slate-500 text-xs tracking-widest uppercase font-display font-semibold mb-1">
          {today}
        </p>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <h1 className="font-display text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-sm pb-1">
            Crowns #{puzzle?.puzzleNumber}
          </h1>
          <button
            onClick={() => setShowInstructions(true)}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm flex items-center justify-center transition-all border border-slate-700 hover:border-slate-500"
            title="How to play"
          >
            ?
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <DiffBadge d={puzzle?.difficulty} />
          {streak > 0 && (
            <span className="badge bg-orange-900/50 text-orange-400 border border-orange-800/80 px-2.5 py-1">
              {streak} 🔥
            </span>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-4 gap-3 mb-6 w-full">
        {[
          { label: "Time", value: fmt(timer), color: "text-blue-400" },
          { label: "Mistakes", value: `${mistakes}/${puzzle?.maxAttempts}`, color: "text-red-400" },
          { label: "Solved", value: totalSolved, color: "text-green-400" },
          {
            label: "Hints",
            value: `${maxHints - hintsUsed} left`,
            color: "text-purple-400",
          },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900/60 border border-slate-800/50 rounded-2xl py-3 px-1 text-center shadow-inner backdrop-blur-sm">
            <p className={`font-display font-extrabold text-lg ${s.color}`}>
              {s.value}
            </p>
            <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Already completed ── */}
      {alreadyDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full card mb-6 text-center border-green-800/50 bg-green-950/40 backdrop-blur-sm"
        >
          <p className="text-4xl mb-3 drop-shadow-md">👑</p>
          <p className="font-display text-green-400 font-bold text-xl">
            Already solved today!
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Score: <span className="text-white font-bold text-lg inline-block ml-1">{score}</span>
          </p>
          <p className="text-slate-500 text-xs mt-3 uppercase tracking-wide">
            Come back tomorrow for a new puzzle 🌅
          </p>
        </motion.div>
      )}

      {/* ── Result banners ── */}
      <AnimatePresence mode="popLayout">
        {gameState === "won" && !alreadyDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full card mb-6 text-center border-green-700/50 bg-green-950/40 backdrop-blur-md shadow-2xl shadow-green-900/20"
          >
            <p className="text-6xl mb-4 drop-shadow-xl animate-bounce-in">🎉</p>
            <p className="font-display text-green-400 font-black text-3xl">
              Solved!
            </p>
            <div className="flex justify-center gap-8 mt-6 bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
              <div>
                <p className="font-display text-2xl text-white font-bold">
                  {score}
                </p>
                <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Score</p>
              </div>
              <div className="w-px bg-slate-800"></div>
              <div>
                <p className="font-display text-2xl text-white font-bold">
                  {fmt(timer)}
                </p>
                <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Time</p>
              </div>
            </div>
          </motion.div>
        )}
        {gameState === "lost" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full card mb-6 text-center border-red-800/50 bg-red-950/40 backdrop-blur-md"
          >
            <p className="text-5xl mb-3 drop-shadow-md">💀</p>
            <p className="font-display text-red-400 font-bold text-2xl">
              Game Over
            </p>
            <p className="text-slate-400 text-sm mt-3">
              You ran out of attempts.
            </p>
            <p className="text-slate-500 text-xs mt-3 uppercase tracking-wider">
              Try again tomorrow! 💪
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Idle / start screen ── */}
      {gameState === "idle" && !alreadyDone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 mb-6 text-center shadow-xl backdrop-blur-sm"
        >
          <div className="flex justify-center mb-6">
             <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
               <p className="text-5xl drop-shadow-lg">👑</p>
             </div>
          </div>
          <p className="font-display text-slate-100 font-bold text-xl mb-3 tracking-tight">
            Place the Crowns
          </p>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            {puzzle?.question}
          </p>
          <div className="flex flex-col gap-3 justify-center sm:flex-row">
            <button
              onClick={() => setShowInstructions(true)}
              className="btn-secondary py-3 px-6 text-sm font-semibold rounded-xl"
            >
              How to play
            </button>
            <button 
              onClick={startGame} 
              className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black py-3 px-8 rounded-xl transition-all shadow-lg shadow-amber-500/20 uppercase tracking-wider text-sm"
            >
              Start Game →
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Active game ── */}
      {(gameState === "playing" || gameState === "won" || gameState === "lost") && (
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="mt-2 w-full flex flex-col items-center"
        >
          <CrownsPuzzle
            puzzle={puzzle}
            boardState={boardState}
            onToggle={toggleCell}
            onSubmit={handleSubmit}
            gameState={gameState}
          />

          {/* ── Secret hint button ── */}
          {gameState === "playing" && (
            <div className="flex justify-center mt-6">
              <button
                onClick={useHint}
                disabled={hintsUsed >= maxHints}
                className="bg-purple-900/30 text-purple-300 border border-purple-800/50 hover:bg-purple-800/40 px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-inner backdrop-blur-sm"
              >
                <span>✨</span> Reveal a correct crown{" "}
                <span className="text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded-md text-xs font-bold border border-purple-800/30 ml-1">
                  {maxHints - hintsUsed} left
                </span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
