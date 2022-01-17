import { GuardError } from './errors/GuardError.js'

import { LOCK_PORT, UNLOCKED } from './lib/constants.js'

/**
 * Releases the lock on the lock port
 *
 * @param {NS} ns NS
 */
export async function releaseLockAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  await ns.writePort(LOCK_PORT, UNLOCKED)
  ns.print('Released lock')
}
