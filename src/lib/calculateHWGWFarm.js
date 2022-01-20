import { GuardError } from './errors/GuardError.js'

import { getTargetInfo } from './lib/getTargetInfo.js'
import { calculateHWGWBatch } from './lib/calculateHWGWBatch.js'

import {
  DEFAULT_CYCLE_BUFFER,
  DEFAULT_OPS_BUFFER,
  MILLISECONDS_IN_A_SECOND
} from './lib/constants.js'

/**
 * TODO
 *
 * @param {NS} ns NS
 * @param target The target to calculate for
 * @param threads The maximum available threads to calculate farm stuff for
 * @param opsBuffer The amount to of padding between the hack grow and weaken
 * @param cycleBuffer The amount to wait after weaken lands, before calculating the cycle
 * @returns information about the farm
 */
export function calculateHWGWFarm (ns, target, threads, opsBuffer = DEFAULT_OPS_BUFFER, cycleBuffer = DEFAULT_CYCLE_BUFFER) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (threads === undefined) {
    throw new GuardError('threads is required')
  }

  const targetInfo = getTargetInfo(ns, target)

  // We can't start any operations after the first hack lands, as we gain exp when it lands.
  // The first hack lands after weakenTime - opsBuffer
  // The last operation started will be the last hack.
  // Therefore the batches is hackTime / (opsBuffer * 4)
  // This is because the first hack is started when the first hack starts, and the last hack is started before the first hack ends
  // Also note that the max batches can shrink over time as hacking level goes up and hack times shrink
  // So the daemon is also calculating this and disabling batches as needed. It can disable batches but not adjust batch sizes.
  const maximumBatches = Math.floor(targetInfo.hackTime / (opsBuffer * 4))

  let batchCount = maximumBatches
  let idealBatchCount = 0
  let bestIncome = 0

  while (batchCount > 0) {
    const batchSize = Math.floor(threads / batchCount)
    const batchCalculations = calculateHWGWBatch(ns, target, batchSize, 1, opsBuffer, cycleBuffer)
    const batchCycleTime = batchCalculations.cycleTime + (batchCount * opsBuffer)
    const cycleIncome = (batchCalculations.moneyPerCycle * batchCount) / batchCycleTime

    if (cycleIncome > bestIncome) {
      bestIncome = cycleIncome
      idealBatchCount = batchCount
    }

    batchCount = batchCount - 1
  }

  const batchSize = Math.floor(threads / idealBatchCount)
  const batchCalculations = calculateHWGWBatch(ns, target, batchSize, 1, opsBuffer, cycleBuffer)

  const batchCycleTime = batchCalculations.cycleTime + (idealBatchCount * opsBuffer)
  batchCalculations.moneyPerCycle = batchCalculations.moneyPerCycle * idealBatchCount
  batchCalculations.moneyPerSecond = batchCalculations.moneyPerCycle / batchCycleTime * MILLISECONDS_IN_A_SECOND
  batchCalculations.cycleTime = batchCycleTime
  batchCalculations.batches = idealBatchCount

  return batchCalculations
}
