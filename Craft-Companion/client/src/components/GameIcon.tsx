import React from 'react';

export function getResourceIconUrl(symbol: string): string {
  if (!symbol) return '/assets/resources/Coin.png';
  const clean = symbol.trim().replace(/[_\s-]+/g, '').toLowerCase();
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  return `/assets/resources/${capitalized}.png`;
}

const BUILDING_THEMATIC_MAP: Record<string, string[]> = {
  airstream: ['/assets/resources/Steam.png', '/assets/factories/Steam.gif'],
  sunforge: ['/assets/factories/Heat.gif', '/assets/resources/Heat.png'],
  steamforge: ['/assets/factories/Steam.gif', '/assets/resources/Steam.png'],
  reactor: ['/assets/factories/Energy.gif', '/assets/resources/Energy.png'],
  powercell: ['/assets/resources/Energy.png', '/assets/factories/Energy.gif'],
  battery: ['/assets/resources/Energy.png', '/assets/factories/Energy.gif'],
  townhall: ['/assets/resources/Coin.png'],
  vault: ['/assets/resources/Coin.png'],
  workshop: ['/assets/resources/Hammer.png'],
  secretlab: ['/assets/factories/Acid.gif', '/assets/resources/Acid.png'],
  house: ['/assets/resources/Coin.png'],
  hatchery: ['/assets/factories/Nest.gif', '/assets/resources/Nest.png'],
  school: ['/assets/factories/Book.gif', '/assets/resources/Book.png'],
  university: ['/assets/factories/Diploma.gif', '/assets/resources/Diploma.png'],
};

export function getFactoryIconUrl(symbol: string): string {
  if (!symbol) return '/assets/factories/Clay.gif';
  const clean = symbol.trim().replace(/[_\s-]+/g, '').toLowerCase();
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);

  if (BUILDING_THEMATIC_MAP[clean]) {
    return BUILDING_THEMATIC_MAP[clean][0];
  }

  if (capitalized === 'Earth') {
    return '/assets/factories/EarthModal.png';
  }
  if (capitalized === 'Water') {
    return '/assets/resources/Water.png';
  }
  if (capitalized === 'Fire') {
    return '/assets/resources/Fire.png';
  }
  return `/assets/factories/${capitalized}.gif`;
}

export function getFactoryPauseIconUrl(symbol: string): string {
  if (!symbol) return '/assets/factories/ClayPause.png';
  const clean = symbol.trim().replace(/[_\s-]+/g, '').toLowerCase();
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);

  if (BUILDING_THEMATIC_MAP[clean]) {
    const list = BUILDING_THEMATIC_MAP[clean];
    return list[list.length - 1];
  }

  if (capitalized === 'Earth') {
    return '/assets/factories/EarthPause.png';
  }
  if (capitalized === 'Fiberglass') {
    return '/assets/factories/FiberglassPause.gif';
  }
  if (capitalized === 'Wetnest') {
    return '/assets/factories/Wetnest.png';
  }
  if (capitalized === 'Water') {
    return '/assets/resources/Water.png';
  }
  if (capitalized === 'Fire') {
    return '/assets/resources/Fire.png';
  }
  return `/assets/factories/${capitalized}Pause.png`;
}

export function ResourceIcon({
  symbol,
  size = 20,
  className = '',
}: {
  symbol: string;
  size?: number;
  className?: string;
}) {
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setError(false);
  }, [symbol]);

  if (error) {
    const letters = (symbol || '?').slice(0, 2).toUpperCase();
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 rounded bg-amber-500/15 text-amber-400 font-mono font-bold select-none ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          fontSize: `${Math.max(9, Math.floor(size * 0.4))}px`,
        }}
        title={symbol}
      >
        {letters}
      </div>
    );
  }

  return (
    <img
      src={getResourceIconUrl(symbol)}
      alt={symbol}
      className={`inline-block object-contain shrink-0 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      onError={() => setError(true)}
    />
  );
}

export function FactoryIcon({
  symbol,
  size = 32,
  className = '',
}: {
  symbol: string;
  size?: number;
  className?: string;
}) {
  const norm = (symbol || '').trim().toLowerCase();
  const capitalized = norm.charAt(0).toUpperCase() + norm.slice(1);
  const [srcIndex, setSrcIndex] = React.useState(0);

  React.useEffect(() => {
    setSrcIndex(0);
  }, [symbol]);

  const clean = (symbol || '').trim().replace(/[_\s-]+/g, '').toLowerCase();
  const thematic = BUILDING_THEMATIC_MAP[clean] || [];

  const fallbackList = [
    ...thematic,
    `/assets/factories/${capitalized}.gif`,
    `/assets/factories/${capitalized}.png`,
    `/assets/resources/${capitalized}.png`,
  ];

  return (
    <img
      src={fallbackList[srcIndex] || '/assets/resources/Coin.png'}
      alt={symbol}
      className={`inline-block object-contain ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onError={() => {
        if (srcIndex < fallbackList.length - 1) {
          setSrcIndex((prev) => prev + 1);
        }
      }}
    />
  );
}
