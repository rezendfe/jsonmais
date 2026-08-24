import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { createJSONEditor, type Content } from 'vanilla-jsoneditor'

type EditorInstance = ReturnType<typeof createJSONEditor>

function contentToText(content: Content): string {
  if ('text' in content && typeof content.text === 'string') {
    return content.text
  }
  if ('json' in content) {
    return JSON.stringify(content.json, null, 2)
  }
  return ''
}

export type JsonEditorPaneHandle = {
  openTransform: (onResult: (text: string) => void) => void
}

type JsonEditorPaneProps = {
  content: string
  onChange: (text: string) => void
  label: string
}

export const JsonEditorPane = forwardRef<JsonEditorPaneHandle, JsonEditorPaneProps>(
  function JsonEditorPane({ content, onChange, label }, ref) {
    const hostRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<EditorInstance | null>(null)
    const onChangeRef = useRef(onChange)
    const lastEmittedRef = useRef(content)

    onChangeRef.current = onChange

    useImperativeHandle(ref, () => ({
      openTransform(onResult) {
        const editor = editorRef.current
        if (!editor) {
          return
        }
        editor.transform({
          onTransform: ({ transformedJson }) => {
            onResult(`${JSON.stringify(transformedJson, null, 2)}\n`)
          },
        })
      },
    }))

    useEffect(() => {
      const host = hostRef.current
      if (!host) {
        return
      }

      const editor = createJSONEditor({
        target: host,
        props: {
          content: { text: content },
          onChange: (updated) => {
            const text = contentToText(updated)
            lastEmittedRef.current = text
            onChangeRef.current(text)
          },
        },
      })
      editorRef.current = editor
      lastEmittedRef.current = content

      return () => {
        void editor.destroy()
        editorRef.current = null
      }
    }, [])

    useEffect(() => {
      if (content === lastEmittedRef.current) {
        return
      }
      lastEmittedRef.current = content
      void editorRef.current?.update({ text: content })
    }, [content])

    return (
      <section
        aria-label={label}
        style={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, height: '100%' }}
      >
        <div ref={hostRef} style={{ flex: 1, minHeight: 0 }} />
      </section>
    )
  },
)
