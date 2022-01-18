import { GuardError } from './errors/GuardError.js'

import { LOCK_PORT, UNLOCKED } from './lib/constants.js'

/**
 * Sleeps until it can pull the lock off of the lock port
 *
 * @param {NS} ns NS
 */
export async function aquireLockAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  let reenableLog = false
  if (ns.isLogEnabled('asleep')) {
    reenableLog = true
    ns.disableLog('asleep')
  }

  if (ns.readPort(LOCK_PORT) !== UNLOCKED) {
    ns.tprint(ns.getScriptName(), ' waiting for lock')
    while (ns.readPort(LOCK_PORT) !== UNLOCKED) {
      await ns.asleep(20)
    }
  }

  if (reenableLog) {
    ns.enableLog('asleep')
  }
}
