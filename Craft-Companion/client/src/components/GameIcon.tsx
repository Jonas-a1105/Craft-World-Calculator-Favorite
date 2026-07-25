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
  return (
    <img
      src={getResourceIconUrl(symbol)}
      alt={symbol}
      className={`inline-block object-contain ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onError={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = '0.3';
      }}
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
  return (
    <img
      src={getFactoryIconUrl(symbol)}
      alt={symbol}
      className={`inline-block object-contain ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onError={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = '0.3';
      }}
    />
  );
}
