/** @param {NS} ns */
import { defaultSkimPercent, mathDebuggingEnabled, defaultGrowthSafety } from './lib/constants.js'
import { getGrowthAmount } from './lib/getGrowthAmount.js'

/**
 * For a given target, return the number of grow and hack threads for a single grow+hack batch
 *
 * @param ns NS
 * @param target the node to get batch info about
 * @param hackCount the number of times a hack remote will hack, required
 * @param skimPercent the percentage per batch to hack from the target, default to defaultSkimPercentage
 * A higher skim percentage means larger batches and lower efficency, and a lower percentage is smaller batches and higher efficency
 * @param growthSafety 100% = safeGrowThreads, 0% = greedyGrowThreads
 * @returns a object containing all the info needed to spin up a farm
 */
export function getBatchThreads (ns, target, hackCount, skimPercent, growthSafety) {
  // Sanity checks
  if (skimPercent > 1 || skimPercent < 0) {
    ns.tprint('ERROR: skimPercent must be between 0 and 1')
    return null
  }
  if (!hackCount) {
    ns.tprint('ERROR: hackCount is required')
    return null
  }

  // Defaulting
  if (!skimPercent) {
    skimPercent = defaultSkimPercent
  }
  if (growthSafety === undefined) {
    growthSafety = defaultGrowthSafety
  }

  const hackRate = ns.hackAnalyze(target)

  // MATH!
  const skimPercentPerHack = 1 - Math.pow(1 - skimPercent, (1 / hackCount))
  const hackThreads = Math.floor(skimPercentPerHack / hackRate)

  // This is going to be very similar to the skim percentage, but it's adjusted for thread counts being whole numbers!
  const amountSkimmedPerHackCycle = hackThreads * hackRate
  const amountSkimmedPerCycle = 1 - Math.pow(1 - amountSkimmedPerHackCycle, hackCount)

  // Now that the amount we're hacking is finalized we can calculate growth
  const growRequired = 1 / (1 - amountSkimmedPerCycle)
  const greedyGrowThreads = Math.ceil(ns.growthAnalyze(target, growRequired))

  // Due to some race condition, hack analyze lies
  const growthAmount = getGrowthAmount(ns, target)
  const safeGrowThreads = Math.ceil(1 / (growthAmount - 1))

  const growThreads = Math.ceil(greedyGrowThreads + (safeGrowThreads - greedyGrowThreads) * growthSafety)

  if (mathDebuggingEnabled) {
    ns.tprint('hackRate = ', hackRate)
    ns.tprint('skimPercentPerHack = ', skimPercentPerHack)
    ns.tprint('hackThreads = ', hackThreads)
    ns.tprint('amountSkimmedPerHackCycle = ', amountSkimmedPerHackCycle)
    ns.tprint('amountSkimmedPerCycle = ', amountSkimmedPerCycle)
    ns.tprint('growRequired = ', growRequired)
    ns.tprint('growthAmount = ', growthAmount)
    ns.tprint('greedyGrowThreads = ', greedyGrowThreads)
    ns.tprint('safeGrowThreads = ', safeGrowThreads)
    ns.tprint('growThreads = ', growThreads)
  }

  return {
    growThreads: growThreads,
    hackThreads: hackThreads,
    amountSkimmedPerCycle: amountSkimmedPerCycle
  }
}
