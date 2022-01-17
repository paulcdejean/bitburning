import { GuardError } from './errors/GuardError.js'

/**
 * Farms the target using HWGW batching.
 *
 * @param {NS} ns NS
 */
export function hwgw (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
}
