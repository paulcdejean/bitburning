/** @param {NS} ns */
import { defaultSkimPercent, mathDebuggingEnabled, growSecurityPower, hackSecurityPower, weakenSecurityPower, milisecondsInASecond } from './lib/constants.js'
import { getBatchThreads } from './lib/getBatchThreads.js'
import { getTargetInfo } from './lib/getTargetInfo.js'

import { singleHackFarmDaemonDefaultOpsBuffer, singleHackFarmDaemonDeafultCycleBuffer } from './daemons/lib/constants.js'

/**
 * tprint current values of ports
 *
 * @param ns NS
 * @param target the node to get farm info about
 * @param maxThreads the upper limit on total threads to return, defaults to infinity
 * @param skimPercent the amount to hack per batch, defaults to defaultSkimPercent
 * @param opsBuffer the amount of buffer time between hacks and grows, defaults to singleHackFarmDaemonDefaultOpsBuffer
 * @param cycleBuffer the amount of buffer time between cycles, defaults to singleHackFarmDaemonDeafultCycleBuffer
 * @returns an object with info about the farming operation, including its expected returns
 */
export function getSingleHackFarmInfo (ns, target, maxThreads, skimPercent, opsBuffer, cycleBuffer) {
  // Defaulting
  if (maxThreads === undefined) {
    maxThreads = Infinity
  }
  if (!opsBuffer) {
    opsBuffer = singleHackFarmDaemonDefaultOpsBuffer
  }
  if (!cycleBuffer) {
    cycleBuffer = singleHackFarmDaemonDeafultCycleBuffer
  }
  if (!skimPercent) {
    skimPercent = defaultSkimPercent
  }

  const batchThreads = getBatchThreads(ns, target, 1, skimPercent)
  const targetInfo = getTargetInfo(ns, target)
  const maxBatches = Math.floor((targetInfo.weakenTime - targetInfo.growTime) / opsBuffer / 2)
  const fractionalWeakenThreadsPerBatch = (batchThreads.growThreads * growSecurityPower + batchThreads.hackThreads * hackSecurityPower) / weakenSecurityPower
  const maxPossibleThreads = Math.ceil(maxBatches * (fractionalWeakenThreadsPerBatch + batchThreads.hackThreads + batchThreads.growThreads))

  // This function is informational so it's fine for it to return 0 batches.
  // The caller function will need to decide how to deal with that.
  let batches = maxBatches
  if (maxPossibleThreads > maxThreads) {
    batches = Math.max(1, Math.floor(maxThreads / (fractionalWeakenThreadsPerBatch + batchThreads.hackThreads + batchThreads.growThreads)))
  }
  const weakenThreads = Math.ceil(fractionalWeakenThreadsPerBatch * batches)
  const totalThreads = (batchThreads.growThreads * batches) + (batchThreads.hackThreads * batches) + weakenThreads

  // Also return scoring inforamtion
  const moneyPerBatch = batchThreads.amountSkimmedPerCycle * targetInfo.maxMoney
  const moneyPerCycle = moneyPerBatch * batches
  const cycleTime = targetInfo.weakenTime + cycleBuffer
  const moneyPerSecond = moneyPerCycle / cycleTime * milisecondsInASecond
  const moneyPerSecondPerThread = moneyPerSecond / totalThreads

  if (mathDebuggingEnabled) {
    ns.tprint('Target is ', target)
    ns.tprint('Number of batches is ', batches, ' out of ', maxBatches, ' maximum possible')
    ns.tprint('fractionalWeakenThreadsPerBatch = ', fractionalWeakenThreadsPerBatch)
    ns.tprint('Number of grow threads are ', batchThreads.growThreads * batches, ' with ', batchThreads.growThreads, ' threads per batch')
    ns.tprint('Number of hack threads are ', batchThreads.hackThreads * batches, ' with ', batchThreads.hackThreads, ' threads per batch')
    ns.tprint('Number of weaken threads are ', weakenThreads, ' and they are run all as one batch')
    ns.tprint('Max batches ', maxBatches)
    ns.tprint('Max possible threads ', maxPossibleThreads)
    ns.tprint('Batches ', batches)
    ns.tprint('Money per batch ', ns.nFormat(moneyPerBatch, '0.000a'))
    ns.tprint('Money per cycle ', ns.nFormat(moneyPerCycle, '0.000a'))
    ns.tprint('Money per second ', ns.nFormat(moneyPerSecond, '0.000a'))
    ns.tprint('Money per second per thread ', ns.nFormat(moneyPerSecondPerThread, '0.000a'))
  }

  return {
    batches: batches,
    maxBatches: maxBatches,
    batchGrowThreads: batchThreads.growThreads,
    batchHackThreads: batchThreads.hackThreads,
    weakenThreads: weakenThreads,
    totalThreads: totalThreads,
    score: moneyPerSecondPerThread
  }
}
