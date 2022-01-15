/** @param {NS} ns */

import { lockPort, unlocked } from './lib/constants.js'

/**
 * Releases the lock on the lock port
 *
 * @param ns NS
 */
export async function releaseLock (ns) {
  await ns.writePort(lockPort, unlocked)
  ns.print('Released lock')
}
