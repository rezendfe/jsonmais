export const WORKSPACE_STORAGE_KEY = 'jsonmais.workspace.v1'

export type PersistedWorkspace = {
  version: 1
  left: string
  right: string
}

export function loadWorkspace(raw: string | null): PersistedWorkspace | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedWorkspace>
    if (parsed.version !== 1 || typeof parsed.left !== 'string' || typeof parsed.right !== 'string') {
      return null
    }
    return { version: 1, left: parsed.left, right: parsed.right }
  } catch {
    return null
  }
}

export function saveWorkspace(left: string, right: string): string {
  return JSON.stringify({ version: 1, left, right } satisfies PersistedWorkspace)
}

export function readWorkspaceFromLocalStorage(
  storage: Pick<Storage, 'getItem'> | null,
): PersistedWorkspace | null {
  if (!storage) {
    return null
  }
  return loadWorkspace(storage.getItem(WORKSPACE_STORAGE_KEY))
}

export function writeWorkspaceToLocalStorage(
  storage: Pick<Storage, 'setItem'> | null,
  left: string,
  right: string,
): void {
  if (!storage) {
    return
  }
  try {
    storage.setItem(WORKSPACE_STORAGE_KEY, saveWorkspace(left, right))
  } catch {
    // quota / private mode
  }
}

export function clearWorkspaceFromLocalStorage(storage: Pick<Storage, 'removeItem'> | null): void {
  if (!storage) {
    return
  }
  try {
    storage.removeItem(WORKSPACE_STORAGE_KEY)
  } catch {
    // private mode
  }
}
