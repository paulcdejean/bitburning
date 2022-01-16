import { GuardError } from './errors/GuardError.js'

import { lockPort, unlocked } from './lib/constants.js'

/**
 * Releases the lock on the lock port
 *
 * @param {NS} ns NS
 */
export async function releaseLockAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  await ns.writePort(lockPort, unlocked)
  ns.print('Released lock')
}
