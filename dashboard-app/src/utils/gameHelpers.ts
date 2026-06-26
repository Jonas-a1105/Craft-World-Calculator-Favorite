import { FACTORIES_DATA } from '../assets/data/factories';

export type FactoryCategory = 'basic' | 'crafted' | 'keys';

// Basic raw resources used for initial classification
export const RAW_RESOURCES = ["EARTH", "WATER", "FIRE", "DYNOFISH", "MAGICSHARD", "BURNTRICE"];

// Keys resources
export const KEYS_RESOURCES = ["KEY", "GLASSKEY", "CERAMICKEY", "DYNOKEY"];

// Emojis mapping for premium design
export const EMOJI_MAP: Record<string, string> = {
  "ACID": "🧪", "ALGAE": "🌿", "BOLTS": "🔩", "BONESOUP": "🍲", "BOWL": "🥣", 
  "BURGER": "🍔", "BURNTRICE": "🌾", "CEMENT": "🧱", "CERAMICKEY": "🔑", "CERAMICS": "🏺", 
  "CLAY": "🧱", "COPPER": "🪙", "DANGO": "🍡", "DUMPLING": "🥟", "DYNAMITE": "🧨", 
  "DYNODESSERT": "🧁", "DYNOFISH": "🐡", "DYNOKEY": "🗝️", "EARTH": "🌍", "ENERGY": "⚡", 
  "FIBERGLASS": "🧪", "FISHBONE": "🦴", "FUEL": "⛽", "FUGU": "🐡", "GAS": "☁️", 
  "GLASS": "🍷", "GLASSKEY": "🔑", "HEAT": "🔥", "HYDROGEN": "🎈", "KEY": "🔑", 
  "LAVA": "🌋", "LOBSTER": "🦞", "MAGICSHARD": "✨", "MEATBALL": "🧆", "MUD": "🟫", 
  "MYSTICWEAPON": "🔮", "NINJASTAR": "🌟", "OIL": "🛢️", "OXYGEN": "🫧", "PANCAKE": "🥞", 
  "PLASTICS": "🧬", "PLUNGER": "🪠", "RAWRMEN": "🍜", "RAWRVIOLI": "🥟", "SAND": "⏳", 
  "SASHIMI": "🍣", "SCREWS": "🔩", "SEAWATER": "🌊", "SPOON": "🥄", "STEAM": "💨", 
  "STEEL": "⚔️", "STONE": "🪨", "SULFUR": "🟡", "SUSHI": "🍣", "SWORD": "⚔️", 
  "TAPE": "🎗️", "TARGET": "🎯", "TOYHAMMER": "🔨", "WAGYU": "🥩"
};

/**
 * Resolves a factory/resource category
 */
export function getCategory(name: string): FactoryCategory {
  if (RAW_RESOURCES.includes(name)) return 'basic';
  if (KEYS_RESOURCES.includes(name)) return 'keys';
  const levels = FACTORIES_DATA[name];
  if (levels && levels.length > 0) {
    const firstLvl = levels[0];
    const inputs = [firstLvl.input1, firstLvl.input2].filter(Boolean);
    const onlyRaw = inputs.every(inp => RAW_RESOURCES.includes(inp));
    if (onlyRaw) return 'basic';
  }
  return 'crafted';
}

/**
 * Returns emoji for resource
 */
// Mastery yield bonus per level (from game data: STEEL claimedLevel=10 shows 5.3%)
export const MASTERY_YIELD_PER_LEVEL = 0.53;

export function getEmoji(name: string): string {
  return EMOJI_MAP[name] || '🏭';
}
