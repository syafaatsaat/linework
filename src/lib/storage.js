// localStorage can throw (private mode, blocked storage, quota), so every
// access is guarded and failures fall back to "nothing saved".

export function loadJSON(key) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveText(key, text) {
  try {
    window.localStorage.setItem(key, text)
  } catch {
    // Storage unavailable: the session still works, it just won't persist.
  }
}
