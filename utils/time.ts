export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

export function formatLapDiff(ms: number): string {
  const sign = ms >= 0 ? '+' : '-';
  const abs = Math.abs(ms);
  const seconds = Math.floor(abs / 1000);
  const centiseconds = Math.floor((abs % 1000) / 10);
  return `${sign}${seconds}.${String(centiseconds).padStart(2, '0')}`;
}
