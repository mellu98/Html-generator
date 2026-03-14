export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail keeps the app usable even if SW registration is blocked.
    })
  })
}
