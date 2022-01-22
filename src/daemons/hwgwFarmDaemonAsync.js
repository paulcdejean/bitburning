import { GuardError } from './errors/GuardError.js'

import { updateTargetPortDataAsync } from './lib/updateTargetPortDataAsync.js'
import { getTargetInfo } from './lib/getTargetInfo.js'

import {
  DEFAULT_CYCLE_BUFFER,
  DEFAULT_OPS_BUFFER,
  FARM_PORT,
  FARM_STOP_PORT,
  STOP_FARMS,
  FARMS_STOPPED,
  MAX_MONEY_ALLOWANCE
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

  const startingHackingLevel = ns.getHackingLevel()

  let cycle = 0
  ns.tprint('Starting hwgw farm daemon cycle 1 for ', target)
  while (true) {
    cycle = cycle + 1
    const targetInfo = getTargetInfo(ns, target)

    const batchData = []

    // Base cases
    const hackSleep = targetInfo.weakenTime - targetInfo.hackTime - opsBuffer
    const hackWeakenSleep = 0
    const growSleep = targetInfo.weakenTime - targetInfo.growTime + opsBuffer
    const growWeakenSleep = opsBuffer * 2
    const cycleTime = targetInfo.weakenTime + (batches * opsBuffer * 4) + (opsBuffer * 4) + cycleBuffer

    let batch = 0
    while (batch < batches) {
      batchData.push({
        hack: hackSleep + (opsBuffer * batch * 4),
        hackWeaken: hackWeakenSleep + (opsBuffer * batch * 4),
        grow: growSleep + (opsBuffer * batch * 4),
        growWeaken: growWeakenSleep + (opsBuffer * batch * 4)
      })
      batch = batch + 1
    }

    // Bonus batch
    batchData.push({
      hack: hackSleep + (opsBuffer * batch * 4),
      hackWeaken: hackWeakenSleep + (opsBuffer * batch * 4),
      grow: growSleep + (opsBuffer * batch * 4),
      growWeaken: growWeakenSleep + (opsBuffer * batch * 4)
    })

    const cycleData = {
      cycle: cycle,
      finished: false,
      batches: batchData
    }

    await updateTargetPortDataAsync(ns, FARM_PORT, target, cycleData)

    // The cycle
    await ns.asleep(cycleTime)

    // Report on the cycle
    const currentSecurity = ns.getServerSecurityLevel(target)
    const currentMoney = ns.getServerMoneyAvailable(target)

    if (currentSecurity !== targetInfo.minSecurity) {
      ns.tprint('WARNING: during HWGW farm operation, security of ', target,
        ' has drifted from minimum of ', targetInfo.minSecurity, ' to ', currentSecurity)
    }
    if (currentMoney <= targetInfo.maxMoney * MAX_MONEY_ALLOWANCE) {
      ns.tprint('WARNING: during HWGW farm operation, money of ', target,
        ' has drifted from max of ', targetInfo.maxMoney, ' to ', currentMoney)
    }

    ns.tprint('After ', cycle, ' cycles ', target, ' money is ', ns.nFormat(currentMoney, '0.000a'), ' and security is ', currentSecurity)
    ns.tprint('We have gained ', ns.getHackingLevel() - startingHackingLevel, ' hacking levels')

    // Check for terminating condition, which is a port signal
    if (ns.readPort(FARM_STOP_PORT) === STOP_FARMS) {
      cycleData.finished = true
      cycleData.cycle = 0
      await updateTargetPortDataAsync(ns, FARM_PORT, target, cycleData)
      await ns.writePort(FARM_STOP_PORT, FARMS_STOPPED)
      return
    }
  }
}
