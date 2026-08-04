/** Public-folder asset URL, respectful of Vite `base` (e.g. GitHub Pages). */
export function asset(path: string): string {
  const clean = path.replace(/^\/+/, '')
  return `${import.meta.env.BASE_URL}${clean}`
}
