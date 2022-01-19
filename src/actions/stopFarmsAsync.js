import { GuardError } from './errors/GuardError.js'

import {
  FARM_STOP_PORT,
  STOP_FARMS,
  FARMS_STOPPED
} from './lib/constants.js'

/**
 * Wrapper
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  await stopFarmsAsync(ns)
}

/**
 * Sends farms a signal to stop after the current batch.
 *
 * @param {NS} ns NS
 */
export async function stopFarmsAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  ns.tprint('Gracefully stopping farms')

  await ns.writePort(FARM_STOP_PORT, STOP_FARMS)

  while (ns.peek(FARM_STOP_PORT) !== FARMS_STOPPED) {
    await ns.asleep(1000)
  }
  await ns.asleep(1000) // Paranoia
  ns.tprint('Farms stopped')
}
