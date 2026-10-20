import { useEffect, useMemo, useReducer } from 'react'
import { saveText } from '../lib/storage.js'
import { STORAGE_KEY, createInitialState, cvReducer, toStorage } from './cvState.js'

export function useCv() {
  const [state, dispatch] = useReducer(cvReducer, undefined, createInitialState)

  // Drafts aren't persisted, so typing leaves the snapshot unchanged and
  // storage is only written when committed data or order actually change.
  const snapshot = JSON.stringify(toStorage(state))
  useEffect(() => {
    saveText(STORAGE_KEY, snapshot)
  }, [snapshot])

  // Committed data as { order, committed }, stable across keystrokes. The CV
  // preview and exports read this, so they can never see a draft.
  const submitted = useMemo(() => JSON.parse(snapshot), [snapshot])

  const actions = useMemo(
    () => ({
      select: (key) => dispatch({ type: 'select', key }),
      updateField: (key, index, field, value) => dispatch({ type: 'updateField', key, index, field, value }),
      addEntry: (key) => dispatch({ type: 'addEntry', key }),
      removeEntry: (key, index) => dispatch({ type: 'removeEntry', key, index }),
      submit: (key) => dispatch({ type: 'submit', key }),
      edit: (key) => dispatch({ type: 'edit', key }),
      cancel: (key) => dispatch({ type: 'cancel', key }),
      addSection: (key) => dispatch({ type: 'addSection', key }),
      removeSection: (key) => dispatch({ type: 'removeSection', key }),
      move: (key, to) => dispatch({ type: 'move', key, to }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [],
  )

  return [state, actions, submitted]
}
