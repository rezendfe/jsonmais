import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type PointerEvent } from 'react'
import { useLocale } from '../../composition/LocaleProvider'
import { compactJson, formatJson, parseFailMessage, tryParseJson } from '../../shared/json/format'
import { structuralDiff, type StructuralDiff } from '../../shared/json/diff'
import { SAMPLE_LEFT, SAMPLE_RIGHT } from '../../shared/json/sample'
import { readWorkspaceFromLocalStorage, writeWorkspaceToLocalStorage } from '../../shared/json/store'
import { ToolboxPanel } from '../toolbox/ToolboxPanel'
import { CenterRail } from './CenterRail'
import { ComparePanel } from './ComparePanel'
import { JsonEditorPane, type JsonEditorPaneHandle } from './JsonEditorPane'
import styles from './EditorWorkspace.module.css'

function downloadJson(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function readFileText(file: File, onLoad: (text: string) => void) {
  const reader = new FileReader()
  reader.onload = () => {
    const text = typeof reader.result === 'string' ? reader.result : ''
    onLoad(text)
  }
  reader.readAsText(file)
}

export function EditorWorkspace() {
  const { t } = useLocale()
  const [left, setLeft] = useState(SAMPLE_LEFT)
  const [right, setRight] = useState(SAMPLE_RIGHT)
  const [leftRatio, setLeftRatio] = useState(0.5)
  const [compareOn, setCompareOn] = useState(false)
  const [compare, setCompare] = useState<StructuralDiff | null>(null)
  const [compareError, setCompareError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [dropTarget, setDropTarget] = useState<'left' | 'right' | null>(null)
  const fileLeftRef = useRef<HTMLInputElement>(null)
  const fileRightRef = useRef<HTMLInputElement>(null)
  const leftEditorRef = useRef<JsonEditorPaneHandle>(null)
  const rightEditorRef = useRef<JsonEditorPaneHandle>(null)
  const dragRef = useRef(false)
  const belowFoldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = readWorkspaceFromLocalStorage(window.localStorage)
    if (stored) {
      setLeft(stored.left)
      setRight(stored.right)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }
    writeWorkspaceToLocalStorage(window.localStorage, left, right)
  }, [hydrated, left, right])

  const loadFileToSide = useCallback(
    (side: 'left' | 'right', file: File) => {
      readFileText(file, (text) => {
        if (side === 'left') setLeft(text)
        else setRight(text)
        setMessage(
          t('editor.loaded', {
            name: file.name,
            side: t(side === 'left' ? 'editor.side.left' : 'editor.side.right'),
          }),
        )
      })
    },
    [t],
  )

  const onOpen = useCallback(
    (side: 'left' | 'right', event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) {
        return
      }
      loadFileToSide(side, file)
    },
    [loadFileToSide],
  )

  const onPaneDragOver = useCallback((side: 'left' | 'right', event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setDropTarget(side)
  }, [])

  const onPaneDragLeave = useCallback((side: 'left' | 'right', event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return
    }
    setDropTarget((current) => (current === side ? null : current))
  }, [])

  const onPaneDrop = useCallback(
    (side: 'left' | 'right', event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDropTarget(null)
      const file = event.dataTransfer.files?.[0]
      if (!file) {
        return
      }
      loadFileToSide(side, file)
    },
    [loadFileToSide],
  )

  useEffect(() => {
    if (!compareOn) {
      setCompare(null)
      setCompareError(null)
      return
    }

    const l = tryParseJson(left)
    const r = tryParseJson(right)
    const leftError = parseFailMessage(l, t('editor.side.left'))
    const rightError = parseFailMessage(r, t('editor.side.right'))
    if (leftError !== null) {
      setCompare(null)
      setCompareError(t('editor.compareFail', { error: leftError }))
      return
    }
    if (rightError !== null) {
      setCompare(null)
      setCompareError(t('editor.compareFail', { error: rightError }))
      return
    }
    if (l.ok === false || r.ok === false) {
      return
    }
    setCompareError(null)
    setCompare(structuralDiff(l.value, r.value))
  }, [compareOn, left, right, t])

  useEffect(() => {
    if (!compareOn || !belowFoldRef.current) {
      return
    }
    belowFoldRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [compareOn])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const typing = tag === 'input' || tag === 'textarea' || target?.isContentEditable
      if (!event.ctrlKey || !event.shiftKey) return

      if (typing) return

      if (event.key.toLowerCase() === 't') {
        event.preventDefault()
        belowFoldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setMessage(t('editor.toolsBelow'))
        return
      }

      if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        try {
          setLeft(formatJson(left))
          setMessage(t('editor.formatted'))
        } catch (err) {
          setMessage(err instanceof Error ? err.message : t('editor.invalidLeft'))
        }
        return
      }

      if (event.key.toLowerCase() === 'm') {
        event.preventDefault()
        try {
          setLeft(compactJson(left))
          setMessage(t('editor.compacted'))
        } catch (err) {
          setMessage(err instanceof Error ? err.message : t('editor.invalidLeft'))
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [left, t])

  const onSplitterPointerDown = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    dragRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const onSplitterPointerMove = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) {
      return
    }
    const parent = event.currentTarget.parentElement
    if (!parent) {
      return
    }
    const rect = parent.getBoundingClientRect()
    const next = (event.clientX - rect.left) / rect.width
    setLeftRatio(Math.min(0.8, Math.max(0.2, next)))
  }, [])

  const stopDrag = useCallback(() => {
    dragRef.current = false
  }, [])

  const status = useMemo(() => {
    if (message) {
      return message
    }
    if (compareOn) {
      return null
    }
    return t('editor.hint')
  }, [compareOn, message, t])

  return (
    <div className={styles.page}>
      <div className={styles.editorViewport}>
        <div className={styles.toolbar} role="toolbar" aria-label={t('editor.files')}>
        <div className={styles.group}>
          <button type="button" className={styles.button} onClick={() => fileLeftRef.current?.click()}>
            {t('editor.loadLeft')}
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => downloadJson(t('editor.fileLeft'), left)}
          >
            {t('editor.saveLeft')}
          </button>
        </div>
        <div className={styles.sep} />
        <div className={styles.group}>
          <button type="button" className={styles.button} onClick={() => fileRightRef.current?.click()}>
            {t('editor.loadRight')}
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => downloadJson(t('editor.fileRight'), right)}
          >
            {t('editor.saveRight')}
          </button>
        </div>
        <input
          ref={fileLeftRef}
          type="file"
          accept=".json,.txt,.csv,.yaml,.yml,.xml,application/json,text/csv,text/yaml,application/xml"
          hidden
          onChange={(e) => onOpen('left', e)}
        />
        <input
          ref={fileRightRef}
          type="file"
          accept=".json,.txt,.csv,.yaml,.yml,.xml,application/json,text/csv,text/yaml,application/xml"
          hidden
          onChange={(e) => onOpen('right', e)}
        />
      </div>

      <div
        className={styles.panels}
        style={{
          gridTemplateColumns: `minmax(0, ${leftRatio}fr) 6px 8.25rem 6px minmax(0, ${1 - leftRatio}fr)`,
        }}
      >
        <div
          className={`${styles.pane} ${dropTarget === 'left' ? styles.paneDropActive : ''}`}
          onDragOver={(event) => onPaneDragOver('left', event)}
          onDragLeave={(event) => onPaneDragLeave('left', event)}
          onDrop={(event) => onPaneDrop('left', event)}
        >
          {hydrated ? (
            <JsonEditorPane ref={leftEditorRef} content={left} onChange={setLeft} label={t('editor.labelLeft')} />
          ) : null}
        </div>
        <button
          type="button"
          className={styles.split}
          aria-label={t('editor.resizeLeft')}
          onPointerDown={onSplitterPointerDown}
          onPointerMove={onSplitterPointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        />
        <CenterRail
          leftText={left}
          rightText={right}
          compareActive={compareOn}
          onCopyLeft={() => setLeft(right)}
          onCopyRight={() => setRight(left)}
          onTransformLeft={() => rightEditorRef.current?.openTransform(setLeft)}
          onTransformRight={() => leftEditorRef.current?.openTransform(setRight)}
          onCompare={() => {
            setMessage(null)
            setCompareOn((value) => !value)
          }}
          onSendToRight={setRight}
          onNotify={setMessage}
        />
        <button
          type="button"
          className={styles.split}
          aria-label={t('editor.resizeRight')}
          onPointerDown={onSplitterPointerDown}
          onPointerMove={onSplitterPointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        />
        <div
          className={`${styles.pane} ${dropTarget === 'right' ? styles.paneDropActive : ''}`}
          onDragOver={(event) => onPaneDragOver('right', event)}
          onDragLeave={(event) => onPaneDragLeave('right', event)}
          onDrop={(event) => onPaneDrop('right', event)}
        >
          {hydrated ? (
            <JsonEditorPane ref={rightEditorRef} content={right} onChange={setRight} label={t('editor.labelRight')} />
          ) : null}
        </div>
      </div>

        {status ? (
          <div className={`${styles.status} ${message ? styles.error : ''}`}>{status}</div>
        ) : null}
      </div>

      <div className={styles.belowFold} ref={belowFoldRef}>
        <ToolboxPanel sourceText={left} rightText={right} onSendToRight={setRight} />

        {compareOn ? (
          <ComparePanel
            diff={compare}
            error={compareError}
            onClose={() => {
              setCompareOn(false)
              setCompare(null)
              setCompareError(null)
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
