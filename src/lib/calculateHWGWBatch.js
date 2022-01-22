import { GuardError } from './errors/GuardError.js'
import { InsufficentHackingPowerError } from './errors/InsufficentHackingPowerError.js'

import { getTargetInfo } from './lib/getTargetInfo.js'

import {
  MATH_DEBUGGING,
  DEFAULT_CYCLE_BUFFER,
  DEFAULT_OPS_BUFFER,
  MILLISECONDS_IN_A_SECOND,
  ACCEPTABLE_MAXHACK_PROBABILITY
} from './lib/constants.js'

/**
 * Calculates the profitability, number of threads and cycle time, for the quad hack farm method.
 * If run with non minimum security gives a very rough guesstimate.
 *
 * @param {NS} ns NS
 * @param target The target to calculate quad hack farm stats for
 * @param threads The number of threads to calculate the farm for
 * @param opsBuffer The amount to of padding between the hack grow and weaken
 * @param cycleBuffer The amount to wait after weaken lands, before calculating the cycle
 * @returns An object detailing all the info needed to farm the target
 */
export function calculateHWGWBatch (ns, target, threads, opsBuffer = DEFAULT_OPS_BUFFER, cycleBuffer = DEFAULT_CYCLE_BUFFER) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (threads === undefined) {
    throw new GuardError('threads is required')
  }

  const hacksPerThread = 1

  const result = {}

  const targetInfo = getTargetInfo(ns, target)

  // Sanity check, hack power 0 means it's too advanced for us
  if (targetInfo.hackPower === 0) {
    throw new InsufficentHackingPowerError('Tried to calculate quad hack farm on ' + target + ' which is too difficult')
  }

  // We do a linear search here, we just keep adding hacking threads until the total threads is greater than what we have available.
  // After that we calculate with that many hacking threads - 1
  let hackThreads = 0
  let totalThreads = 0

  if (MATH_DEBUGGING) {
    ns.tprint(targetInfo)
  }

  while (totalThreads <= threads) {
    hackThreads = hackThreads + 1
    if (hackThreads * targetInfo.hackPower >= 1) {
      // To avoid hacking down to zero
      break
    }
    const percentToLeave = Math.pow((1 - (targetInfo.hackPower * hackThreads)), hacksPerThread)
    const growThreads = Math.ceil(ns.growthAnalyze(target, 1 / percentToLeave))
    const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreads) * hacksPerThread
    const hackWeakenThreads = Math.ceil(hackSecurityIncrease / ns.weakenAnalyze(1))
    const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads)
    const growWeakenThreads = Math.ceil(growSecurityIncrease / ns.weakenAnalyze(1))
    totalThreads = hackThreads + growThreads + hackWeakenThreads + growWeakenThreads
  }

  // Hacking threads equaling zero here, means we don't have enough

  // Once more to get the final result
  hackThreads = hackThreads - 1
  const percentToLeave = Math.pow((1 - (targetInfo.hackPower * hackThreads)), hacksPerThread)
  const growThreads = Math.ceil(ns.growthAnalyze(target, 1 / percentToLeave))
  const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreads) * hacksPerThread
  const hackWeakenThreads = Math.ceil(hackSecurityIncrease / ns.weakenAnalyze(1))
  const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads)
  const growWeakenThreads = Math.ceil(growSecurityIncrease / ns.weakenAnalyze(1))
  totalThreads = hackThreads + growThreads + hackWeakenThreads + growWeakenThreads

  if (MATH_DEBUGGING) {
    ns.tprint('hackingThreads = ', hackThreads)
    ns.tprint('percentToLeave = ', percentToLeave)
    ns.tprint('growThreads = ', growThreads)
    ns.tprint('hackSecurityIncrease = ', hackSecurityIncrease)
    ns.tprint('hackWeakenThreads = ', hackWeakenThreads)
    ns.tprint('growSecurityIncrease = ', growSecurityIncrease)
    ns.tprint('growWeakenThreads = ', growWeakenThreads)
    ns.tprint('totalThreads = ', totalThreads)
  }

  const hackSubBatches = Math.ceil(Math.log(ACCEPTABLE_MAXHACK_PROBABILITY) / Math.log(targetInfo.hackChance))
  const hackSubBatchSize = Math.floor(hackThreads / hackSubBatches)
  const hackSubBatchesCorrected = Math.floor(hackThreads / hackSubBatchSize)
  const hackSubBatchRemainder = hackThreads % hackSubBatchSize

  if (MATH_DEBUGGING) {
    ns.tprint('hackSubBatches = ', hackSubBatches)
    ns.tprint('hackSubBatchSize = ', hackSubBatchSize)
    ns.tprint('hackSubBatchesCorrected = ', hackSubBatchesCorrected)
    ns.tprint('hackSubBatchRemainder = ', hackSubBatchRemainder)
  }

  const cycleTime = targetInfo.weakenTime + cycleBuffer
  const moneyPerCycle = targetInfo.maxMoney * (1 - percentToLeave)
  const moneyPerSecond = moneyPerCycle / cycleTime * MILLISECONDS_IN_A_SECOND
  let moneyPerSecondPerThread
  if (totalThreads === 0) {
    moneyPerSecondPerThread = 0
  } else {
    moneyPerSecondPerThread = moneyPerSecond / totalThreads
  }

  if (MATH_DEBUGGING) {
    ns.tprint('moneyPerCycle = ', ns.nFormat(moneyPerCycle, '0.000a'))
    ns.tprint('moneyPerSecond = ', ns.nFormat(moneyPerSecond, '0.000a'))
    ns.tprint('moneyPerSecondPerThread = ', ns.nFormat(moneyPerSecondPerThread, '0.000a'))
  }

  result.moneyPerCycle = moneyPerCycle
  result.hackWeakenThreads = hackWeakenThreads
  result.growWeakenThreads = growWeakenThreads
  result.growThreads = growThreads
  result.hackThreads = hackThreads
  result.totalThreads = totalThreads
  result.cycleTime = cycleTime
  result.hackSubBatches = hackSubBatchesCorrected
  result.hackSubBatchSize = hackSubBatchSize
  result.hackSubBatchRemainder = hackSubBatchRemainder

  return result
}
