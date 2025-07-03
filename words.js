// Curated list of 5-letter words for Wordly game
const GAME_WORDS = [
    "about", "above", "abuse", "actor", "acute", "admit", "adopt", "adult", "after", "again",
    "agent", "agree", "ahead", "alarm", "album", "alert", "alien", "align", "alive", "allow",
    "alone", "along", "alter", "among", "anger", "angle", "angry", "apart", "apple", "apply",
    "arena", "argue", "arise", "array", "aside", "asset", "avoid", "awake", "award", "aware",
    "badly", "baker", "bases", "basic", "beach", "began", "begin", "being", "below", "bench",
    "billy", "birth", "black", "blame", "blank", "blind", "block", "blood", "board", "boost",
    "booth", "bound", "brain", "brand", "brass", "brave", "bread", "break", "breed", "brief",
    "bring", "broad", "broke", "brown", "build", "built", "buyer", "cable", "calif", "carry",
    "catch", "cause", "chain", "chair", "chaos", "charm", "chart", "chase", "cheap", "check",
    "chest", "chief", "child", "china", "chose", "civil", "claim", "class", "clean", "clear",
    "click", "climb", "clock", "close", "cloud", "coach", "coast", "could", "count", "court",
    "cover", "craft", "crash", "crazy", "cream", "crime", "cross", "crowd", "crown", "crude",
    "curve", "cycle", "daily", "dance", "dated", "dealt", "death", "debut", "delay", "depth",
    "doing", "doubt", "dozen", "draft", "drama", "drank", "dream", "dress", "drill", "drink",
    "drive", "drove", "dying", "eager", "early", "earth", "eight", "elite", "empty", "enemy",
    "enjoy", "enter", "entry", "equal", "error", "event", "every", "exact", "exist", "extra",
    "faith", "false", "fault", "fiber", "field", "fifth", "fifty", "fight", "final", "first",
    "fixed", "flash", "fleet", "floor", "fluid", "focus", "force", "forth", "forty", "forum",
    "found", "frame", "frank", "fraud", "fresh", "front", "fruit", "fully", "funny", "giant",
    "given", "glass", "globe", "going", "grace", "grade", "grand", "grant", "grass", "grave",
    "great", "green", "gross", "group", "grown", "guard", "guess", "guest", "guide", "happy",
    "harry", "heart", "heavy", "henry", "horse", "hotel", "house", "human", "ideal", "image",
    "index", "inner", "input", "issue", "japan", "jimmy", "joint", "jones", "judge", "known",
    "label", "large", "laser", "later", "laugh", "layer", "learn", "lease", "least", "leave",
    "legal", "level", "lewis", "light", "limit", "links", "lives", "local", "loose", "lower",
    "lucky", "lunch", "lying", "magic", "major", "maker", "march", "maria", "match", "maybe",
    "mayor", "meant", "media", "metal", "might", "minor", "minus", "mixed", "model", "money",
    "month", "moral", "motor", "mount", "mouse", "mouth", "moved", "movie", "music", "needs",
    "nerve", "never", "newly", "night", "noise", "north", "noted", "novel", "nurse", "occur",
    "ocean", "offer", "often", "order", "other", "ought", "paint", "panel", "paper", "party",
    "peace", "peter", "phase", "phone", "photo", "piano", "piece", "pilot", "pitch", "place",
    "plain", "plane", "plant", "plate", "point", "pound", "power", "press", "price", "pride",
    "prime", "print", "prior", "prize", "proof", "proud", "prove", "queen", "quick", "quiet",
    "quite", "radio", "raise", "range", "rapid", "ratio", "reach", "ready", "realm", "rebel",
    "refer", "relax", "repay", "reply", "right", "rigid", "rival", "river", "robin", "roger",
    "roman", "rough", "round", "route", "royal", "rural", "scale", "scene", "scope", "score",
    "sense", "serve", "setup", "seven", "shall", "shape", "share", "sharp", "sheet", "shelf",
    "shell", "shift", "shine", "shirt", "shock", "shoot", "short", "shown", "sides", "sight",
    "silly", "since", "sixth", "sixty", "sized", "skill", "sleep", "slide", "small", "smart",
    "smile", "smith", "smoke", "snake", "snow", "so", "soap", "soccer", "social", "soft",
    "solar", "solid", "solve", "sorry", "sound", "south", "space", "spare", "speak", "speed",
    "spend", "spent", "split", "spoke", "sport", "staff", "stage", "stake", "stand", "start",
    "state", "steam", "steel", "stick", "still", "stock", "stone", "stood", "store", "storm",
    "story", "strip", "stuck", "study", "stuff", "style", "sugar", "suite", "super", "sweet",
    "table", "taken", "taste", "taxes", "teach", "teeth", "terry", "texas", "thank", "theft",
    "their", "theme", "there", "these", "thick", "thing", "think", "third", "those", "three",
    "threw", "throw", "thumb", "tiger", "tight", "timer", "tired", "title", "today", "topic",
    "total", "touch", "tough", "tower", "track", "trade", "train", "treat", "trend", "trial",
    "tribe", "trick", "tried", "tries", "truck", "truly", "trunk", "trust", "truth", "twice",
    "uncle", "under", "undue", "union", "unity", "until", "upper", "upset", "urban", "usage",
    "usual", "valid", "value", "video", "virus", "visit", "vital", "vocal", "voice", "waste",
    "watch", "water", "wheel", "where", "which", "while", "white", "whole", "whose", "woman",
    "women", "world", "worry", "worse", "worst", "worth", "would", "write", "wrong", "wrote",
    "young", "youth", "equal", "wheat", "forth", "metal", "beach", "inner", "steam", "royal"
];

// Function to get a random word for the game
function getRandomWord() {
    // return GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)].toUpperCase();
    return "ABOUT";
}

// Function to check if a word is in our game word list (for additional validation)
function isGameWord(word) {
    return GAME_WORDS.includes(word.toLowerCase());
} 