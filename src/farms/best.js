import { GuardError } from './errors/GuardError.js'

/**
 * Farms the best target using the best method.
 *
 * @param ns NS
 */
export function best (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
}
