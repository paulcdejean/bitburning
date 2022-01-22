/**
 * @param ns
 */
export function ls (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
}
