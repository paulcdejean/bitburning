/** @param {NS} ns */

/**
 * Uses secret magic to get the growth amount for 1 thread.
 *
 * @param ns NS
 * @param target the target to get the growth amount for
 * @returns the growth amount for 1 thread
 */
export function getGrowthAmount (ns, target) {
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
