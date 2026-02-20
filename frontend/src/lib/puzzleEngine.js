const PUZZLE_SECRET = import.meta.env.VITE_PUZZLE_SECRET || 'bluestock-puzzle-secret-2026'

export async function generateSeed(dateStr) {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${dateStr}:${PUZZLE_SECRET}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

class RNG {
  constructor(seed) { this.s = parseInt(seed.slice(0, 8), 16) || 99991 }
  next() { this.s = (this.s * 1664525 + 1013904223) & 0xffffffff; return (this.s >>> 0) / 4294967296 }
  int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min }
  pick(arr) { return arr[this.int(0, arr.length - 1)] }
}

// Format: [WORD, emoji, categoryClue, hint1, hint2]
// Easy: 120 words | Medium: 150 words | Hard: 95 words = 365 total
const WORDS = {
  easy: [
    ['APPLE','🍎','A fruit — red or green, grows on trees','Doctors fear me, teachers get gifted me, Newton found gravity because of me.','I am sweet with seeds inside, a worm sometimes lives in me, I keep illness away.'],
    ['BRAVE','🦁','A quality — what heroes are made of','I am not a person but I make soldiers march into battle without fear.','Cowards run from me, heroes carry me in their chest, not in any pocket.'],
    ['CLOCK','🕐','A device — always moving, never stops','I have hands but cannot clap, I have a face but cannot smile.','I run all day and night without tiring, I tick but I am not a bomb.'],
    ['DANCE','💃','An activity — body speaks without words','I need music but I am not a song, I use feet but I am not a walk.','People do me at weddings, on stages, and when they feel very happy.'],
    ['EAGLE','🦅','A bird — king of the sky','I am a bird but fly higher than most, countries put me on their flags.','I have sharp eyes and sharp claws, I hunt from the sky and miss nothing.'],
    ['FLAME','🔥','Fire — born from heat, killed by water','I dance without legs, eat without a mouth, die when you blow on me.','I give light and warmth but if you touch me I will hurt you badly.'],
    ['GRACE','🕊️','A quality — smooth and elegant movement','I am not beauty but I make beautiful things even more beautiful.','Dancers have me, elephants do not. A swan has me, a duck does not.'],
    ['HEART','❤️','Body organ — beats 100,000 times daily','I work your entire life without break, if I stop you stop too.','I sit in your chest, poets write about me, but I do not feel emotions.'],
    ['LIGHT','💡','Physics — fastest thing in the universe','I am not matter but I fill a room the moment you open a dark door.','Nothing travels faster than me, darkness disappears wherever I go.'],
    ['MAGIC','🪄','Entertainment — makes impossible look possible','I make rabbits appear from empty hats and coins vanish from open hands.','I am not real but feel real, children believe in me, adults forget me.'],
    ['NOVEL','📚','Literature — a long story in book form','I have hundreds of pages but am not a textbook, characters but no actors.','I can take you to another world without you leaving your chair.'],
    ['OCEAN','🌊','Geography — covers 71 percent of Earth','I am deeper than any mountain is tall, I hold more secrets than any library.','Ships sail on me, fish live in me, I have waves but no hands.'],
    ['PEACE','☮️','A state — when all guns go silent','Wars end when I arrive, every country wants me but few can keep me.','I am not something you can touch or buy, the whole world searches for me.'],
    ['RIVER','🏞️','Geography — always flowing, never stopping','I run forever but have no legs, I have a mouth but never speak.','I start from mountains and end in the sea, cities grow on my banks.'],
    ['SMILE','😊','Expression — costs nothing, gives everything','I am free to give but priceless to receive, I live on faces not pockets.','I am contagious but not a disease, no doctor can prescribe me yet I heal.'],
    ['TRUST','🤝','Relationship — years to build, seconds to destroy','I take years to build but seconds to destroy, invisible but very heavy.','Friendships are built on me, without me even family falls apart.'],
    ['GREAT','🌟','Adjective — bigger and better than good','Good is my little brother, excellent is my neighbour, I sit between them.','Emperors are called me, famous walls are named with me, I mean more than big.'],
    ['WORLD','🌍','Geography — the planet where life exists','I am round but not a ball, I spin but I am not a top.','Seven continents live inside me, billions walk on me every day.'],
    ['STONE','🪨','Nature — harder than wood, older than trees','I am older than any living thing, rivers shape me over thousands of years.','David used me to defeat Goliath, buildings are made of me, I sink in water.'],
    ['SWORD','⚔️','Weapon — long blade, used in ancient wars','Kings carry me, knights swing me, I am the weapon of ancient warriors.','Pull me from a stone and become a legend, I have two edges, one purpose.'],
    ['BREAD','🍞','Food — made from flour, eaten daily worldwide','I am baked in an oven, I come in slices, and I am the staff of life.','Butter goes on me, sandwiches are made with me, I rise before I am ready.'],
    ['CLOUD','☁️','Weather — white or grey, floats in the sky','I float above you all day, I carry rain but am made of water myself.','Planes fly through me, I block the sun, I come in many shapes and sizes.'],
    ['DREAM','💭','Mind — what happens when you sleep','I come to you every night without being invited, I vanish when you wake.','Some are sweet, some are scary, all of them disappear with the morning light.'],
    ['EARTH','🌱','Nature — soil where plants grow','Plants grow in me, worms live in me, farmers turn me every season.','I am not the planet but I am what you dig when you plant a seed.'],
    ['FAITH','🙏','Belief — trusting what you cannot see','I am stronger than proof, I move mountains according to the old books.','Religious people carry me, scientists question me, everyone needs some of me.'],
    ['GHOST','👻','Supernatural — the spirit of the dead','I have no body but I frighten everyone, I walk through walls without effort.','Children dress as me on Halloween, old houses are said to have me inside.'],
    ['HONEY','🍯','Food — made by bees, sweeter than sugar','Bees make me in their home, bears love to steal me from the hive.','I never expire, I have been found in ancient tombs still perfectly good.'],
    ['IMAGE','🖼️','Visual — a picture or reflection','I am what a mirror shows you, I am what a camera captures forever.','Paint me, print me, post me — I tell a thousand words without any sound.'],
    ['JOKER','🃏','Card game — the wild card in the deck','I am not a king, queen or number, but I can become any card I choose.','In a deck of cards I am special, in real life I am the one who makes you laugh.'],
    ['KNIFE','🔪','Tool — sharp blade used in kitchen','Chefs cannot work without me, I slice vegetables and cut through bread.','I am dangerous if misused, but in the kitchen I am the most important tool.'],
    ['LEMON','🍋','Fruit — sour, yellow, used in drinks','I am yellow and sour, when life gives me to you, make a drink with me.','I am used in tea, in cake, and to clean, my juice makes your lips pucker.'],
    ['MONEY','💰','Finance — used to buy things','I make the world go round, everyone wants me but few have enough of me.','I can be paper, coin or digital, but my power remains the same always.'],
    ['NIGHT','🌙','Time — opposite of day, when stars appear','The sun hides when I come, stars appear, and owls wake up for me.','I am dark and quiet, some fear me, others love me for the peace I bring.'],
    ['ORDER','📋','Concept — arrangement in proper sequence','Without me kitchens, armies and libraries would all fall into chaos.','I am what rules bring, I am what chaos destroys, I am what you need to function.'],
    ['PIANO','🎹','Music — instrument with black and white keys','I have 88 keys but no locks, I make music when fingers press me gently.','Mozart played me as a child, I fill concert halls with beautiful sound.'],
    ['QUEEN','👑','Royalty — female ruler of a kingdom','I rule the kingdom when no king is present, I am the most powerful piece in chess.','Bees have one of me in every hive, countries have had many of me throughout history.'],
    ['RADIO','📻','Technology — broadcasts sound through the air','I send music and news without wires, I was how the world once heard the news.','Before TV I was the main entertainment, sailors used me to send emergency signals.'],
    ['SHADE','🌳','Nature — area protected from the sun','Trees give me to tired travellers, I follow you on sunny days.','I am not dark but I am not bright, I live where sun and shadow meet.'],
    ['TABLE','🪑','Furniture — flat surface with four legs','Families gather around me for meals, students write their homework on me.','I have four legs but cannot walk, I hold things up but cannot stand myself.'],
    ['UNCLE','👨','Family — your parent\'s brother','He is not your father but he is almost as important in the family tree.','He brings gifts, tells stories, and is always your parent\'s sibling.'],
    ['VOICE','🎤','Sound — what you use to speak and sing','Singers use me to move crowds, teachers use me to share knowledge.','I am unique to every person, like a fingerprint but made of sound.'],
    ['WATER','💧','Nature — clear liquid essential for life','Every living thing needs me, I cover most of the planet, I have no taste or smell.','I flow downhill always, I take the shape of any container that holds me.'],
    ['EXTRA','➕','Adjective — more than what is needed','I am what you get when you ask for a little more, the bonus in the deal.','Films have me in the background, pizza has me cheese, bags have me pockets.'],
    ['YOUNG','🌱','Age — not old, at the beginning of life','Children are called me, the opposite of aged, full of energy and potential.','Every old person was once me, and every me will someday become old.'],
    ['ZEBRA','🦓','Animal — black and white stripes','I look like a horse wearing pyjamas, I live on the African plains.','No two of me have the same pattern, lions chase me across the savannah.'],
    ['ARROW','🏹','Object — points in a direction','I am shot from a bow, I always point the way, I never go backwards.','Maps use me to show direction, Cupid shoots me to make people fall in love.'],
    ['BEACH','🏖️','Geography — where land meets the sea','Sand between toes, waves in your ears, the sun above and shells below.','Crabs live on me, sunbathers visit me, and storms sometimes swallow me.'],
    ['CANDY','🍬','Food — sweet treat, children love it','Halloween is my favourite holiday, dentists are my worst enemy.','I come in every colour and flavour, too much of me causes cavities.'],
    ['DIARY','📓','Writing — personal record of daily events','Anne Frank made me famous, I keep your secrets between my covers.','You lock me up so others cannot read me, I remember what you forget.'],
    ['ELDER','👴','Age — older and wiser than others','Villages listen to me, families respect me, I have lived through much.','I am not just old, I carry wisdom that only years of living can give.'],
    ['FLUTE','🎵','Music — instrument you blow into','I am the oldest instrument, made of bamboo or silver, you blow across my top.','Krishna played me in ancient stories, I make the sweetest high-pitched melody.'],
    ['GRAIN','🌾','Nature — small seed used to make food','Rice, wheat and barley are all types of me, I feed most of the world.','I grow in fields, I am ground into flour, I am the beginning of bread.'],
    ['HOTEL','🏨','Building — place to stay away from home','Travellers sleep in me, I have many rooms, a lobby, and usually a restaurant.','I give you a room, a bed, and breakfast, but you must leave by checkout time.'],
    ['INBOX','📬','Technology — where your emails arrive','Every morning I fill up overnight, spam clutters me, important messages hide in me.','I am where messages wait for you, I am the digital postbox of the modern world.'],
    ['JUICE','🥤','Drink — liquid squeezed from fruits','I come from oranges, apples and mangoes, I am healthy and sweet.','Children love me at breakfast, I am made by squeezing fruit until it gives up its liquid.'],
    ['KITE','🪁','Toy — flies in the wind on a string','Children fly me on windy days, I dance in the sky connected to you by a thread.','Benjamin Franklin used me with a key to discover electricity.'],
    ['LUNCH','🥗','Meal — eaten in the middle of the day','I come after breakfast and before dinner, office workers eat me at their desks.','Tiffin boxes carry me to school, I give energy for the afternoon ahead.'],
    ['MARCH','📅','Calendar — third month of the year','I am when spring arrives in the north, I am also what soldiers do in formation.','Holi falls in me, I have thirty-one days, I am between February and April.'],
    ['NURSE','👩‍⚕️','Healthcare — cares for patients in hospital','Doctors diagnose but I am the one who stays by your side all night.','Florence Nightingale made me famous, I check your temperature and give you medicine.'],
    ['OLIVE','🫒','Food — small fruit used in Mediterranean cooking','I am pressed into oil that cooks the world\'s best food, I am green or black.','Greeks and Italians use me in everything, I am a symbol of peace and victory.'],
    ['PAINT','🎨','Art — coloured liquid applied to surfaces','Michelangelo used me on a ceiling, children use me to express their feelings.','I come in tubes or cans, a brush applies me, I dry and become permanent.'],
    ['QUIET','🤫','State — absence of noise','Libraries demand me, meditation needs me, sleeping babies require me.','I am the opposite of noise, the most valuable resource in a busy city.'],
    ['ROCKY','⛰️','Adjective — full of rocks, rough terrain','Mountains are called me, paths are called me, roads that are hard to travel are me.','If the way is easy it is smooth, if the way is hard it is me.'],
    ['SUGAR','🍭','Food — sweet white crystals','Tea needs me, cakes are made with me, but too much of me is bad for your health.','I come from sugarcane, I am found in every kitchen, I make everything sweet.'],
    ['TIGER','🐯','Animal — largest wild cat, orange with stripes','I am the national animal of India, I hunt alone and swim unlike other cats.','I am orange with black stripes, I roar in the jungle, I am endangered today.'],
    ['UMBRA','🌑','Astronomy — darkest part of a shadow','During a solar eclipse I am the darkest central part of the moon\'s shadow.','Penumbra is my lighter cousin, I am where no sunlight reaches at all.'],
    ['VIOLA','🎻','Music — instrument between violin and cello','I am larger than a violin but smaller than a cello, orchestras need me.','I am often overlooked in the string section, but without me harmony is incomplete.'],
    ['WHEAT','🌾','Agriculture — grain used to make bread and pasta','Half the world eats me every day without knowing, I am in your bread and pasta.','Punjab grows me in India, mills grind me into flour, ovens bake me into bread.'],
    ['XERIC','🏜️','Environment — very dry with little water','Deserts are me, cacti thrive in me, most plants cannot survive me.','I describe places where rain almost never comes and the sun always beats down.'],
    ['YACHT','⛵','Transport — luxury sailing boat','Rich people sail me on the Mediterranean, I have sails and a shiny deck.','I am smaller than a ship but larger than a rowboat, I glide on the water silently.'],
    ['ZONAL','🗺️','Adjective — related to a specific zone or area','Weather forecasters use me when describing temperature zones on a map.','Cities are divided into me areas for planning buildings and roads.'],
    ['ANGEL','😇','Religion — heavenly being with wings','I appear in every major religion, I bring messages from above.','I have wings but I am not a bird, I guard and guide those who believe in me.'],
    ['BLAZE','🔥','Fire — a large and bright fire','Forest fires are me, bonfires aspire to be me, I am fire at its most intense.','I am not just a small flame, I am fire that has grown beyond control.'],
    ['CHAIN','⛓️','Object — connected metal links','Bicycles use me to move, prisoners are bound by me, jewellery is made of me.','I am only as strong as my weakest link, I hold things together by connecting them.'],
    ['DEPOT','🏭','Building — storage or transport hub','Buses and trains start and end their journeys at me, goods are stored in me.','I am the base of operations, the starting point, the place things are kept in bulk.'],
    ['EIGHT','8️⃣','Number — comes after seven','I am a perfect square, I am the number of legs on a spider, I follow seven.','Turn me on my side and I become infinity, I am twice four and half sixteen.'],
    ['FLOCK','🐦','Animals — group of birds moving together','Geese fly in a V-shape as me, sheep also gather in me, I am strength in numbers.','When birds move together in the sky they are called me, a beautiful coordinated mass.'],
    ['GLOBE','🌐','Object — round model of the Earth','Teachers use me to show geography, it sits on a stand and you can spin it.','I show every country, ocean and mountain range in miniature form.'],
    ['HUMID','💦','Weather — air full of moisture','Tropical countries feel me every day, your hair frizzes and skin feels sticky.','I am not just warm, I am warm and wet, the kind of heat that exhausts you.'],
    ['IVORY','🦷','Material — creamy white material from tusks','Elephants are killed for me, I am creamy white, piano keys were once made of me.','I am illegal to trade now because of the elephants I come from.'],
    ['JUMBO','🐘','Size — very large, extra big','Airlines named their biggest plane after me, elephants are nicknamed me.','I am not just big, I am so big that I get a special name for my size.'],
    ['KARMA','☯️','Philosophy — what you give is what you get','Hinduism teaches me, Buddhism follows me, even modern people believe in me.','Do good and I will reward you, do bad and I will return it to you in time.'],
    ['LASER','🔦','Technology — focused beam of light','I can cut through metal, play your music CDs, and correct your eyesight.','I am not just light, I am light that has been focused into a single powerful beam.'],
    ['MAPLE','🍁','Tree — gives syrup, leaf is on Canadian flag','Canada puts me on their flag, I give sweet syrup for pancakes in autumn.','My leaves turn red and gold in fall, they are among the most beautiful in nature.'],
    ['NURSE','👩‍⚕️','Healthcare — cares for sick patients','I work beside doctors, I check your vitals, I hold your hand when you are scared.','Florence Nightingale was the most famous of me, I am the heart of every hospital.'],
    ['OPTIC','👁️','Science — related to light and eyes','Doctors who treat eyes are called me specialists, fibre me cables carry internet.','Everything you see is processed by your optic nerve, I relate to light and vision.'],
    ['PLUMB','📏','Tool — checks if something is perfectly vertical','Builders use me to make sure walls are perfectly straight up and down.','A weight on a string, I find the exact vertical, gravity guides me always.'],
    ['QUILL','🪶','Writing — feather used as a pen','Shakespeare wrote with me, before ballpoint pens I was the only way to write.','I am a large feather dipped in ink, used by scholars in ancient and medieval times.'],
    ['RAVEN','🐦‍⬛','Bird — large black bird, symbol of mystery','Edgar Allan Poe wrote about me, I am completely black and very intelligent.','I live in towers and graveyards in stories, I am smarter than most birds.'],
    ['SCENT','👃','Sense — the smell of something','Flowers have me, perfumes are made of me, memories are often triggered by me.','Dogs track criminals using me, bakeries attract customers through me every morning.'],
    ['THYME','🌿','Herb — used in cooking, smells wonderful','Chefs add me to soups and stews, bees love my flowers, I grow wild on hillsides.','I sound like time but I am a herb, small green leaves with a powerful fragrance.'],
    ['ULTRA','⚡','Prefix — beyond the normal range','Violet light beyond what eyes can see is called me violet, sound beyond hearing is me sonic.','I mean beyond the extreme, further than far, more than the most.'],
    ['VAPOR','💨','Physics — gas form of a liquid','When water boils I rise from the pot, I am what clouds are made of.','Steam engines ran on me, I am water that has become invisible air.'],
    ['WALTZ','💃','Dance — elegant three-beat ballroom dance','Viennese ballrooms made me famous, couples glide in circles to three-beat music.','One two three, one two three — that is my rhythm, formal and beautiful.'],
    ['AXIOM','📐','Logic — a statement accepted as true without proof','Mathematicians start with me, philosophers argue about me, I need no evidence.','All geometry begins with me, Euclid wrote me down and the world accepted them.'],
    ['BROOK','🏞️','Geography — small flowing stream of water','I am smaller than a river but larger than a trickle, I babble over stones.','You can jump over me, fish swim in me, and I eventually join a bigger river.'],
    ['CLOAK','🧥','Clothing — long covering garment like a cape','Wizards wear me, Dracula wears me, secret agents hide weapons under me.','I hang from the shoulders and hide what is beneath, I am the garment of mystery.'],
    ['DEPOT','🏭','Location — place for storage or transport','Trains depart from me, goods are stored in me, I am the hub of movement.','Every logistics operation has me at its centre, I am where journeys begin and end.'],
    ['ELITE','🏆','Social class — the best of the best','Special forces are called me units, top universities admit only the me few.','I am not just good, I am the very top tier, the cream that rises above all else.'],
    ['FAUNA','🦁','Biology — all animal life of an area','Flora is the plants, I am the animals — together we describe all life in a place.','Biologists study me, national parks protect me, every continent has unique me.'],
    ['GUAVA','🍐','Fruit — tropical pink-fleshed sweet fruit','I grow in tropical countries, my flesh is pink, my skin is green and bumpy.','Rich in vitamin C, I am eaten raw, made into juice, and turned into sweets.'],
    ['HAVEN','⚓','Place — safe and peaceful shelter','Ships seek me in storms, refugees seek me in wars, tired souls seek me always.','I am not just a place, I am safety, protection from everything dangerous outside.'],
    ['INGOT','🥇','Metal — a block of pure cast metal','Gold and silver are poured into moulds to form me, banks store me in vaults.','I am a brick of pure metal, worth a fortune, heavy and gleaming.'],
    ['JEWEL','💎','Gemstone — precious stone of great beauty','Queens wear me in crowns, lovers give me as gifts, thieves try to steal me.','I am cut and polished from rough rock, I sparkle under light, I am forever.'],
    ['KNOLL','⛰️','Geography — a small rounded hill','I am not a mountain or a cliff, just a gentle rounded hill in the landscape.','Sheep graze on me, picnickers rest on me, I am the soft rise in otherwise flat land.'],
    ['LLAMA','🦙','Animal — South American pack animal','I live high in the Andes, I carry loads for farmers, I spit when angry.','I look like a small camel without a hump, soft wool is made from my coat.'],
    ['MANOR','🏰','Building — large country house with land','Lords and ladies lived in me, I have many rooms and vast grounds around me.','I am not quite a castle but grander than a house, the seat of a wealthy family.'],
    ['NOMAD','🏕️','Lifestyle — person with no fixed home','I follow seasons and food, I carry my home on my back or on animals.','Mongolians were me, Bedouins are me, I never stay in one place for long.'],
    ['OPERA','🎭','Art — dramatic musical performance','Sopranos sing me, orchestras accompany me, audiences dress formally for me.','Pavarotti was its most famous singer, I combine theatre and classical music.'],
    ['PIXEL','🖥️','Technology — smallest unit of a digital image','Zoom in on any photo and eventually you will see me — tiny coloured squares.','A million of me make up a high-resolution photo, I am the atom of digital images.'],
    ['QUOTA','📊','Business — a fixed share or target','Salespeople must meet me each month, countries have me for immigration.','I am the minimum or maximum amount allowed, the target that must be reached.'],
    ['RANCH','🤠','Farm — large farm for raising cattle','Cowboys work on me, cattle roam on me, I am the American wide open farm.','Texas is famous for me, horses are kept on me, beef comes from me.'],
    ['SALSA','💃','Dance or food — spicy sauce or Latin dance','In Mexico I am a spicy tomato sauce, in Cuba I am a fast rhythmic dance.','Chips are dipped in me, couples dance me on Saturday nights, I have two meanings.'],
    ['TRUCE','🤝','Agreement — temporary stop to fighting','Wars pause because of me, arguments end with me, I am peace before peace.','I am not permanent peace but a breathing space, both sides agree to stop fighting.'],
    ['ULCER','🩺','Medical — a painful sore inside the body','Stress causes me, spicy food worsens me, I hurt deep inside the stomach.','I am not visible from outside, I am a painful wound inside your digestive system.'],
    ['VIVID','🌈','Adjective — bright, intense and very clear','Your memories of special moments are me, colours in a rainbow are me.','Dull is my opposite, I am the word for things that are almost too bright and clear.'],
    ['WAFER','🍪','Food — very thin crisp biscuit','Ice cream cones are made with me, I am the crispy shell of a KitKat chocolate.','Thin as paper, crispy to bite, I am between a biscuit and nothing at all.'],
  ],

  medium: [
    ['BINARY','💻','Computer Science — number system using only 0 and 1','I speak only two words — zero and one — yet I power every computer on Earth.','All your photos, videos and games exist as just me — endless zeros and ones.'],
    ['CRYPTO','🔐','Finance and Tech — digital encrypted currency','I am money you cannot touch or see, I live in a digital wallet not a pocket.','Bitcoin is my most famous child, banks fear me, hackers try to target me.'],
    ['DESIGN','🎨','Creative — planning how something looks and works','I am the plan before the product, the sketch before the painting.','Without me apps look ugly and buildings fall, I am thinking made visible.'],
    ['ENCODE','🔡','Programming — convert data into a coded format','I turn your secrets into strange symbols only the right key can unlock.','Spies used me in wars, computers use me every second to protect your data.'],
    ['FILTER','🔍','Tech — lets some things pass, blocks others','I am a gatekeeper who lets good things in and keeps bad things out.','Water purifiers use me, spam folders use me, cameras use me for effects.'],
    ['GLOBAL','🌐','Geography — relating to the entire world at once','I describe anything that belongs to the whole planet not just one country.','Climate change is me, the internet is me, pandemics spread because of me.'],
    ['HYBRID','⚡','Engineering — two different things combined into one','I am neither fully one thing nor another, I am the best of both worlds.','Some cars are me, part petrol and part electric, mixing old and new technology.'],
    ['IMMUNE','🦠','Biology — body protection against disease','I am your body\'s invisible army, always ready to fight invisible enemies.','Vaccines make you more me, a weak version of me lets diseases win easily.'],
    ['JIGSAW','🧩','Puzzle — pieces that fit together to form a picture','I am a picture broken into many pieces, find all pieces and find me complete.','Patience is needed to complete me, one missing piece makes me incomplete.'],
    ['KERNEL','🌽','OS or Food — the core and most important part','In a computer I am the heart of the OS, in corn I am the seed you eat.','Remove me from an operating system and the entire machine stops working.'],
    ['LAMBDA','λ','Programming — a small nameless function','I am a function with no name, used once then forgotten like a ghost.','I am the eleventh Greek letter, in coding I do big work in very few words.'],
    ['MATRIX','🔢','Math — a grid of rows and columns of numbers','I am a grid of numbers in neat rows and columns, mathematicians love me.','Neo lived inside me in the movies, scientists use me to solve complex equations.'],
    ['NEURAL','🧠','Biology and AI — relating to nerves or brain networks','I describe the network inside your brain and also inside every AI system.','Your thoughts travel through me every second, AI copies my structure to learn.'],
    ['OBJECT','📦','Programming — a bundle of data and behaviour','In coding I am a box that holds related data and actions all together.','Everything in object-oriented programming is me, from buttons to databases.'],
    ['PARSER','🔄','Programming — reads and understands structured text','I read code or data and understand its structure so computers can process it.','Every time a browser opens a webpage it uses me to understand the HTML.'],
    ['QUORUM','🏛️','Law and Politics — minimum members needed for a vote','Without enough members a meeting cannot legally decide anything, I am that minimum.','Parliaments need me before voting, courts need me before ruling.'],
    ['ROUTER','📡','Networking — traffic police of the internet','I decide which road your internet data takes to reach its destination.','Without me your phone cannot connect to the internet, I live in your home.'],
    ['SYNTAX','📝','Programming — the grammar rules of a coding language','I am the grammar of programming, break my rules and code will not run.','Every language has me, English has me, Python has me, music has me.'],
    ['TENSOR','📐','Math and AI — multi-dimensional data container','I am like a spreadsheet in multiple dimensions, AI uses me to think.','Google named their AI framework after me, I hold the data that teaches machines.'],
    ['VECTOR','➡️','Math — has both a size and a specific direction','I am not just a number, I know exactly how big and which way to point.','GPS uses me to navigate you, game characters move because of me.'],
    ['IMPORT','📥','Programming and Trade — bring something in from outside','Countries do me with goods, programmers do me with code libraries.','Every Python file starts with me to bring in tools from other packages.'],
    ['EXPORT','📤','Programming and Trade — send something out to others','Countries do me when they sell goods abroad, functions do me to share results.','India does me with software, JavaScript files do me with their functions.'],
    ['STATIC','🔒','Programming — fixed and does not change','I am the opposite of dynamic, I do not move, I do not change, I stay put.','A still photograph is me, a website with no interaction is me, stone is me.'],
    ['DEPLOY','🚀','DevOps — make software live for real users','Developers build apps then do me to make it available to the world.','After months of coding, the final step before users can use the app is me.'],
    ['AGILE','🏃','Software — flexible development methodology','Sprints, standups and backlogs are all part of me, I am how modern teams work.','I am not just fast, I am a philosophy for building software in small flexible steps.'],
    ['CACHE','💾','Computing — temporary high-speed storage','Browsers use me to load websites faster, CPUs use me to speed up processing.','I store things you need often so you can get them quickly without going far.'],
    ['DEBUG','🐛','Programming — find and fix errors in code','Every programmer spends half their time doing me, I hunt bugs in code.','The first computer bug was an actual moth, since then I have been a programmer\'s job.'],
    ['EVENT','📅','Programming or Life — something that happens at a time','Button clicks are me in web development, births and deaths are me in life.','Listeners wait for me in code, calendars track me in real life.'],
    ['FETCH','📡','Programming — retrieve data from a server','JavaScript uses me to get data from APIs, browsers do me when loading pages.','I go out to a server and come back with exactly what was asked for.'],
    ['GRANT','💰','Finance — money given without repayment','Governments give me to startups, universities give me to researchers.','Unlike a loan I do not need to be paid back, I am free money with conditions.'],
    ['HTTPS','🔒','Web — secure version of HTTP protocol','Every safe website starts with me, the S stands for secure and encrypted.','Without me your data travels naked on the internet, with me it is encrypted.'],
    ['INDEX','📑','Database — structure for fast data lookup','Books have me at the back, databases have me for speed, Google is basically me.','I make searching faster by pointing to exactly where something is stored.'],
    ['JOINS','🔗','Database — combining rows from multiple tables','SQL uses me to combine data from different tables into one result set.','Without me database tables would be isolated islands of unconnected data.'],
    ['KAFKA','📨','Tech — distributed message streaming platform','LinkedIn built me, Netflix uses me, I handle millions of messages per second.','I am not the writer, I am the software that streams data between systems reliably.'],
    ['LOCAL','📍','Computing — on the current device or machine','Localhost means me, variables inside functions are me, your files are me.','The opposite of remote or cloud, I am right here on the machine you are using.'],
    ['MERGE','🔀','Version control — combining branches of code','Git uses me to combine separate work into one codebase, conflicts must be resolved.','Two rivers become one when they me, two branches of code do the same.'],
    ['NGINX','🌐','Tech — high-performance web server software','I serve millions of websites, I am faster than Apache for static files.','I am pronounced engine-X, I am the most popular web server in the world.'],
    ['OAUTH','🔑','Security — open standard for access delegation','Sign in with Google uses me, Facebook login uses me, I delegate access safely.','I let apps access your data without giving them your password.'],
    ['PATCH','🩹','Software — small fix applied to existing code','When a bug is found a me is released to fix it without a full new version.','I am smaller than an update but more urgent, I fix a specific security hole.'],
    ['QUERY','🔍','Database — a request for specific data','SQL is the language of me, search bars perform me, every database operation starts with me.','I ask the database a question and it returns the answer in rows and columns.'],
    ['REDIS','⚡','Tech — in-memory data store used for caching','Twitter uses me for timelines, I am incredibly fast because I live in RAM.','I am the speed layer of modern web applications, temporary but extremely fast.'],
    ['SCRUM','📋','Agile — framework for managing complex work','Daily standups, sprint planning and retrospectives are all part of me.','Rugby gave me my name, software teams gave me my purpose — organised sprints.'],
    ['TOKEN','🎫','Security — a string representing a credential','JWTs are me, session cookies are me, I prove you are who you say you are.','I am a digital ticket that grants you access without re-entering your password.'],
    ['UNION','⚓','Database or Labour — combining or joining together','SQL has me to combine query results, workers form me to protect their rights.','Two sets become one in mathematics when they me, I unite what was separate.'],
    ['VNODE','🖥️','Systems — virtual node in a distributed system','Distributed hash tables use me to spread data evenly across many servers.','I am not a physical machine but I represent a logical slice of a cluster.'],
    ['WATCH','⌚','Computing — observe changes in files or data','Webpack uses me to rebuild when files change, git has me for repository events.','I am not just a wristwatch, I am the act of monitoring something for changes.'],
    ['XPATH','🗂️','Web — language for navigating XML documents','Web scrapers use me to extract data from HTML pages, I point to specific elements.','Like CSS selectors but for XML, I can navigate any document tree structure.'],
    ['YIELD','📈','Programming or Finance — give up control temporarily','Python generators use me to pause execution, investors look at dividend me.','I pause and resume, I give something now and promise more later.'],
    ['ZLIB','📦','Tech — data compression library','PNG images use me, ZIP files use me, HTTP compression sometimes uses me.','I make data smaller so it takes less space and travels faster across networks.'],
    ['ASYNC','⚡','Programming — not waiting for tasks to complete','JavaScript loves me, I allow code to run without blocking the main thread.','While you wait for a response I let other things happen, I am the art of not waiting.'],
    ['BATCH','📦','Computing — group of jobs processed together','Banks process transactions overnight in me, printers have me jobs in queue.','Instead of one by one, I do everything all at once in a single group operation.'],
    ['CLASS','🏫','Programming — blueprint for creating objects','Every object in OOP comes from me, I define properties and methods together.','I am the template, the cookie cutter, objects are the cookies made from me.'],
    ['DELTA','Δ','Math or Tech — representing change or difference','Greek letter four, in maths I mean change, in Git I mean what changed between commits.','Airlines are named after me, rivers form me at their mouth, I represent difference.'],
    ['ERROR','❌','Computing — something that went wrong in code','Every programmer fears me, stack traces point to me, rubber duck debugging finds me.','I am not the bug itself, I am the message that tells you something went wrong.'],
    ['FRAME','🖼️','Computing or Film — a single unit of display','Videos are made of thousands of me per second, UI layouts use me to organise content.','Animation needs me, cinema needs me, without me there is no motion in motion pictures.'],
    ['GRAPH','📊','Data structure or Math — nodes connected by edges','Facebook is a social me, Google Maps is a routing me, networks are me.','Nodes and edges make me, I show relationships between things that are connected.'],
    ['HOOKS','🪝','React — functions that use state in functional components','useState and useEffect are React me, they let functions do what classes used to do.','Since React 16.8 I revolutionised how developers write frontend components.'],
    ['INPUT','⌨️','Computing — data given to a program','Keyboard, mouse and microphone are all me devices, forms accept me from users.','Every program needs me to do something, without me a computer just sits idle.'],
    ['JUNIT','🧪','Java — unit testing framework','Java developers write tests using me, red means fail and green means pass.','I was the first popular unit testing framework, it inspired testing frameworks in every language.'],
    ['KAFKA','📨','Distributed systems — high-throughput message queue','I store streams of records in categories called topics, consumers read from me.','LinkedIn built me to handle billions of events per day without losing any.'],
    ['LAYER','🥞','Architecture — a level in a software stack','OSI model has seven of me, neural networks have many of me, cakes have me too.','I am the separation of concerns in software, each me has one responsibility.'],
    ['MODAL','🪟','UI — a popup overlay that requires interaction','Login forms often appear as me, confirmations use me, I block the background.','I appear on top of everything and demand your attention before you can continue.'],
    ['NUMPY','🔢','Python — numerical computing library','Data scientists love me, machine learning needs me, I make arrays fast in Python.','Without me Python would be too slow for scientific computing and AI work.'],
    ['OUTPUT','📤','Computing — result produced by a program','Print statements show me, files are written as me, screens display me.','Every program produces me, I am the result of all the computation that happened.'],
    ['PROXY','🔀','Networking — intermediary between client and server','VPNs use me, load balancers are me, I stand between you and the destination.','I pass requests on your behalf, hiding who you really are or where you really are.'],
    ['QUEUE','📋','Data structure — first in, first out collection','Bank lines are me, print jobs wait in me, task schedulers use me constantly.','The first person to join me is the first to leave, patience is my foundation.'],
    ['REGEX','🔍','Programming — pattern matching language','Email validation, phone number checks and URL parsing all use me.','I look like someone sat on the keyboard but I can find any pattern in text.'],
    ['SCOPE','🔭','Programming — where a variable is accessible','Global and local are my two flavours, I decide where a variable can be used.','Outside my boundaries a variable does not exist, inside them it lives freely.'],
    ['TRAIT','🧬','Programming or Biology — a characteristic or interface','Rust has me, Scala has me, biology uses me to describe inherited characteristics.','I define what an object can do without saying how it does it.'],
    ['UNION','🤝','Data structures — combining two sets into one','SQL uses me to merge query results, set theory uses me for combining collections.','Everything in both sets together without duplication is what I give you.'],
    ['VALID','✅','Computing — conforming to rules and constraints','Form submissions are checked to see if they are me, JSON can be me or invalid.','Before data enters a system it is checked to ensure it is me, correct and safe.'],
    ['WEBPACK','📦','JavaScript — module bundler for web applications','React apps use me to bundle JavaScript, I turn many files into one optimised file.','Before me web pages loaded dozens of script files, with me just one or two.'],
    ['XCODE','🍎','Apple — IDE for building iOS and Mac apps','Every iPhone app is built using me, Apple requires me for App Store submissions.','I am the official development environment for Apple platforms only.'],
    ['YIELD','🌾','Programming — generator function keyword','Python generators use me to pause and resume, JavaScript async functions use me too.','I produce values one at a time from a function that can be paused and resumed.'],
    ['ZUSTAND','🐻','React — lightweight state management library','Smaller than Redux but powerful, I manage global state in React apps simply.','German for state, I am the minimalist alternative to heavy state managers.'],
    ['AGILE','🏃','Methodology — iterative software development','Daily standups, sprint reviews and retrospectives define me.','I am not just fast, I am flexible, adaptive and focused on delivering value quickly.'],
    ['BABEL','🗼','JavaScript — transpiler for modern JS code','I convert modern JavaScript into older versions that all browsers understand.','The Tower of me confused languages, the JS tool of me unifies them again.'],
    ['CLONE','🧬','Computing — an exact copy of something','Git uses me to copy repositories, biology uses me to describe genetically identical organisms.','I am identical to the original in every way, a perfect duplicate.'],
    ['DIFFS','📝','Version control — showing what changed in files','Git uses me to show what was added or removed between two versions of a file.','Red lines are deletions, green lines are additions, I am the record of change.'],
    ['EMOJI','😊','Communication — small digital icons expressing emotion','Japanese phones invented me in the 1990s, today I am in every keyboard worldwide.','I am a picture worth a thousand words, I cross language barriers instantly.'],
    ['FLASK','🌡️','Python — micro web framework','I am smaller than Django, perfect for small APIs and prototypes in Python.','Two lines of Python and I create a working web server, I am minimal and elegant.'],
    ['GRUNT','🔧','JavaScript — task runner and build tool','Before Webpack I automated repetitive tasks like minifying and compiling.','I grunt through boring repetitive tasks so developers do not have to.'],
    ['HEROKU','☁️','Cloud — platform for deploying web applications','Git push to deploy, free tier for small projects, I made deployment simple.','Developers love me because deploying an app is just one command with me.'],
    ['INODE','📁','Unix — data structure for file metadata','Every file in Linux has me, I store permissions, size and location of data blocks.','I am not the file itself but the reference that the filesystem uses to find it.'],
    ['JAVAC','☕','Java — the Java compiler command','I turn human readable Java code into bytecode that the JVM can execute.','Every Java program goes through me before it can run anywhere.'],
    ['KLASS','📚','Ruby — spelled unusually to avoid keyword conflict','Ruby developers spell class as me to avoid conflicting with the reserved word.','I am class but renamed, a workaround in the Ruby programming community.'],
    ['LERNA','🌳','JavaScript — tool for managing multiple packages','Monorepos use me to manage multiple packages in a single repository.','I help large JavaScript projects share code between many packages efficiently.'],
    ['MAVEN','🏗️','Java — build automation and dependency management tool','Java projects use me to manage dependencies and build the project automatically.','My pom.xml file describes everything the project needs and how to build it.'],
    ['NEXUS','🔗','Technology — central connection point or repository','Sonatype Nexus stores build artefacts, anatomically I am a point of connection.','All connections flow through me, I am the hub at the centre of a network.'],
    ['OXIDE','⚗️','Chemistry or Tech — a compound containing oxygen','Rust is iron me, Rust the language was inspired by oxidation and reliability.','Most metals form me when exposed to air, I am what happens to iron over time.'],
    ['PIVOT','🔄','Business or Data — turn in a new direction','Startups me when their first idea fails, Excel uses me tables to summarise data.','Instagram started as a check-in app, then they did a me and became a photo app.'],
    ['QUERY','🔎','Database — request for specific data records','SELECT * FROM is the start of me in SQL, search bars send me to APIs.','I ask a question of a database and receive exactly the rows that match my criteria.'],
    ['REACT','⚛️','JavaScript — UI library created by Facebook','I am not a full framework, I am a library for building user interfaces component by component.','Facebook built me, Netflix uses me, I changed frontend development forever.'],
    ['SCALA','🦁','Programming — language combining OO and functional','LinkedIn and Twitter use me in production, I run on the JVM like Java.','I am statically typed, functional and object-oriented all at once, powerful but complex.'],
    ['TYPES','🏷️','Programming — classifications for variables and data','Integer, string, boolean and float are basic me in most programming languages.','Strongly typed languages force you to declare me, loosely typed ones let you ignore me.'],
    ['UNITY','🎮','Tech — game development engine','Mobile games, VR experiences and indie games are often built with me.','Made in me is stamped on thousands of games, I am the most popular game engine for beginners.'],
    ['VAPOR','💨','Swift — web framework for server-side Swift','Apple developers use me to build backend APIs in Swift, the language of iOS.','I am not just water vapour, I am how Swift developers build server applications.'],
    ['WEBPACK','📦','Build tool — bundles JavaScript modules together','I take many files and turn them into a few optimised bundles for the browser.','Tree shaking, code splitting and hot reload are features I bring to projects.'],
    ['XTERM','🖥️','Terminal — JavaScript terminal emulator library','VS Code\'s terminal is built on me, I render terminal output in the browser.','I bring the command line to the web browser, making web-based IDEs possible.'],
    ['YIELD','🌾','Python — keyword for generator functions','I pause a generator function and return a value to the caller temporarily.','Instead of computing everything at once I give you one result at a time.'],
    ['ZUUL','🔒','Netflix — API gateway and edge service','Netflix open sourced me, I route requests to the right microservice backend.','I am the gatekeeper between the outside world and the internal microservices.'],
    ['ALGOL','📜','History — early programming language from 1958','I influenced almost every modern language including C, Java and Python.','My structured blocks, begin and end, inspired curly braces in C and its descendants.'],
    ['BLOCK','🧱','Programming — a section of grouped statements','Curly braces in C define me, begin and end in Pascal define me.','Functions are made of me, loops are made of me, I am the unit of code organisation.'],
    ['CHUNK','📦','Data — a piece or portion of larger data','Streaming sends data in me to avoid waiting for the whole file.','I am not all of the data, just a manageable piece of it sent at a time.'],
    ['DTYPE','🏷️','Python NumPy — data type of array elements','NumPy arrays have me to describe whether elements are integers, floats or strings.','Choosing the right me can save memory and make calculations faster in data science.'],
    ['EVENT','🎯','Programming — an action that triggers a response','Button clicks are me in JavaScript, keystrokes are me, timer completions are me.','The event loop in Node.js processes me asynchronously without blocking.'],
    ['FLOOD','🌊','Networking — overwhelming a system with requests','DDoS attacks me a server with requests until it falls over from exhaustion.','Natural me destroys homes, digital me destroys servers, both are overwhelming.'],
    ['GRIND','⚙️','Computing — intensive repetitive computation','Rendering 3D graphics requires me, training AI models requires days of me.','It is not elegant, it is not clever, it is just raw computational power repeated endlessly.'],
    ['HTTPS','🔒','Web security — encrypted HTTP communication protocol','The padlock in your browser means I am active, protecting your data in transit.','Without me your passwords and credit cards would travel in plain text across networks.'],
  ],

  hard: [
    ['ABSTRACT','🎭','Programming and Art — existing as idea, not physical','I am an idea with no physical form, you cannot touch me or hold me.','In coding I am a class that cannot be turned directly into any working object.'],
    ['BOUNDARY','🚧','Math and General — the edge or limit of something','I tell you exactly where one thing ends and another different thing begins.','Countries have me drawn on maps, ignoring me in code makes programs crash.'],
    ['CALLABLE','📞','Programming — any object that can be called like a function','In Python, if you can put round brackets after my name, I am me.','I am any object that behaves like a function when called with parentheses.'],
    ['DATABASE','🗄️','Tech — organised storage for millions of records','Every single app stores all its important information somewhere inside me.','I am a super-organised filing cabinet that computers search in milliseconds.'],
    ['ENDPOINT','🔌','Networking — address where an API receives requests','When your app needs server data it sends its request directly to me.','I am a URL that servers listen to, like a door that apps knock on for data.'],
    ['FEEDBACK','🔁','Communication — response that helps improve something','Teachers give me to students, users give me to apps, coaches give me to players.','Without me nobody improves, I am the honest mirror that shows your mistakes.'],
    ['GENERATE','⚙️','General and Programming — to create something entirely new','Power plants do me with electricity, AI does me with text, factories do me with goods.','I am the act of bringing something new into existence from absolutely nothing.'],
    ['HEURISTIC','🧠','AI and Problem solving — smart shortcut for good enough answer','I am not perfect but I am very fast, good enough beats perfect when time runs out.','GPS uses me to find routes quickly, AI uses me when calculating all options takes too long.'],
    ['ITERATOR','🔄','Programming — moves through a collection one item at a time','I go through a list one by one, exactly like reading a book page by page.','For loops use me secretly, I remember exactly where I am so you do not have to.'],
    ['JUNCTION','🛤️','Transport and Circuits — point where two or more paths meet','Roads meet at me, electrical wires meet at me, train tracks split apart at me.','I am the exact point where choices happen, left or right, on or off, this or that.'],
    ['ALGORITHM','⚙️','Computer Science — step by step instructions to solve a problem','Every program is built from me, I am the recipe that computers follow to solve problems.','Google\'s search ranking is me, GPS routing is me, sorting a list is the simplest me.'],
    ['BOOTSTRAP','🥾','Web or Computing — self-starting process or CSS framework','Twitter made a CSS me, operating systems have a me process when they start up.','I pull myself up by my own me, I start without outside help.'],
    ['CODEBLOCK','📝','Programming — a section of code treated as a single unit','Indentation defines me in Python, curly braces define me in JavaScript and C.','Functions, loops and conditionals are all built from me, I am the atom of program structure.'],
    ['DEADLOCK','🔒','Operating Systems — two processes waiting for each other forever','Process A waits for B, B waits for A, neither ever moves, the system freezes.','It is the ultimate standoff, nobody wins, nobody moves, everything stops permanently.'],
    ['ENCRYPTOR','🔐','Security — program or device that scrambles data','I take plain text and make it unreadable without the correct key to reverse me.','Military communications use me, HTTPS uses me, WhatsApp end-to-end uses me.'],
    ['FRAMEWORK','🏗️','Software — reusable structure for building applications','Django, Rails and Spring are all me, I give you the skeleton, you fill in the logic.','Without me every developer would solve the same problems from scratch every time.'],
    ['GENERATOR','⚡','Programming — function that yields values lazily','Python has me for infinite sequences, JavaScript has me for async iteration.','I do not compute everything at once, I give you one value at a time on demand.'],
    ['HASHTABLE','#️⃣','Data Structure — maps keys to values using a hash function','Python dictionaries are me under the hood, database indexes use me for speed.','I give you O of one lookup time, the fastest way to find data by key.'],
    ['INTERFACE','🔌','Programming — contract defining what methods a class must have','Java and TypeScript have me, I define what a class promises to do.','I do not provide implementation, only the list of methods that must be implemented.'],
    ['JAVASCRIPT','☕','Web — the programming language of the browser','Every website uses me on the frontend, Node.js runs me on the server too.','Brendan Eich created me in ten days in 1995, I became the language of the web.'],
    ['KUBERNETES','🚢','DevOps — container orchestration system','Google built me to manage containers at scale, I replace manual server management.','I am the captain of the container ship, scheduling and scaling automatically.'],
    ['LOADBALANCER','⚖️','Networking — distributes traffic across multiple servers','When millions visit a website I spread the load so no single server crashes.','I am the traffic cop at the entrance, sending each visitor to a different lane.'],
    ['MIDDLEWARE','🔧','Software — layer between OS and applications','Express.js uses me for authentication and logging, it sits in the request pipeline.','I am not the app itself, I am the pipeline of processing between request and response.'],
    ['NAMESPACE','📁','Programming — container for a set of identifiers','Python modules create me, XML uses me to avoid naming conflicts.','Without me two libraries could both define a class called User and conflict.'],
    ['OBSERVABLE','👁️','Reactive Programming — a stream of values over time','RxJS uses me, Angular relies on me, I emit values asynchronously over time.','Subscribe to me and I will notify you every time something new happens.'],
    ['POLYNOMIAL','📐','Mathematics — expression with multiple terms and powers','Quadratic equations are me of degree two, cubic are degree three.','I am the sum of terms like ax squared plus bx plus c, I describe curves.'],
    ['QUICKSORT','🔀','Algorithms — fast divide-and-conquer sorting algorithm','I am average O n log n, I pick a pivot and divide the array into two halves.','I am not the most stable sort but I am one of the fastest in practice.'],
    ['RECURSION','🔁','Programming — function calling itself to solve smaller subproblems','To understand me, you must first understand me. I define myself in terms of myself.','Factorial and Fibonacci are classic examples, I need a base case to stop myself.'],
    ['SINGLETON','1️⃣','Design Pattern — class with only one instance allowed','Database connections often use me, configuration managers use me.','No matter how many times you ask for me, you always get the exact same instance.'],
    ['THREADING','🧵','Computing — running multiple tasks concurrently','Multi-core CPUs use me, web servers handle many users with me simultaneously.','I divide a program into smaller threads that run at the same time or take turns.'],
    ['UNDEFINED','❓','JavaScript — variable declared but not yet assigned a value','Access a variable before assigning it in JavaScript and you get me.','I am the state of things that exist but have not been given a value yet.'],
    ['VERSIONING','📋','Software — tracking changes with version numbers','Semantic me uses major dot minor dot patch, Git tracks code me automatically.','Without me we would not know which version of a library is installed.'],
    ['WEBSOCKET','🔌','Web — full duplex communication protocol','Chat applications use me, live dashboards use me, I keep connections open.','Unlike HTTP I do not close after each request, I stay open and talk both ways.'],
    ['XMLPARSER','📄','Computing — tool that reads and interprets XML data','RSS feeds are read by me, SOAP web services use me to understand responses.','I traverse XML documents and extract the information your program needs.'],
    ['YARNLOCK','🔒','JavaScript — lockfile ensuring consistent dependencies','I record the exact version of every package so all developers get the same code.','Without me two developers could have different library versions causing bugs.'],
    ['ZEROINDEX','0️⃣','Programming — arrays starting count from zero not one','Most programming languages start counting array positions from me.','The first element of an array is at position me, the second is at position one.'],
    ['ABSTRACTION','🎭','OOP — hiding complex details behind a simple interface','Car drivers use the steering wheel but do not need to know how the engine works.','I hide the complexity, expose only what is needed, making systems easier to use.'],
    ['BREADTHFIRST','🌳','Algorithms — graph traversal exploring all nodes level by level','I explore all neighbours before going deeper, like reading a family tree row by row.','The shortest path in an unweighted graph is found using me.'],
    ['COMPILATION','⚙️','Computing — translating source code into executable code','C and Java go through me before they can run, it catches errors at build time.','I am the transformation from human readable code to machine instructions.'],
    ['DEPENDENCY','📦','Software — external code your project relies on','Node modules are me, Python packages are me, without me you would write everything from scratch.','npm install downloads all my instances, package.json lists all of them.'],
    ['ENCRYPTION','🔐','Security — converting data into unreadable form','AES and RSA are types of me, HTTPS uses me to protect your data online.','Without me your messages, passwords and bank details would be readable by anyone.'],
    ['FUNCTIONAL','🧮','Programming paradigm — using pure functions and avoiding state','Haskell is purely me, JavaScript supports me, React encourages me thinking.','No side effects, no shared state, just input goes in and output comes out.'],
    ['GARBAGECOLLECT','🗑️','Memory Management — automatic freeing of unused memory','Java and Python have me, C does not, I find objects nobody references anymore.','Without me programs would slowly consume all available memory and crash.'],
    ['HORIZONTALSCALE','📈','Architecture — adding more machines to handle load','Cloud computing makes me easy, adding servers instead of upgrading one server.','When traffic spikes you scale out not up, adding width instead of height.'],
    ['IMMUTABLE','🔒','Programming — data that cannot be changed after creation','Strings in Java are me, constants are me, functional programming loves me.','Once created I can never be modified, you can only create a new version of me.'],
    ['JSONWEBTOKEN','🎫','Security — compact self-contained token for authentication','I store user info in a signed token so servers do not need session storage.','Header dot payload dot signature is my format, I travel in the Authorization header.'],
    ['KEYSTROKE','⌨️','Computing — a single press of a key on keyboard','Logging all of me is how keylogger malware steals passwords silently.','Every letter you type is one of me, games listen to me for player input.'],
    ['LINKEDLIST','🔗','Data Structure — nodes connected by pointers','Each element points to the next, insertion is fast, random access is slow.','Unlike arrays I do not need contiguous memory, I am flexible but slow to search.'],
    ['MICROSERVICE','🔧','Architecture — small independent deployable services','Netflix uses hundreds of me, each doing one specific job in the system.','The opposite of a monolith, I am small, focused and independently deployable.'],
    ['NORMALIZATION','📊','Database — organising data to reduce redundancy','First, second and third normal form are my steps, they eliminate duplicate data.','Without me databases store the same information in many places causing inconsistency.'],
    ['OPENTELEMETRY','📡','Observability — standard for collecting metrics and traces','I standardise how distributed systems report their health and performance data.','Logs, metrics and traces are the three pillars I help collect across all services.'],
    ['PAGINATION','📄','Web — dividing content into separate pages','Google search results use me, APIs return me results, books have me numbers.','Without me a million results would all arrive at once crashing the browser.'],
    ['QUERYOPTIMIZER','🔍','Database — component that finds the fastest query plan','It looks at your SQL and decides the best way to execute it efficiently.','Without me every query would do a full table scan taking minutes instead of milliseconds.'],
    ['RATELIMITING','⏱️','API — restricting number of requests in a time period','I prevent abuse, protect servers and ensure fair usage for all API consumers.','Too many requests in too short a time and I will tell you to slow down and wait.'],
    ['SERIALIZATION','📦','Computing — converting objects to storable or transferable format','JSON and XML are forms of me, I turn objects into strings that can be sent or saved.','When data crosses a network it must be me first, on the other side it is deserialized.'],
    ['TRANSACTION','💳','Database — a unit of work that must complete entirely or not at all','ACID properties govern me, if any part fails the whole thing rolls back.','Bank transfers use me, without me a debit could succeed while the credit fails.'],
    ['USERINTERFACE','🖥️','Design — the visual layer users interact with directly','Buttons, forms and menus are all parts of me, UX is about making me pleasant.','Without me software would be command-line-only, I am what non-programmers see.'],
    ['VIRTUALDOM','⚛️','React — in-memory representation of the real DOM','React uses me to calculate the minimum changes needed to update the screen.','I am the draft before the final document, changes are made to me cheaply first.'],
    ['WEBSCRAPING','🕷️','Tech — automatically extracting data from websites','News aggregators use me, price comparison sites use me, researchers use me.','I read web pages like a browser but I extract structured data instead of displaying it.'],
    ['XSSATTACK','⚠️','Security — injecting malicious scripts into web pages','Hackers use me to steal cookies and session tokens from unsuspecting users.','Input sanitisation is the main defence against me, never trust user input.'],
    ['YAMLCONFIG','📝','DevOps — human readable configuration file format','Kubernetes, Docker Compose and CI pipelines use me for configuration.','I am friendlier than XML and JSON for configuration, indentation defines my structure.'],
    ['ZEROTRUST','🔐','Security — never trust always verify architecture','Even internal users must authenticate with me, no implicit trust is given.','Traditional security trusts the inside network, I trust nobody until verified.'],
  ]
}

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
    categoryClue,
    hint1,
    hint2,
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

