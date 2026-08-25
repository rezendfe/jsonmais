import type { ConsentRecord } from './types'

export type ConsentStorePort = {
  get(): ConsentRecord | null
  set(record: ConsentRecord): void
  clear(): void
}
