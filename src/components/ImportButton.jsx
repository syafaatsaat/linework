import { useRef, useState } from 'react'
import { SECTION_TYPES } from '../sections/types.js'
import ConfirmDialog from './ConfirmDialog.jsx'

const ACCEPT = '.pdf,.docx,.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/json'

// What the import found, for the confirm dialog.
function foundItems({ order, committed }) {
  const general = committed.general?.[0] ?? {}
  const contact = [general.name, general.email, general.phone].filter(Boolean).join(' · ')
  const items = [contact ? `General: ${contact}` : 'General: no name or contact details found']
  if (general.summary) items.push('Summary')
  for (const key of order) {
    const count = committed[key]?.length ?? 0
    if (key === 'general' || !count) continue
    const type = SECTION_TYPES[key]
    items.push(`${type.sheet || type.label}: ${count} ${count === 1 ? 'entry' : 'entries'}`)
  }
  return items
}

// "Import CV": pick a PDF or DOCX, read it, then confirm before replacing the CV.
// `onReadingChange(bool)` lets the preview show its scan line while a file is read.
export default function ImportButton({ onImport, onReadingChange, hasData, className, label = 'Import' }) {
  const input = useRef(null)
  const [state, setState] = useState({ status: 'idle' })
  const close = () => setState({ status: 'idle' })

  const read = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // so choosing the same file again still fires change
    if (!file) return
    setState({ status: 'reading' })
    onReadingChange?.(true)
    try {
      const { readCvFile, ImportError } = await import('../import/readCvFile.js')
      try {
        setState({ status: 'ready', file: file.name, result: await readCvFile(file) })
      } catch (error) {
        if (!(error instanceof ImportError)) throw error
        setState({ status: 'error', message: error.message })
      }
    } catch (error) {
      console.error(error)
      setState({ status: 'error', message: 'Something went wrong reading that file. Try again, or try the other format.' })
    } finally {
      onReadingChange?.(false)
    }
  }

  const reading = state.status === 'reading'
  const result = state.result

  return (
    <>
      <input ref={input} type="file" accept={ACCEPT} hidden onChange={read} />
      <button
        type="button"
        className={className}
        aria-haspopup="dialog"
        disabled={reading}
        aria-busy={reading}
        onClick={() => input.current.click()}
      >
        {reading ? 'Reading…' : label}
      </button>

      <ConfirmDialog
        open={state.status === 'ready'}
        title={`Import ${state.file ?? 'CV'}?`}
        confirmLabel="Import"
        cancelLabel="Cancel"
        danger={hasData}
        onCancel={close}
        onConfirm={() => {
          close()
          onImport(result)
        }}
      >
        {result && (
          <>
            <p>
              {result.exact
                ? `This is a Linework ${result.source === 'backup' ? 'backup' : 'export'}, so everything comes back exactly.`
                : 'Found:'}
            </p>
            {!result.exact && (
              <ul className="confirm-list">
                {foundItems(result.data).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {result.notes.length > 0 && (
              <ul className="confirm-list confirm-list--notes">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
            {!result.exact && (
              <p>Sections are read automatically and marked “check”. Compare each one with your original.</p>
            )}
            {hasData && <p className="confirm-warn">This replaces your current CV.</p>}
          </>
        )}
      </ConfirmDialog>

      <ConfirmDialog open={state.status === 'error'} title="Couldn’t import that file" cancelLabel="OK" onCancel={close}>
        <p>{state.message}</p>
      </ConfirmDialog>
    </>
  )
}
