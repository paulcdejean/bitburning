import { GuardError } from './errors/GuardError.js'

/**
 * A method of using a binary search to approximate growPercent from the formulas API, without access to the formulas API.
 *
 * @param ns NS
 * @param target The target to return growth amount for
 * @returns The same number growPercent with 1 thread would give, but not requiring the formulas API
 */
export function getGrowthAmount (ns, target) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  let minGrowth = 1
  let maxGrowth = 10
  let result = 0
  let killSwitch = 100

  while (Math.round(result * 1000000000000) !== 1000000000000 && killSwitch > 0) {
    const averageGrowth = (minGrowth + maxGrowth) / 2
    result = ns.growthAnalyze(target, averageGrowth)
    if (result < 1) {
      minGrowth = averageGrowth
    } else {
      maxGrowth = averageGrowth
    }
    killSwitch = killSwitch - 1
  }

  return maxGrowth
}
