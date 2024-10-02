export function timeFormat(time) {
  time = parseInt(time / 1000);
  const sec = time % 60;
  time = parseInt(time / 60);
  if (time === 0) return `${sec}`;
  const min = time % 60;
  time = parseInt(time / 60);
  if (time === 0) return `${min}:${sec}`;
  const hour = time % 24;
  const day = parseInt(time / 24);
  if (day === 0) return `${hour}:${min}:${sec}`;

  return `${day}days  ${hour}:${min}:${sec}`;
}
