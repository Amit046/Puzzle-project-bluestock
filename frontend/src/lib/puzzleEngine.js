const PUZZLE_SECRET = import.meta.env.VITE_PUZZLE_SECRET || 'bluestock-puzzle-secret-2026'

// ── SHA-256 seed from date ─────────────────────────────────────
export async function generateSeed(dateStr) {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${dateStr}:${PUZZLE_SECRET}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Seeded LCG random ──────────────────────────────────────────
class RNG {
  constructor(seed) { this.s = parseInt(seed.slice(0, 8), 16) || 99991 }
  next() { this.s = (this.s * 1664525 + 1013904223) & 0xffffffff; return (this.s >>> 0) / 4294967296 }
  int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min }
  pick(arr) { return arr[this.int(0, arr.length - 1)] }
}

// ── Word list ──────────────────────────────────────────────────
// Format: [WORD, emoji, categoryClue, hint1_paheli, hint2_paheli]
const WORDS = {
  easy: [
    ['APPLE','🍎',
      'A red or green fruit that grows on trees',
      'Doctors fear me, teachers get gifted me, Newton discovered gravity because of me.',
      'I am sweet with seeds inside, a worm sometimes lives inside me, I keep illness away.'],
    ['BRAVE','🦁',
      'A quality — what heroes are made of',
      'I am not a person, but I make soldiers march into battle without fear.',
      'Cowards run from me, heroes carry me inside their chest, not in any pocket.'],
    ['CLOCK','🕐',
      'A device — it always keeps moving, never stops',
      'I have hands but I cannot clap, I have a face but I cannot smile.',
      'I run all day and night without getting tired, I tick but I am not a bomb.'],
    ['DANCE','💃',
      'An activity — your body speaks without any words',
      'I need music but I am not a song, I use feet but I am not a walk.',
      'People do me at weddings, on stages, and when they feel very happy.'],
    ['EAGLE','🦅',
      'A bird — national symbol of the USA, king of the sky',
      'I am a bird but I fly higher than most, and countries put me on their flags.',
      'I have sharp eyes and sharp claws, I hunt from the sky and miss nothing below.'],
    ['FLAME','🔥',
      'Fire — born from heat, killed by water',
      'I dance without legs, I eat without a mouth, I die when you blow on me.',
      'I give light and warmth to humans, but if you touch me I will hurt you badly.'],
    ['GRACE','🕊️',
      'A quality — smooth, elegant and beautiful movement',
      'I am not beauty itself, but I make beautiful things even more beautiful.',
      'Dancers have me, elephants do not. A swan has me, a duck does not.'],
    ['HEART','❤️',
      'Body organ — beats over 100,000 times every single day',
      'I work your entire life without one break, if I stop then you stop too.',
      'I sit in your chest, poets write about me, but I myself do not feel emotions.'],
    ['LIGHT','💡',
      'Physics — the fastest thing in the entire universe',
      'I am not matter but I fill a room the moment you open a dark door.',
      'Nothing travels faster than me, and darkness disappears wherever I go.'],
    ['MAGIC','🪄',
      'Entertainment — makes the impossible look possible',
      'I make rabbits appear from empty hats and make coins vanish from open hands.',
      'I am not real but I feel real, children fully believe in me, adults slowly forget me.'],
    ['NOVEL','📚',
      'Literature — a long story told in book form',
      'I have hundreds of pages but I am not a textbook, I have characters but no real actors.',
      'I can take you to another world completely without you ever leaving your chair.'],
    ['OCEAN','🌊',
      'Geography — covers 71 percent of the entire Earth',
      'I am deeper than any mountain is tall, I hold more secrets than any library.',
      'Ships sail on me, fish live inside me, I have waves but I have no hands.'],
    ['PEACE','☮️',
      'A state — when all guns finally go silent',
      'Wars end only when I arrive, I am what every country wants but very few can keep.',
      'I am not a thing you can touch or buy, but the whole world is always searching for me.'],
    ['RIVER','🏞️',
      'Geography — always flowing downward, never stopping',
      'I run forever but I have no legs, I have a mouth but I never speak any words.',
      'I start from mountains and I end in the sea, and great cities always grow on my banks.'],
    ['SMILE','😊',
      'Expression — costs nothing but means everything',
      'I am completely free to give but priceless to receive, I live on faces not in pockets.',
      'I am contagious but not a disease, and no doctor can prescribe me yet I heal people.'],
    ['TRUST','🤝',
      'Relationship — years to build, seconds to destroy',
      'I take years to build but only seconds to destroy completely, I am invisible but very heavy.',
      'Friendships are built on me, and without me even the closest family falls apart.'],
    ['GREAT','🌟',
      'Adjective — bigger and better than just good',
      'Good is my little brother, excellent is my neighbour, I sit proudly between them.',
      'Emperors are called me, famous walls are named with me, I mean more than just big.'],
    ['WORLD','🌍',
      'Geography — the only planet where we know life exists',
      'I am round but I am not a ball, I spin constantly but I am not a spinning top.',
      'Seven continents live inside me, and billions of humans walk on me every single day.'],
    ['STONE','🪨',
      'Nature — harder than wood, older than the oldest tree',
      'I am older than any living thing, and rivers slowly shape me over thousands of years.',
      'David used me to defeat Goliath, buildings are made of me, and I always sink in water.'],
    ['SWORD','⚔️',
      'Weapon — long blade, sharp edge, used in ancient wars',
      'Kings carry me, knights swing me, I am the most famous weapon of ancient warriors.',
      'Pull me from a stone and you become a legend, I have two edges and just one purpose.'],
  ],

  medium: [
    ['BINARY','💻',
      'Computer Science — number system using only 0 and 1',
      'I speak only two words — zero and one — yet I power every computer on Earth.',
      'All your photos, videos and games exist as just me — endless zeros and ones.'],
    ['CRYPTO','🔐',
      'Finance and Tech — digital encrypted currency',
      'I am money you cannot touch or see, I live in a digital wallet not in any pocket.',
      'Bitcoin is my most famous child, banks fear me, and hackers always try to target me.'],
    ['DESIGN','🎨',
      'Creative process — planning how something looks and works',
      'I am the plan that comes before the product, the sketch that comes before the painting.',
      'Without me apps look ugly and buildings fall down, I am thinking made visible.'],
    ['ENCODE','🔡',
      'Programming — convert data into a coded format',
      'I turn your secrets into strange symbols that only the right key can unlock again.',
      'Spies used me in wars, and computers use me every second to protect your private data.'],
    ['FILTER','🔍',
      'Tech — lets some things pass and blocks others',
      'I am like a gatekeeper who lets the good things in and keeps the bad things out.',
      'Water purifiers use me, spam folders use me, and camera apps use me for photo effects.'],
    ['GLOBAL','🌐',
      'Geography — relating to the entire world at once',
      'I describe anything that belongs to the whole planet and not just one single country.',
      'Climate change is me, the internet is me, and pandemics spread rapidly because of me.'],
    ['HYBRID','⚡',
      'Engineering — two different things combined into one',
      'I am neither fully one thing nor another, I am always the best of both worlds combined.',
      'Some cars are me, part petrol and part electric, mixing old and new technology together.'],
    ['IMMUNE','🦠',
      'Biology — the body\'s protection system against disease',
      'I am your body\'s invisible army, always ready and waiting to fight invisible enemies.',
      'Vaccines make you more me, and a weak version of me allows every disease to win easily.'],
    ['JIGSAW','🧩',
      'A puzzle — many pieces that fit together to form one picture',
      'I am one picture broken into many small pieces, find all pieces and you find me complete.',
      'Patience is needed to complete me, and just one missing piece makes me forever incomplete.'],
    ['KERNEL','🌽',
      'OS or Food — the core and most important central part',
      'In a computer I am the heart of the operating system, in corn I am the seed you eat.',
      'Remove me from an operating system and the entire machine immediately stops working.'],
    ['LAMBDA','λ',
      'Programming — a small function without any name',
      'I am a function with no name at all, used once then forgotten just like a ghost.',
      'I am the eleventh Greek letter, and in coding I do big important work in very few words.'],
    ['MATRIX','🔢',
      'Math — a grid of rows and columns filled with numbers',
      'I am a perfect grid of numbers arranged in neat rows and columns, mathematicians love me.',
      'Neo lived inside me in the famous movies, scientists use me to solve very complex equations.'],
    ['NEURAL','🧠',
      'Biology and AI — relating to nerves or brain-like networks',
      'I describe the network inside your brain and also the network inside every AI system.',
      'Your thoughts travel through me every single second, and AI copies my structure to learn.'],
    ['OBJECT','📦',
      'Programming — a bundle of data and behaviour together',
      'In coding I am a box that holds related data and related actions all together in one place.',
      'Everything in object-oriented programming is me, from simple buttons to entire databases.'],
    ['PARSER','🔄',
      'Programming — reads and understands structured text or code',
      'I read code or data and understand its structure so computers can process it correctly.',
      'Every time a browser opens a webpage it uses me internally to understand the HTML code.'],
    ['QUORUM','🏛️',
      'Law and Politics — the minimum number needed to make a valid decision',
      'Without enough members present, a meeting cannot legally decide anything, that minimum is me.',
      'Parliaments need me before any voting can happen, courts need me before they can rule.'],
    ['ROUTER','📡',
      'Networking — the traffic police of the internet',
      'I decide which road your internet data must take to safely reach its final destination.',
      'Without me your phone cannot connect to the internet, I live in your home and office.'],
    ['SYNTAX','📝',
      'Programming — the grammar rules of a coding language',
      'I am the grammar of programming languages, break my rules and the code simply will not run.',
      'Every language has me, English has me, Python has me, and even music notation has me.'],
    ['TENSOR','📐',
      'Math and AI — a multi-dimensional container for numbers',
      'I am like a spreadsheet but existing in multiple dimensions at once, AI uses me to think.',
      'Google named their entire AI framework after me, I hold the data that teaches machines.'],
    ['VECTOR','➡️',
      'Math — has both a size and a specific direction',
      'I am not just a number alone, I know exactly how big and also exactly which way to point.',
      'GPS uses me to navigate you, and game characters move across the screen because of me.'],
    ['IMPORT','📥',
      'Programming and Trade — bring something in from outside',
      'Countries do me with physical goods, and programmers do me with useful code libraries.',
      'Every Python file starts with me at the top to bring in tools from other external packages.'],
    ['EXPORT','📤',
      'Programming and Trade — send something out to others',
      'Countries do me when they sell their goods abroad, and functions do me to share their results.',
      'India does me with software services, and JavaScript files do me with their own functions.'],
    ['STATIC','🔒',
      'Programming — fixed, does not change or move at all',
      'I am the complete opposite of dynamic, I do not move, I do not change, I simply stay put.',
      'A still photograph is me, a website with zero interaction is me, a rock sitting still is me.'],
    ['DEPLOY','🚀',
      'DevOps — make software go live for real users',
      'Developers build apps for months and then they do me to make it available to the whole world.',
      'After months of writing code, the very final step before users can use the app is always me.'],
  ],

  hard: [
    ['ABSTRACT','🎭',
      'Programming and Art — existing as an idea, not a physical object',
      'I am an idea with no physical form at all, you cannot touch me or hold me in your hands.',
      'In coding I am a class that cannot be turned directly into any working object by itself.'],
    ['BOUNDARY','🚧',
      'Math and General — the edge or limit of any space or concept',
      'I tell you exactly where one thing ends and another completely different thing begins.',
      'Countries have me drawn on maps, and ignoring me in computer code makes programs crash.'],
    ['CALLABLE','📞',
      'Programming — any object that can be called exactly like a function',
      'In Python, if you can put round brackets after my name, then I am definitely me.',
      'I am any object that behaves like a function when you call its name with parentheses added.'],
    ['DATABASE','🗄️',
      'Technology — organised storage for millions and millions of records',
      'Every single app stores all of its important information somewhere inside me always.',
      'I am like a super-organised filing cabinet that computers can search through in milliseconds.'],
    ['ENDPOINT','🔌',
      'Networking — the specific address where an API receives requests',
      'When your app needs data from a server it sends its request directly to me to get it.',
      'I am a URL that servers listen to carefully, like a special door that apps knock on for data.'],
    ['FEEDBACK','🔁',
      'Communication — a response that helps something or someone improve',
      'Teachers give me to students, users give me to apps, and coaches give me to their players.',
      'Without me nobody ever improves their work, I am the honest mirror showing your mistakes.'],
    ['GENERATE','⚙️',
      'General and Programming — to create or produce something entirely new',
      'Power plants do me with electricity, AI does me with written text, and factories do me with goods.',
      'I am the act of bringing something completely new into existence starting from absolutely nothing.'],
    ['HEURISTIC','🧠',
      'AI and Problem-solving — a smart shortcut to find a good enough answer quickly',
      'I am not a perfect solution at all but I am very fast, good enough always beats perfect when time runs out.',
      'GPS uses me to find you a route quickly, AI uses me when calculating every single option would take too long.'],
    ['ITERATOR','🔄',
      'Programming — moves through a collection one single item at a time',
      'I go through a list one by one carefully, exactly like a person reading a book page by page.',
      'For loops use me secretly behind the scenes, I remember exactly where I am so you do not have to.'],
    ['JUNCTION','🛤️',
      'Transport and Circuits — the point where two or more paths meet together',
      'Roads meet at me, electrical wires meet at me, and train tracks split apart at me.',
      'I am the exact point where important choices happen, left or right, on or off, this way or that.'],
  ]
}

