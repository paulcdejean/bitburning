/** @param {NS} ns */

import { growPort } from './lib/constants.js'

import { updateTargetPortData } from './daemons/lib/updateTargetPortData.js'
import { growDaemonDefaultCycleBuffer, growDaemonDefaultOpsBuffer } from './daemons/lib/constants.js'

/**
 * Cordinates weaken remotes
 *
 * @param ns NS
 */
export async function main (ns) {
  await growDaemon(ns, ns.args[0], ns.args[1], ns.args[2])
}

/**
 * Regulates the timing of weaken operations on a given target
 * Annouces status and ensures that remotes exit once weakening is completed
 *
 * @param ns NS
 * @param target the target of the weaken operation
 * @param cycleBuffer the amount of time to wait between cycles in addition to the weaken time
 * @param opsBuffer the amount of time that should be between grow finishing and weaken finishing
 */
async function growDaemon (ns, target, cycleBuffer, opsBuffer) {
  if (!cycleBuffer) {
    cycleBuffer = growDaemonDefaultCycleBuffer
  }
  if (!opsBuffer) {
    opsBuffer = growDaemonDefaultOpsBuffer
  }

  const minSecurity = ns.getServerMinSecurityLevel(target)
  const startingMoney = ns.getServerMoneyAvailable(target)
  const maxMoney = ns.getServerMaxMoney(target)

  let cycle = 0
  ns.tprint('Starting grow daemon cycle 1 for ', target)
  while (true) {
    cycle = cycle + 1

    // Calculate cycle
    const weakenTime = ns.getWeakenTime(target)
    const growTime = ns.getGrowTime(target)
    const cycleTime = weakenTime + cycleBuffer
    const weakenSleep = 0
    const growSleep = weakenTime - growTime - opsBuffer

    const cycleData = {
      cycle: cycle,
      finished: false,
      batches: [{
        weaken: weakenSleep,
        grow: growSleep
      }]
    }

    await updateTargetPortData(ns, growPort, target, cycleData)

    // The cycle
    await ns.asleep(cycleTime)

    // Check for terminating condition
    const currentSecurity = ns.getServerSecurityLevel(target)
    const currentMoney = ns.getServerMoneyAvailable(target)

    if (currentSecurity !== minSecurity) {
      ns.tprint('WARNING: during grow operation security of ', target, ' has drifted from minimum of ', minSecurity, ' to ', currentSecurity)
    }

    if (currentMoney === maxMoney) {
      ns.tprint('Completed growing ', target, ' from ', startingMoney, ' to ', maxMoney, ' after ', cycle, ' cycles')
      cycleData.finished = true
      cycleData.cycle = 0
      await updateTargetPortData(ns, growPort, target, cycleData)
      break
    } else {
      ns.print('After ', cycle, ' cycles ', target, ' sec is ', currentSecurity, ' and min sec is ', minSecurity)
      ns.print('After ', cycle, ' cycles ', target, ' money is ', currentMoney, ' out of ', maxMoney)
    }
  }
}
