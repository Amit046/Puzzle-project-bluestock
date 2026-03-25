import { generateSeed } from './puzzleEngine'

class RNG {
    constructor(seed) { this.s = parseInt(seed.slice(0, 8), 16) || 99991 }
    next() { this.s = (this.s * 1664525 + 1013904223) & 0xffffffff; return (this.s >>> 0) / 4294967296 }
    int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min }
    shuffle(arr) {
        let a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            let j = this.int(0, i);
            let temp = a[i]; a[i] = a[j]; a[j] = temp;
        }
        return a;
    }
}

function getLegalCrowns(N, rng) {
    let cols = Array.from({length: N}, (_,i)=>i);
    for (let attempts = 0; attempts < 10000; attempts++) {
        let arr = rng.shuffle(cols);
        let valid = true;
        for (let r=1; r<N; r++) {
            if (Math.abs(arr[r] - arr[r-1]) <= 1) { valid = false; break; }
        }
        if (valid) return arr;
    }
    return null;
}

function generateRegions(N, crownsRowCols, rng) {
    let grid = Array.from({length: N}, () => Array(N).fill(-1));
    let q = [];
    for(let r=0; r<N; r++) {
        let c = crownsRowCols[r];
        grid[r][c] = r;
        q.push([r, c, r]);
    }
    while(q.length > 0) {
        let idx = rng.int(0, q.length-1);
        let [r, c, reg] = q[idx];
        q.splice(idx, 1);
        
        let n = [[r-1,c], [r+1,c], [r,c-1], [r,c+1]];
        for (let [nr, nc] of n) {
            if (nr>=0 && nr<N && nc>=0 && nc<N && grid[nr][nc] === -1) {
                grid[nr][nc] = reg;
                q.push([nr, nc, reg]);
            }
        }
    }
    return grid;
}

function countSolutions(N, grid) {
    let ans = 0;
    function backtrack(r, colsBit, regBit, prevC) {
        if (ans > 1) return;
        if (r === N) {
            ans++;
            return;
        }
        for (let c=0; c<N; c++) {
            if (colsBit & (1<<c)) continue;
            let reg = grid[r][c];
            if (regBit & (1<<reg)) continue;
            if (r > 0 && Math.abs(prevC - c) <= 1) continue;
            
            backtrack(r+1, colsBit | (1<<c), regBit | (1<<reg), c);
        }
    }
    backtrack(0, 0, 0, -1);
    return ans;
}

function generatePuzzle(seed, N) {
    let rng = new RNG(seed);
    for(let iter=0; iter<5000; iter++) {
        let crowns = getLegalCrowns(N, rng);
        if (!crowns) continue;
        let grid = generateRegions(N, crowns, rng);
        if (countSolutions(N, grid) === 1) {
            return { grid, solution: crowns };
        }
    }
    return null; // fallback
}

export async function generateDailyCrowns(dateStr) {
    const seed = await generateSeed(dateStr);
    const date = new Date(dateStr);
    const day = date.getDay();
    const dom = date.getDate();
    
    // Easy: 7x7, Medium: 8x8, Hard: 9x9
    const difficultyLevel = (day === 0 || day === 6) ? 3 : (dom % 3 === 0) ? 2 : 1;
    let N = difficultyLevel === 1 ? 7 : difficultyLevel === 2 ? 8 : 9;
    
    let puzzleData = generatePuzzle(seed, N);
    if (!puzzleData) {
        // Safe fallback to a known 7x7
        puzzleData = {
           grid: [
             [0,0,0,1,1,1,1],
             [0,2,0,1,3,3,1],
             [0,2,2,1,3,4,1],
             [0,2,5,3,3,4,4],
             [6,6,5,5,5,4,4],
             [6,6,5,6,6,4,4],
             [6,6,6,6,4,4,4]
           ],
           solution: [2, 5, 0, 6, 3, 1, 4]
        };
        N = 7;
    }
    
    return {
        type: 'crowns',
        difficultyLevel,
        difficulty: difficultyLevel === 1 ? 'easy' : difficultyLevel === 2 ? 'medium' : 'hard',
        date: dateStr,
        seed: seed.slice(0, 16),
        puzzleNumber: getDayNumber(dateStr),
        size: N,
        grid: puzzleData.grid,
        solution: puzzleData.solution,
        maxAttempts: 3,
        question: `Place exactly one crown in each row, column, and color region. Crowns cannot touch each other, not even diagonally.`
    }
}

function getDayNumber(dateStr) {
  const start = new Date('2026-01-01')
  return Math.floor((new Date(dateStr) - start) / 86400000) + 1
}

export function calcCrownsScore({ timeTaken, difficultyLevel, hintsUsed, mistakes }) {
  const base = difficultyLevel === 1 ? 100 : difficultyLevel === 2 ? 220 : 380;
  const timeBonus = Math.max(0, 300 - timeTaken);
  const multiplier = 1 + timeBonus / 300;
  const hintPenalty = hintsUsed * 30;
  const mistakePenalty = mistakes * 20;
  return Math.max(10, Math.round(base * multiplier - hintPenalty - mistakePenalty));
}
