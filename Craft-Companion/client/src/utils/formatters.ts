export function formatNumber(value: unknown, digits = 2): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : '0';
}

export function formatFactoryName(symbol: string, lang = 'en'): string {
  const normalized = String(symbol || '').trim().toUpperCase();
  if (lang === 'es') {
    const map: Record<string, string> = {
      STEEL: 'Acero',
      WOOD: 'Madera',
      WATER: 'Agua',
      ALGAE: 'Alga',
      BOLTS: 'Pernos',
      BONESOUP: 'Sopa de Huesos',
      CEMENT: 'Cemento',
      CERAMICKEY: 'Llave Cerámica',
      CERAMICS: 'Cerámicas',
      CLAY: 'Arcilla',
      COPPER: 'Cobre',
      DYNAMITE: 'Dinamita',
      EARTH: 'Tierra',
      EXPLOSIVES: 'Explosivos',
      FERTILIZER: 'Fertilizante',
      FIRE: 'Fuego',
      FISH: 'Pescado',
      GLASS: 'Vidrio',
      GOLD: 'Oro',
      GRAIN: 'Grano',
      IRON: 'Hierro',
      LEATHER: 'Cuero',
      LIMESTONE: 'Caliza',
      MUD: 'Lodo',
      OXYGEN: 'Oxígeno',
      PAPER: 'Papel',
      PLASTIC: 'Plástico',
      SAND: 'Arena',
      SCREWS: 'Tornillos',
      SILICA: 'Sílice',
      STONE: 'Piedra',
      SULFUR: 'Azufre',
      TEXTILE: 'Textil',
      VEGETABLES: 'Vegetales',
      GAS: 'Gas',
      OIL: 'Petróleo',
      HEAT: 'Calor',
      ACID: 'Ácido',
      SEAWATER: 'Agua de Mar',
      FUEL: 'Combustible',
      COAL: 'Carbón',
      AIR: 'Aire',
    };
    return map[normalized] || normalized.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  }
  return normalized.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
