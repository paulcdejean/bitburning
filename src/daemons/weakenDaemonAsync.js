import { GuardError } from './errors/GuardError.js'

import { updateTargetPortDataAsync } from './lib/updateTargetPortDataAsync.js'

import {
  DEFAULT_CYCLE_BUFFER,
  WEAKEN_PORT
} from './lib/constants.js'

/**
 * Wraps the weaken daemon allowing it to be launched as a detached script
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  await weakenDaemonAsync(ns, ns.args[0])
}

/**
 * Regulates the timing of the weaken target action on a given target
 * Annouces status and ensures that remotes exit once weakening is completed
 *
 * @param {NS} ns NS
 * @param target the target of the weaken operation
 * @param cycleBuffer the amount of time to wait between cycles in addition to the weaken time
 */
export async function weakenDaemonAsync (ns, target, cycleBuffer = DEFAULT_CYCLE_BUFFER) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }

  const startingSecurity = ns.getServerSecurityLevel(target)
  const minSecurity = ns.getServerMinSecurityLevel(target)

  let cycle = 0
  ns.tprint('Starting weaken daemon cycle 1 for ', target)
  while (true) {
    cycle = cycle + 1
    const cycleTime = ns.getWeakenTime(target) + cycleBuffer
    const cycleData = {
      cycle: cycle,
      finished: false,
      batches: [{ weaken: 0 }]
    }

    await updateTargetPortDataAsync(ns, WEAKEN_PORT, target, cycleData)

    // The cycle
    await ns.asleep(cycleTime)

    // Check for terminating condition
    const currentSecurity = ns.getServerSecurityLevel(target)
    if (currentSecurity === minSecurity) {
      ns.tprint('Completed weakening ', target, ' from ', startingSecurity, ' to ', currentSecurity, ' after ', cycle, ' cycles')
      cycleData.finished = true
      cycleData.cycle = 0
      await updateTargetPortDataAsync(ns, WEAKEN_PORT, target, cycleData)
      break
    } else {
      ns.print('After ', cycle, ' cycles ', target, ' security is ', currentSecurity, ' and minimum security is ', minSecurity)
    }
  }
}
