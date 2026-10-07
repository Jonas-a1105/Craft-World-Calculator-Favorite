export function formatCompact(value: number): string {
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const formatted = (value / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}M`;
  }
  if (abs >= 1_000) {
    const formatted = (value / 1_000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}k`;
  }
  return value.toLocaleString('en-US');
}

export function formatWithCommas(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    const s = Number(seconds.toFixed(2));
    return `${s}s`;
  }
  const totalMinutes = Math.floor(seconds / 60);
  const remainingSecs = Math.round(seconds % 60);

  if (totalMinutes < 60) {
    if (remainingSecs === 0) return `${totalMinutes}m`;
    return `${totalMinutes}m ${remainingSecs}s`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatDurationDiff(diffSeconds: number): string {
  if (diffSeconds <= 0) return '';
  if (diffSeconds < 60) {
    const s = Number(diffSeconds.toFixed(2));
    return `+${s}s`;
  }
  const minutes = Math.floor(diffSeconds / 60);
  const secs = Math.round(diffSeconds % 60);
  if (secs === 0) return `+${minutes}m`;
  return `+${minutes}m ${secs}s`;
}
