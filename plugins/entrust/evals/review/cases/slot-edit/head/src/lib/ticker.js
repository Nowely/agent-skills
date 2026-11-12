// Calls fn once a minute until the returned function is called.
export function everyMinute(fn) {
  const timer = setInterval(fn, 60_000);
  return () => clearInterval(timer);
}
