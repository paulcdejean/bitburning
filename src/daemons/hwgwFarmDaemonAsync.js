import { GuardError } from './errors/GuardError.js'

import { updateTargetPortDataAsync } from './lib/updateTargetPortDataAsync.js'
import { getTargetInfo } from './lib/getTargetInfo.js'

import {
  DEFAULT_CYCLE_BUFFER,
  DEFAULT_OPS_BUFFER,
  FARM_PORT,
  FARM_STOP_PORT,
  STOP_FARMS,
  FARMS_STOPPED
} from './lib/constants.js'

/**
 * Wraps the weaken daemon allowing it to be launched as a detached script
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  await hwgwFarmDaemonAsync(ns, ns.args[0], ns.args[1])
}

/**
 * Regulates the timing of the weaken target action on a given target
 * Annouces status and ensures that remotes exit once weakening is completed
 *
 * @param {NS} ns NS
 * @param target the target of the quad hack farm operation
 * @param batches the number of batches
 * @param cycleBuffer the amount of time to wait between cycles in addition to the calculated cycle time
 * @param opsBuffer the amount of time to wait between the grow and weaken, the hacks run as fast as possible
 */
export async function hwgwFarmDaemonAsync (ns, target, batches, cycleBuffer = DEFAULT_CYCLE_BUFFER, opsBuffer = DEFAULT_OPS_BUFFER) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (batches === undefined) {
    throw new GuardError('batches is required')
  }

  let cycle = 0
  ns.tprint('Starting hwgw farm daemon cycle 1 for ', target)
  cycle = cycle + 1
  ns.tprint(cycle)
}
