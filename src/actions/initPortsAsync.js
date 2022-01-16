/** @param {NS} ns */

import { GuardError } from './errors/GuardError.js'

import { lockPort, weakenPort, growPort, unlocked, singleHackFarmPort } from './lib/constants.js'

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
  ns.clearPort(lockPort)
  await ns.writePort(lockPort, unlocked)
  ns.clearPort(weakenPort)
  await ns.writePort(weakenPort, '{}')
  ns.clearPort(growPort)
  await ns.writePort(growPort, '{}')
  ns.clearPort(singleHackFarmPort)
  await ns.writePort(singleHackFarmPort, '{}')
  ns.tprint('Initialized ports')
}
