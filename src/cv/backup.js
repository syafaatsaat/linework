import { currentMonth } from '../lib/format.js'
import { downloadBlob } from '../lib/download.js'
import { cvFileBase } from './fileName.js'

// A backup is the saved CV ({ order, committed, review }, as in localStorage)
// in a small JSON envelope, restored through Import CV. Unlike the DOCX
// export it keeps everything, including sections flagged for checking.

const FORMAT = 'linework-backup'
const VERSION = 1

export function toBackup(saved, now = new Date()) {
  return JSON.stringify({ format: FORMAT, version: VERSION, savedAt: now.toISOString(), cv: saved }, null, 2)
}

// The saved CV from a backup's text, or throws an Error whose message is
// one of: 'not-backup', 'newer-version'.
export function fromBackup(text) {
  let backup
  try {
    backup = JSON.parse(text)
  } catch {
    throw new Error('not-backup')
  }
  if (backup?.format !== FORMAT || !backup.cv || !Array.isArray(backup.cv.order) || typeof backup.cv.committed !== 'object') {
    throw new Error('not-backup')
  }
  if (!(backup.version <= VERSION)) throw new Error('newer-version')
  return backup.cv
}

// "Ada_Tan_CV_backup_2026-10-21.json": dated, so several backups sort.
export function backupFileName(name, now = new Date()) {
  const day = `${currentMonth(now)}-${String(now.getDate()).padStart(2, '0')}`
  return `${cvFileBase(name)}_backup_${day}.json`
}

export function downloadBackup(saved, name) {
  downloadBlob(new Blob([toBackup(saved)], { type: 'application/json' }), backupFileName(name))
}