// ── Word puzzle builder ────────────────────────────────────────
export function buildWordPuzzle(rng, difficulty) {
  const list = WORDS[difficulty] || WORDS.medium
  const entry = rng.pick(list)
  const [word, emoji, categoryClue, hint1, hint2] = entry
  const maxAttempts = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 5 : 4
  return {
    type: 'word',
    targetWord: word,
    wordLength: word.length,
    maxAttempts,
    difficulty,
    categoryEmoji: emoji,
    categoryClue,  // 1-line topic shown always
    hint1,         // paheli #1 shown always
    hint2,         // paheli #2 shown always
    hint: `Starts with "${word[0]}", ends with "${word[word.length-1]}", has ${word.length} letters`,
    instructions: [
      `Guess the ${word.length}-letter word`,
      'Type letters and press ENTER',
      '🟩 Green = right letter, right spot',
      '🟨 Yellow = right letter, wrong spot',
      '⬛ Gray = letter not in word'
    ]
  }
}

// ── Number puzzle builder ──────────────────────────────────────
export function buildNumberPuzzle(rng, difficulty) {
  if (difficulty === 'hard') {
    const a = rng.int(3, 12), b = rng.int(3, 12), c = rng.int(1, 10)
    const answer = a * b + c
    return {
      type: 'number', difficulty,
      question: `(? × ${b}) + ${c} = ${answer}`,
      answer: a, maxAttempts: 4,
      hint1: `Step 1: Subtract ${c} from ${answer} → you get ${answer - c}`,
      hint2: `Step 2: Divide ${answer - c} by ${b} → that is your answer`,
      hint: `Subtract ${c} from ${answer}, then divide by ${b}`,
    }
  }
  if (difficulty === 'medium') {
    const a = rng.int(10, 50), b = rng.int(2, 9)
    const answer = a * b
    return {
      type: 'number', difficulty,
      question: `${a} × ${b} = ?`,
      answer, maxAttempts: 5,
      hint1: `Add ${a} to itself — repeat this ${b} times total`,
      hint2: `The answer lies between ${answer - 20} and ${answer + 20}`,
      hint: `${a} added to itself ${b} times`,
    }
  }
  const a = rng.int(10, 50), b = rng.int(5, 30)
  const op = ['+', '-'][rng.int(0, 1)]
  let answer = op === '+' ? a + b : Math.abs(a - b)
  let qa = a, qb = b
  if (op === '-' && a < b) { qa = b; qb = a }
  return {
    type: 'number', difficulty,
    question: `${qa} ${op} ${qb} = ?`,
    answer, maxAttempts: 6,
    hint1: op === '+' ? `Start at ${qa} and count ${qb} steps forward` : `Start at ${qa} and count ${qb} steps backward`,
    hint2: `The answer is between ${Math.max(0, answer - 10)} and ${answer + 10}`,
    hint: 'Basic arithmetic',
  }
}

