class RNG {
    constructor(seed) { this.s = seed; }
    next() { this.s = (this.s * 1664525 + 1013904223) & 0xffffffff; return (this.s >>> 0) / 4294967296; }
    int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; }
    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            let j = this.int(0, i);
            let temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
        }
        return arr;
    }
}

function getLegalCrowns(N, rng) {
    for (let attempts = 0; attempts < 1000; attempts++) {
        let cols = rng.shuffle(Array.from({length: N}, (_,i)=>i));
        let valid = true;
        for (let r=1; r<N; r++) {
            let diff = Math.abs(cols[r] - cols[r-1]);
            if (diff <= 1) { valid = false; break; }
        }
        if (valid) {
            // Check diagonal adjacency
            for (let r=0; r<N-1; r++) {
                for (let r2=r+1; r2<N; r2++) {
                    if (Math.abs(r-r2) <= 1 && Math.abs(cols[r]-cols[r2]) <= 1) {
                        valid = false; break;
                    }
                }
            }
        }
        if (valid) return cols;
    }
    return null;
}

function generateRegions(N, crownsRowCols, rng) {
    let grid = Array.from({length: N}, () => Array(N).fill(-1));
    let q = [];
    for(let r=0; r<N; r++) {
        let c = crownsRowCols[r];
        grid[r][c] = r;
        q.push([r, c, r]); // r, c, region
    }
    while(q.length > 0) {
        let idx = rng.int(0, q.length-1);
        let [r, c, reg] = q[idx];
        q.splice(idx, 1);
        
        // neighbors
        let n = [[r-1,c], [r+1,c], [r,c-1], [r,c+1]];
        let added = false;
        for (let [nr, nc] of n) {
            if (nr>=0 && nr<N && nc>=0 && nc<N && grid[nr][nc] === -1) {
                grid[nr][nc] = reg;
                q.push([nr, nc, reg]);
                added = true;
            }
        }
    }
    return grid;
}

function countSolutions(N, grid) {
    let ans = 0;
    function backtrack(r, colsBit, regBit, board) {
        if (ans > 1) return;
        if (r === N) {
            ans++;
            return;
        }
        for (let c=0; c<N; c++) {
            if (colsBit & (1<<c)) continue;
            let reg = grid[r][c];
            if (regBit & (1<<reg)) continue;
            // adj
            if (board.length > 0) {
                let prevC = board[board.length-1];
                if (Math.abs(prevC - c) <= 1) continue;
            }
            board.push(c);
            backtrack(r+1, colsBit | (1<<c), regBit | (1<<reg), board);
            board.pop();
        }
    }
    backtrack(0, 0, 0, []);
    return ans;
}

function generatePuzzle(seed, N) {
    let rng = new RNG(seed);
    for(let iter=0; iter<5000; iter++) {
        let crowns = getLegalCrowns(N, rng);
        if (!crowns) continue;
        let grid = generateRegions(N, crowns, rng);
        if (countSolutions(N, grid) === 1) {
            return grid;
        }
    }
    return null;
}

const start = Date.now();
const g = generatePuzzle(99991, 8);
console.log(Date.now() - start + 'ms');
console.log(g.map(row => row.join(' ')).join('\n'));
