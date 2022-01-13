/** @param {NS} ns */

import { weakenPort } from './lib/constants.js'
import { updateTargetPortData } from './daemons/lib/updateTargetPortData.js'
import { weakenDaemonDeafultCycleBuffer } from './daemons/lib/constants.js'

/**
 * Cordinates weaken remotes
 *
 * @param ns NS
 */
export async function main (ns) {
  await weakenDaemon(ns, ns.args[0], ns.args[1])
}

/**
 * Regulates the timing of weaken operations on a given target
 * Annouces status and ensures that remotes exit once weakening is completed
 *
 * @param ns NS
 * @param target the target of the weaken operation
 * @param cycleBuffer the amount of time to wait between cycles in addition to the weaken time
 */
async function weakenDaemon (ns, target, cycleBuffer) {
  if (!cycleBuffer) {
    cycleBuffer = weakenDaemonDeafultCycleBuffer
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

    await updateTargetPortData(ns, weakenPort, target, cycleData)

    // The cycle
    await ns.asleep(cycleTime)

    // Check for terminating condition
    const currentSecurity = ns.getServerSecurityLevel(target)
    if (currentSecurity === minSecurity) {
      ns.tprint('Completed weakening ', target, ' from ', startingSecurity, ' to ', currentSecurity, ' after ', cycle, ' cycles')
      cycleData.finished = true
      cycleData.cycle = 0
      await updateTargetPortData(ns, weakenPort, target, cycleData)
      break
    } else {
      ns.print('After ', cycle, ' cycles ', target, ' security is ', currentSecurity, ' and minimum security is ', minSecurity)
    }
  }
}
