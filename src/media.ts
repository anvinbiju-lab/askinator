// Vite includes the user's local media in both dev and production builds.
// Persist file keys rather than generated asset URLs so chat history survives builds.
export const chatMemes = import.meta.glob<string>(
  '../meme for chatbot/*.{jpg,jpeg,png,gif,webp,avif}',
  { eager: true, query: '?url', import: 'default' },
);
const videoFiles = import.meta.glob<string>(
  '../meme for akinator/*.{mp4,webm,ogg,mov}',
  { eager: true, query: '?url', import: 'default' },
);
const firstVideo = 'WhatsApp Video 2026-10-29 at 11.49.45 AM.mp4';
export const revealVideos = Object.entries(videoFiles)
  .sort(([a],[b]) => {
    const aFirst = a.endsWith('/'+firstVideo);
    const bFirst = b.endsWith('/'+firstVideo);
    return aFirst !== bFirst ? (aFirst ? -1 : 1) : a.localeCompare(b);
  }).map(([,url])=>url);
// Page-memory only: refresh starts with the original clip, irrespective of saved game stats.
const revealedRounds = new Map<number,string | undefined>();
let nextVideo = 0;
export function videoForRound(round:number):string | undefined {
  if (revealedRounds.has(round)) return revealedRounds.get(round);
  const source = revealVideos.length ? revealVideos[nextVideo++ % revealVideos.length] : undefined;
  revealedRounds.set(round,source);
  return source;
}
export function resetVideoOrder() { revealedRounds.clear(); nextVideo=0; }
export function randomMeme(previous?: string): string | undefined {
  const all = Object.keys(chatMemes);
  const candidates = all.filter(key => key !== previous);
  const pool = candidates.length ? candidates : all;
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : undefined;
}
