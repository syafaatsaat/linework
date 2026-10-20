import AppHeader from './AppHeader.jsx'
import Editor from './Editor.jsx'
import PreviewStage from './PreviewStage.jsx'

// Header, then editor and preview side by side (stacked when narrow).
export default function DesktopLayout({ cv, preview, theme, exports, reset }) {
  return (
    <div className="app">
      <AppHeader
        theme={theme.value}
        onToggleTheme={theme.toggle}
        onReset={reset}
        onExportPdf={exports.pdf}
        onExportDocx={exports.docx}
      />
      <div className="workspace">
        <Editor state={cv.state} actions={cv.actions} />
        <PreviewStage
          blocks={preview.blocks}
          pageBlocks={preview.pageBlocks}
          page={preview.page}
          pageCount={preview.pageCount}
          onPageChange={preview.setPage}
          parser={preview.parser}
          onToggleParser={preview.toggleParser}
        />
      </div>
    </div>
  )
}
