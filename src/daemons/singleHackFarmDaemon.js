/** @param {NS} ns */

import { singleHackFarmPort } from './lib/constants.js'

import { updateTargetPortData } from './daemons/lib/updateTargetPortData.js'
import {
  singleHackFarmDaemonDeafultCycleBuffer,
  singleHackFarmDaemonDefaultOpsBuffer,
  singleHackFarmDaemonWarningTolerance
} from './daemons/lib/constants.js'

/**
 * Cordinates remotes for single hack farming
 *
 * @param ns NS
 */
export async function main (ns) {
  await singleHackFarmDaemon(ns, ns.args[0], ns.args[1], ns.args[2], ns.args[3])
}

/**
 * Regulates the timing of weaken operations on a given target
 * Annouces status and ensures that remotes exit once weakening is completed
 *
 * @param ns NS
 * @param target the target of the weaken operation
 * @param batches the number of batches to supervise
 * @param cycleBuffer the amount of time to wait between cycles in addition to the weaken time
 * @param opsBuffer the amount of time to wait between operations
 */
async function singleHackFarmDaemon (ns, target, batches, cycleBuffer, opsBuffer) {
  ns.disableLog('getServerSecurityLevel')
  ns.disableLog('getServerMoneyAvailable')
  ns.disableLog('asleep')

  // Defaults
  if (!cycleBuffer) {
    cycleBuffer = singleHackFarmDaemonDeafultCycleBuffer
  }
  if (!opsBuffer) {
    opsBuffer = singleHackFarmDaemonDefaultOpsBuffer
  }

  const minSecurity = ns.getServerMinSecurityLevel(target)
  const maxMoney = ns.getServerMaxMoney(target)

  const minimumCycleTime = (batches + 1) * opsBuffer * 2 + cycleBuffer

  let cycle = 0
  ns.tprint('Starting single hack farm daemon cycle 1 for ', target)
  while (true) {
    cycle = cycle + 1

    // Calculate cycle
    const weakenTime = ns.getWeakenTime(target)
    const growTime = ns.getGrowTime(target)
    const hackTime = ns.getHackTime(target)
    const cycleTime = Math.max(weakenTime + cycleBuffer, minimumCycleTime)

    const cycleData = {
      cycle: cycle,
      finished: false,
      weakenTime: weakenTime,
      growTime: growTime,
      hackTime: hackTime,
      batches: []
    }

    const weakenSleep = cycleTime - ns.getWeakenTime(target) - cycleBuffer

    let batch = 0
    while (batch < batches) {
      const growSleep = weakenTime - growTime - (opsBuffer * batch * 2) - (opsBuffer * 1)
      const hackSleep = weakenTime - hackTime - (opsBuffer * batch * 2) - (opsBuffer * 2)

      cycleData.batches.push({
        weaken: weakenSleep,
        grow: growSleep,
        hack: hackSleep
      })
      batch = batch + 1
    }

    await updateTargetPortData(ns, singleHackFarmPort, target, cycleData)

    // The cycle
    await ns.asleep(cycleTime)

    // Report on the cycle
    const currentSecurity = ns.getServerSecurityLevel(target)
    const currentMoney = ns.getServerMoneyAvailable(target)

    if (currentSecurity !== minSecurity) {
      ns.tprint('WARNING: during single hack farm operation, security of ', target, ' has drifted from minimum of ', minSecurity, ' to ', currentSecurity)
    }
    if (currentMoney < maxMoney * singleHackFarmDaemonWarningTolerance) {
      ns.tprint('WARNING: during single hack farm operation, money of ', target, ' has drifted from max of ', maxMoney, ' to ', currentMoney)
    }

    ns.tprint('After ', cycle, ' cycles ', target, ' money is ', ns.nFormat(currentMoney, '0.000a'), ' and security is ', currentSecurity)
  }
}
