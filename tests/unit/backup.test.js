import { describe, expect, it } from 'vitest'
import { backupFileName, fromBackup, toBackup } from '../../src/cv/backup.js'
import { full } from '../fixtures.js'

describe('backup', () => {
  const saved = { ...full, review: ['awards'] }

  it('round-trips the saved CV, review flags included', () => {
    expect(fromBackup(toBackup(saved))).toEqual(saved)
  })

  it('records the format, version and time', () => {
    const backup = JSON.parse(toBackup(saved, new Date('2026-10-21T08:00:00Z')))
    expect(backup).toMatchObject({ format: 'linework-backup', version: 1, savedAt: '2026-10-21T08:00:00.000Z' })
  })

  it('rejects other JSON and newer versions', () => {
    for (const text of ['not json', '{}', '[]', JSON.stringify({ format: 'linework-backup', cv: { order: 'x' } })]) {
      expect(() => fromBackup(text)).toThrow('not-backup')
    }
    const newer = JSON.parse(toBackup(saved))
    newer.version = 2
    expect(() => fromBackup(JSON.stringify(newer))).toThrow('newer-version')
  })

  it('names files by person and day', () => {
    expect(backupFileName('Ada Tan', new Date(2026, 9, 1))).toBe('Ada_Tan_CV_backup_2026-10-01.json')
    expect(backupFileName('', new Date(2026, 9, 21))).toBe('CV_backup_2026-10-21.json')
  })
})