// ── Main generator ─────────────────────────────────────────────
export async function generateDailyPuzzle(dateStr) {
  const seed = await generateSeed(dateStr)
  const rng = new RNG(seed)

  const date = new Date(dateStr)
  const day = date.getDay()
  const dom = date.getDate()

  const difficulty = (day === 0 || day === 6) ? 'hard'
    : (dom % 3 === 0) ? 'medium' : 'easy'

  const type = parseInt(seed.slice(0, 2), 16) % 2 === 0 ? 'word' : 'number'
  const puzzle = type === 'word' ? buildWordPuzzle(rng, difficulty) : buildNumberPuzzle(rng, difficulty)

  return {
    ...puzzle,
    date: dateStr,
    seed: seed.slice(0, 16),
    difficultyLevel: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
    puzzleNumber: getDayNumber(dateStr)
  }
}

function getDayNumber(dateStr) {
  const start = new Date('2026-01-01')
  return Math.floor((new Date(dateStr) - start) / 86400000) + 1
}

// ── Score calculator ───────────────────────────────────────────
export function calcScore({ timeTaken, difficulty, hintsUsed, attempts, completed }) {
  if (!completed) return 0
  const base = { easy: 100, medium: 220, hard: 380 }[difficulty] || 100
  const timeBonus = Math.max(0, 300 - timeTaken)
  const multiplier = 1 + timeBonus / 300
  const attemptPenalty = Math.max(0, attempts - 1) * 15
  const hintPenalty = hintsUsed * 30
  return Math.max(10, Math.round(base * multiplier - attemptPenalty - hintPenalty))
}

// ── Wordle guess evaluator ─────────────────────────────────────
export function evaluateWordGuess(guess, target) {
  const result = Array(guess.length).fill('absent')
  const tArr = target.split('')
  const gArr = guess.split('')
  gArr.forEach((l, i) => { if (l === tArr[i]) { result[i] = 'correct'; tArr[i] = null; gArr[i] = null } })
  gArr.forEach((l, i) => {
    if (!l) return
    const j = tArr.indexOf(l)
    if (j !== -1) { result[i] = 'present'; tArr[j] = null }
  })
  return result
}
