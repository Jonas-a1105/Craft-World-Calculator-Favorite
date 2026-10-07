import React from 'react';

export function getResourceIconUrl(symbol: string): string {
  if (!symbol) return '/assets/resources/Coin.png';
  const norm = symbol.trim().toLowerCase();
  const capitalized = norm.charAt(0).toUpperCase() + norm.slice(1);
  return `/assets/resources/${capitalized}.png`;
}

export function getFactoryIconUrl(symbol: string): string {
  if (!symbol) return '/assets/factories/Clay.gif';
  const norm = symbol.trim().toLowerCase();
  const capitalized = norm.charAt(0).toUpperCase() + norm.slice(1);
  return `/assets/factories/${capitalized}.gif`;
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

  const fallbackList = [
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
