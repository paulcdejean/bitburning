import { GuardError } from './errors/GuardError.js'

import { LOCK_PORT, GROW_PORT, UNLOCKED, WEAKEN_PORT, FARM_PORT } from './lib/constants.js'

/**
 * Wraps initPorts allowing it to be called from the command line
 *
 * @param ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  await initPortsAsync(ns)
}

/**
 * Sets port data to its inital values, which is absolutely essential for several technical reasons
 *
 * @param ns NS
 */
export async function initPortsAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  ns.clearPort(LOCK_PORT)
  await ns.writePort(LOCK_PORT, UNLOCKED)
  ns.clearPort(WEAKEN_PORT)
  await ns.writePort(WEAKEN_PORT, '{}')
  ns.clearPort(GROW_PORT)
  await ns.writePort(GROW_PORT, '{}')
  ns.clearPort(FARM_PORT)
  await ns.writePort(FARM_PORT, '{}')
  ns.tprint('Initialized ports')
}
