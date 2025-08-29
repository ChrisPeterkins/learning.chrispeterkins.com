import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
import { themes } from 'prism-react-renderer'
import './CodeExample.css'

interface CodeExampleProps {
  code: string
  scope?: Record<string, any>
  title?: string
  description?: string
}

function CodeExample({ code, scope = {}, title, description }: CodeExampleProps) {
  return (
    <div className="code-example">
      {title && <h3 className="example-title">{title}</h3>}
      {description && <p className="example-description">{description}</p>}
      
      <LiveProvider 
        code={code.trim()} 
        scope={scope}
        theme={themes.nightOwl}
      >
        <div className="code-container">
          <div className="editor-panel">
            <div className="panel-header">Code</div>
            <LiveEditor className="live-editor" />
            <LiveError className="live-error" />
          </div>
          
          <div className="preview-panel">
            <div className="panel-header">Preview</div>
            <LivePreview className="live-preview" />
          </div>
        </div>
      </LiveProvider>
    </div>
  )
}

export default CodeExample