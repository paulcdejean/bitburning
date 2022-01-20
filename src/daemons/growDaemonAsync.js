import { GuardError } from './errors/GuardError.js'

import { updateTargetPortDataAsync } from './lib/updateTargetPortDataAsync.js'

import {
  DEFAULT_CYCLE_BUFFER,
  DEFAULT_OPS_BUFFER,
  GROW_PORT
} from './lib/constants.js'

/**
 * Wrapper
 *
 * @param {ns} ns NS
 */
export async function main (ns) {
  await growDaemonAsync(ns, ns.args[0])
}

/**
 * Regulates the timing of the grow target action on a given target
 * Annouces status and ensures that remotes exit once growing is completed
 *
 * @param {NS} ns NS
 * @param target the target of the grow operation
 * @param cycleBuffer the amount of time to wait between cycles in addition to the weaken time
 * @param opsBuffer the amount of time between the grows landing and the weakens landing
 */
export async function growDaemonAsync (ns, target, cycleBuffer = DEFAULT_CYCLE_BUFFER, opsBuffer = DEFAULT_OPS_BUFFER) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
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

    await updateTargetPortDataAsync(ns, GROW_PORT, target, cycleData)

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
      await updateTargetPortDataAsync(ns, GROW_PORT, target, cycleData)
      break
    } else {
      ns.print('After ', cycle, ' cycles ', target, ' sec is ', currentSecurity, ' and min sec is ', minSecurity)
      ns.print('After ', cycle, ' cycles ', target, ' money is ', ns.nFormat(currentMoney, '0.000a'), ' out of ', ns.nFormat(maxMoney, '0.000a'))
    }
  }
}
