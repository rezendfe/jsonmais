/** Public IndexNow key (not a secret — published at /{key}.txt). */
export const INDEXNOW_KEY = 'a3f8c2d1e5b7496081a2c4d6e8f0b2a4'

export function indexNowKeyFileName(): string {
  return `${INDEXNOW_KEY}.txt`
}
