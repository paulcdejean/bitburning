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
  await quadHackFarmDaemonAsync(ns, ns.args[0], ns.args[1])
}

/**
 * Regulates the timing of the weaken target action on a given target
 * Annouces status and ensures that remotes exit once weakening is completed
 *
 * @param {NS} ns NS
 * @param target the target of the quad hack farm operation
 * @param hackThreads the number of hacking threads of the quad hack farm operation, required to calculate cycle time
 * @param cycleBuffer the amount of time to wait between cycles in addition to the calculated cycle time
 * @param opsBuffer the amount of time to wait between the grow and weaken, the hacks run as fast as possible
 */
export async function quadHackFarmDaemonAsync (ns, target, hackThreads, cycleBuffer = DEFAULT_CYCLE_BUFFER, opsBuffer = DEFAULT_OPS_BUFFER) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (hackThreads === undefined) {
    throw new GuardError('hackThreads is required')
  }

  // It's called quad for a reason
  const hacksPerThread = 4

  let cycle = 0
  ns.tprint('Starting quad hack farm daemon cycle 1 for ', target)
  while (true) {
    cycle = cycle + 1
    const targetInfo = getTargetInfo(ns, target)

    // Magic divined from the fomrulas API, see testing/hackTimeFormulaVerify.js
    const timeIncrasePerSecurity = targetInfo.hackTime / ((200 / targetInfo.requiredSkill) + targetInfo.minSecurity)
    // 0 + 1 + 2 + 3
    const triangularThing = (hacksPerThread - 1) * hacksPerThread / 2
    const bonusHackTime = ns.hackAnalyzeSecurity(hackThreads) * timeIncrasePerSecurity * triangularThing
    const totalHackTime = (targetInfo.hackTime * hacksPerThread) + bonusHackTime
    const cycleTime = totalHackTime + (opsBuffer * 2) + cycleBuffer

    const weakenSleep = cycleTime - targetInfo.weakenTime - cycleBuffer
    const growSleep = cycleTime - targetInfo.growTime - cycleBuffer - opsBuffer
    const hackSleep = 0

    const cycleData = {
      cycle: cycle,
      finished: false,
      batches: [{
        weaken: weakenSleep,
        grow: growSleep,
        hack: hackSleep
      }]
    }

    await updateTargetPortDataAsync(ns, FARM_PORT, target, cycleData)

    // The cycle
    await ns.asleep(cycleTime)

    // Report on the cycle
    const currentSecurity = ns.getServerSecurityLevel(target)
    const currentMoney = ns.getServerMoneyAvailable(target)

    if (currentSecurity !== targetInfo.minSecurity) {
      ns.tprint('WARNING: during quad hack farm operation, security of ', target,
        ' has drifted from minimum of ', targetInfo.minSecurity, ' to ', currentSecurity)
    }
    if (currentMoney <= targetInfo.maxMoney * MAX_MONEY_ALLOWANCE) {
      ns.tprint('WARNING: during quad hack farm operation, money of ', target,
        ' has drifted from max of ', targetInfo.maxMoney, ' to ', currentMoney)
    }

    ns.tprint('After ', cycle, ' cycles ', target, ' money is ', ns.nFormat(currentMoney, '0.000a'), ' and security is ', currentSecurity)

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
