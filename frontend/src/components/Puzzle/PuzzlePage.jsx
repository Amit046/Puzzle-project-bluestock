import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import { usePuzzle } from "../../hooks/usePuzzle";
import WordPuzzle from "./WordPuzzle";
import NumberPuzzle from "./NumberPuzzle";
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

// ── Click-to-reveal Hints Panel ──────────────────────────────────
function HintsPanel({ puzzle }) {
  const [revealed, setRevealed] = useState({
    cat: false,
    h1: false,
    h2: false,
  });
  const reveal = (key) => setRevealed((r) => ({ ...r, [key]: true }));

  if (!puzzle) return null;

  const HiddenBox = ({ label, color, onReveal }) => (
    <button
      onClick={onReveal}
      className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 border border-dashed
        ${
          color === "blue"
            ? "border-blue-800/50 bg-blue-950/10 text-blue-400 hover:bg-blue-950/30"
            : color === "purple"
              ? "border-purple-800/50 bg-purple-950/10 text-purple-400 hover:bg-purple-950/30"
              : "border-amber-800/50 bg-amber-950/10 text-amber-400 hover:bg-amber-950/30"
        }
        transition-all duration-200 group`}
    >
      <span className="text-lg">🔒</span>
      <span className="text-sm font-medium">Tap to reveal {label}</span>
      <span className="text-xs opacity-50 group-hover:opacity-100">→</span>
    </button>
  );

  if (puzzle.type === "word") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 space-y-2"
      >
        {/* Category clue */}
        {!revealed.cat ? (
          <HiddenBox
            label="Category"
            color="blue"
            onReveal={() => reveal("cat")}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-blue-950/30 border border-blue-800/40 rounded-xl px-4 py-2.5"
          >
            <span className="text-2xl flex-shrink-0">
              {puzzle.categoryEmoji}
            </span>
            <div>
              <p className="text-blue-400 text-[10px] font-display uppercase tracking-widest mb-0.5">
                Category
              </p>
              <p className="text-slate-200 text-sm font-medium">
                {puzzle.categoryClue}
              </p>
            </div>
          </motion.div>
        )}

        {/* Clue 1 */}
        {!revealed.h1 ? (
          <HiddenBox
            label="Clue 1"
            color="purple"
            onReveal={() => reveal("h1")}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-3 bg-purple-950/30 border border-purple-800/40 rounded-xl px-4 py-3"
          >
            <span className="text-lg flex-shrink-0 mt-0.5">🔮</span>
            <div>
              <p className="text-purple-400 text-[10px] font-display uppercase tracking-widest mb-0.5">
                Clue 1
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {puzzle.hint1}
              </p>
            </div>
          </motion.div>
        )}

        {/* Clue 2 */}
        {!revealed.h2 ? (
          <HiddenBox
            label="Clue 2"
            color="amber"
            onReveal={() => reveal("h2")}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-3 bg-amber-950/30 border border-amber-800/40 rounded-xl px-4 py-3"
          >
            <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
            <div>
              <p className="text-amber-400 text-[10px] font-display uppercase tracking-widest mb-0.5">
                Clue 2
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {puzzle.hint2}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Number puzzle
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 space-y-2"
    >
      {!revealed.h1 ? (
        <HiddenBox
          label="Clue 1"
          color="purple"
          onReveal={() => reveal("h1")}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-3 bg-purple-950/30 border border-purple-800/40 rounded-xl px-4 py-3"
        >
          <span className="text-lg flex-shrink-0 mt-0.5">🔮</span>
          <div>
            <p className="text-purple-400 text-[10px] font-display uppercase tracking-widest mb-0.5">
              Clue 1
            </p>
            <p className="text-slate-300 text-sm">{puzzle.hint1}</p>
          </div>
        </motion.div>
      )}
      {!revealed.h2 ? (
        <HiddenBox label="Clue 2" color="amber" onReveal={() => reveal("h2")} />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-3 bg-amber-950/30 border border-amber-800/40 rounded-xl px-4 py-3"
        >
          <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
          <div>
            <p className="text-amber-400 text-[10px] font-display uppercase tracking-widest mb-0.5">
              Clue 2
            </p>
            <p className="text-slate-300 text-sm">{puzzle.hint2}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function PuzzlePage() {
  const {
    puzzle,
    loading,
    error,
    gameState,
    attempts,
    input,
    setInput,
    hintsUsed,
    hintVisible,
    useHint,
    maxHints,
    timer,
    fmt,
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
  const today = dayjs().format("dddd, MMMM D");
  const attemptsLeft = puzzle ? puzzle.maxAttempts - attempts.length : 0;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-5xl"
        >
          🧩
        </motion.div>
        <p className="text-slate-500 font-display text-sm tracking-widest">
          LOADING PUZZLE...
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
    <div className="max-w-xl mx-auto px-4 py-6 animate-fade-in">
      {/* Badge toasts */}
      <AnimatePresence>
        {newBadges[badgeIdx] && (
          <BadgeToast
            badge={newBadges[badgeIdx]}
            onClose={() => setBadgeIdx((i) => i + 1)}
          />
        )}
      </AnimatePresence>

      {/* Confetti on win */}
      {gameState === "won" && !alreadyDone && <Confetti />}

      {/* Instructions modal */}
      <InstructionsModal
        puzzle={puzzle}
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* ── Header ── */}
      <div className="text-center mb-5">
        <p className="text-slate-600 text-xs tracking-widest uppercase font-display">
          {today}
        </p>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <h1 className="font-display text-2xl font-bold text-white">
            Puzzle #{puzzle?.puzzleNumber}
          </h1>
          <button
            onClick={() => setShowInstructions(true)}
            className="w-6 h-6 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white text-xs flex items-center justify-center transition-colors"
            title="How to play"
          >
            ?
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <DiffBadge d={puzzle?.difficulty} />
          <span className="badge badge-blue">
            {puzzle?.type?.toUpperCase()}
          </span>
          {streak > 0 && (
            <span className="badge bg-orange-950 text-orange-400 border border-orange-800">
              {streak} 🔥
            </span>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: "Time", value: fmt(timer), color: "text-blue-400" },
          { label: "Streak", value: `${streak}🔥`, color: "text-orange-400" },
          { label: "Solved", value: totalSolved, color: "text-green-400" },
          {
            label: "Hints",
            value: `${maxHints - hintsUsed} left`,
            color: "text-purple-400",
          },
        ].map((s) => (
          <div key={s.label} className="card py-2.5 px-1 text-center">
            <p className={`font-display font-bold text-base ${s.color}`}>
              {s.value}
            </p>
            <p className="text-slate-600 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Always-visible Hints (paheli style) ── */}
      {!alreadyDone && (gameState === "idle" || gameState === "playing") && (
        <HintsPanel puzzle={puzzle} />
      )}

      {/* ── Secret letter hint (on button press) ── */}
      <AnimatePresence>
        {hintVisible && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card mb-4 bg-green-950/40 border-green-800/50 text-center"
          >
            <p className="text-green-300 text-sm">
              🔑 Secret hint: {puzzle?.hint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Already completed ── */}
      {alreadyDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card mb-5 text-center border-green-800/50 bg-green-950/30"
        >
          <p className="text-3xl mb-2">✅</p>
          <p className="font-display text-green-400 font-bold text-lg">
            Already solved today!
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Score: <span className="text-white font-bold">{score}</span>
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Come back tomorrow for a new puzzle 🌅
          </p>
        </motion.div>
      )}

      {/* ── Result banners ── */}
      <AnimatePresence>
        {gameState === "won" && !alreadyDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card mb-5 text-center border-green-700/50 bg-green-950/30"
          >
            <p className="text-5xl mb-3">🎉</p>
            <p className="font-display text-green-400 font-bold text-2xl">
              Solved!
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <div>
                <p className="font-display text-xl text-white font-bold">
                  {score}
                </p>
                <p className="text-slate-500 text-xs">Score</p>
              </div>
              <div>
                <p className="font-display text-xl text-white font-bold">
                  {fmt(timer)}
                </p>
                <p className="text-slate-500 text-xs">Time</p>
              </div>
              <div>
                <p className="font-display text-xl text-white font-bold">
                  {attempts.length}
                </p>
                <p className="text-slate-500 text-xs">Attempts</p>
              </div>
            </div>
            {puzzle?.type === "word" && (
              <p className="text-slate-500 text-sm mt-3">
                Word:{" "}
                <span className="text-white font-display font-bold">
                  {puzzle.targetWord}
                </span>
              </p>
            )}
          </motion.div>
        )}
        {gameState === "lost" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card mb-5 text-center border-red-800/40 bg-red-950/20"
          >
            <p className="text-5xl mb-3">💀</p>
            <p className="font-display text-red-400 font-bold text-2xl">
              Game Over
            </p>
            <p className="text-slate-400 text-sm mt-3">
              Answer:{" "}
              <span className="text-white font-display font-bold">
                {puzzle?.type === "word" ? puzzle.targetWord : puzzle?.answer}
              </span>
            </p>
            <p className="text-slate-600 text-xs mt-2">
              Try again tomorrow! 💪
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Idle / start screen ── */}
      {gameState === "idle" && !alreadyDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card mb-5 text-center"
        >
          <p className="text-4xl mb-3">🧩</p>
          <p className="font-display text-white font-bold text-xl mb-1">
            {puzzle?.type === "word"
              ? `Guess the ${puzzle.wordLength}-letter word`
              : `Solve: ${puzzle?.question}`}
          </p>
          <p className="text-slate-500 text-sm mb-5">
            {puzzle?.type === "word"
              ? `${puzzle.maxAttempts} attempts · ${puzzle.difficulty} difficulty`
              : `${puzzle?.maxAttempts} attempts allowed`}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowInstructions(true)}
              className="btn-secondary px-4 py-2 text-sm"
            >
              How to play
            </button>
            <button onClick={startGame} className="btn-primary px-6">
              Start →
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Active game ── */}
      {(gameState === "playing" ||
        ((gameState === "won" || gameState === "lost") && !alreadyDone)) && (
        <div className="mt-2">
          {puzzle?.type === "word" ? (
            <WordPuzzle
              puzzle={puzzle}
              attempts={attempts}
              input={input}
              onInput={setInput}
              onSubmit={() => submit()}
              gameState={gameState}
            />
          ) : (
            <NumberPuzzle
              puzzle={puzzle}
              attempts={attempts}
              input={input}
              onInput={setInput}
              onSubmit={submit}
              gameState={gameState}
            />
          )}
        </div>
      )}

      {/* ── Secret hint button (extra letter hint) ── */}
      {gameState === "playing" && (
        <div className="flex justify-center mt-4">
          <button
            onClick={useHint}
            disabled={hintsUsed >= maxHints}
            className="btn-ghost text-sm flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            🔑 Reveal a secret hint{" "}
            <span className="text-slate-600">
              ({maxHints - hintsUsed} left)
            </span>
          </button>
        </div>
      )}

      {/* ── Attempts remaining ── */}
      {gameState === "playing" && puzzle && (
        <p className="text-center text-slate-700 text-xs mt-3 font-display">
          {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining
        </p>
      )}
    </div>
  );
}
