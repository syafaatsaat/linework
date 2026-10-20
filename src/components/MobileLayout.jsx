import { useState } from 'react'
import BottomSheet from './BottomSheet.jsx'
import ExportSheet from './ExportSheet.jsx'
import MobileEditView from './MobileEditView.jsx'
import MobileHeader from './MobileHeader.jsx'
import MobilePreview from './MobilePreview.jsx'
import SectionsSheet from './SectionsSheet.jsx'
import ViewSwitch from './ViewSwitch.jsx'

// Sticky header, Edit | Preview switch, the chosen view with its bottom bar,
// and the Sections / Export bottom sheets.
export default function MobileLayout({ cv, preview, theme, exports }) {
  const [view, setView] = useState('edit')
  const [sheet, setSheet] = useState(null) // 'sections' | 'export' | null
  const closeSheet = () => setSheet(null)

  const exportPdf = () => {
    closeSheet()
    exports.pdf()
  }

  return (
    <div className="m-app">
      <div className="m-shell no-print" inert={sheet !== null}>
        <MobileHeader theme={theme.value} onToggleTheme={theme.toggle} onExport={() => setSheet('export')} />
        <ViewSwitch view={view} pageCount={preview.pageCount} onChange={setView} />
        {view === 'edit' ? (
          <MobileEditView state={cv.state} actions={cv.actions} onOpenSections={() => setSheet('sections')} />
        ) : (
          <MobilePreview
            blocks={preview.blocks}
            pageBlocks={preview.pageBlocks}
            page={preview.page}
            pageCount={preview.pageCount}
            onPageChange={preview.setPage}
            parser={preview.parser}
            onToggleParser={preview.toggleParser}
          />
        )}
      </div>

      {sheet === 'sections' && (
        <BottomSheet title="Sections" onClose={closeSheet}>
          <SectionsSheet
            order={cv.state.order}
            active={cv.state.active}
            onMove={cv.actions.move}
            onAdd={cv.actions.addSection}
          />
        </BottomSheet>
      )}
      {sheet === 'export' && (
        <BottomSheet title="Export CV" onClose={closeSheet}>
          <ExportSheet pageCount={preview.pageCount} onPdf={exportPdf} onDocx={exports.docx} />
        </BottomSheet>
      )}
    </div>
  )
}
