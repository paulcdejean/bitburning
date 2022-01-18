import { GuardError } from './errors/GuardError.js'

/**
 * @param {ns} ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
}

/**
 * Regulates the timing of the grow target action on a given target
 * Annouces status and ensures that remotes exit once growing is completed
 *
 * @param {NS} ns NS
 */
export function growDaemonAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
}