export async function generateDailyPuzzle(dateStr) {
  const seed = await generateSeed(dateStr)
  const rng = new RNG(seed)
  const date = new Date(dateStr)
  const day = date.getDay()
  const dom = date.getDate()
  const difficulty = (day === 0 || day === 6) ? 'hard' : (dom % 3 === 0) ? 'medium' : 'easy'
  const type = parseInt(seed.slice(0, 2), 16) % 2 === 0 ? 'word' : 'number'
  const puzzle = type === 'word' ? buildWordPuzzle(rng, difficulty) : buildNumberPuzzle(rng, difficulty)
  return { ...puzzle, date: dateStr, seed: seed.slice(0, 16), difficultyLevel: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3, puzzleNumber: getDayNumber(dateStr) }
}

function getDayNumber(dateStr) {
  const start = new Date('2026-01-01')
  return Math.floor((new Date(dateStr) - start) / 86400000) + 1
}

export function calcScore({ timeTaken, difficulty, hintsUsed, attempts, completed }) {
  if (!completed) return 0
  const base = { easy: 100, medium: 220, hard: 380 }[difficulty] || 100
  const timeBonus = Math.max(0, 300 - timeTaken)
  const multiplier = 1 + timeBonus / 300
  const attemptPenalty = Math.max(0, attempts - 1) * 15
  const hintPenalty = hintsUsed * 30
  return Math.max(10, Math.round(base * multiplier - attemptPenalty - hintPenalty))
}

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
