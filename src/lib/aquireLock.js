/** @param {NS} ns */

import { lockPort, unlocked } from './lib/constants.js'

/**
 * Sleeps until it can pull the lock off of the lock port
 *
 * @param ns NS
 */
export async function aquireLock (ns) {
  let reenableLog = false
  if (ns.isLogEnabled('asleep')) {
    reenableLog = true
    ns.disableLog('asleep')
  }

  ns.print('Waiting for lock')

  while (ns.readPort(lockPort) !== unlocked) {
    await ns.asleep(20)
  }

  if (reenableLog) {
    ns.enableLog('asleep')
  }
}
