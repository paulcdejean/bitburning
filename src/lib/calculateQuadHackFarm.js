import { MinSecurityRequiredError } from './errors/MinSecurityRequiredError.js'
import { GuardError } from './errors/GuardError.js'

import { getTargetInfo } from './lib/getTargetInfo.js'

import {
  DEFAULT_SKIM_PERCENT,
  MATH_DEBUGGING
} from './lib/constants.js'

/**
 * Calculates the profitability, number of threads and cycle time, for the quad hack farm method.
 *
 * @param {NS} ns NS
 * @param target The target to calculate quad hack farm stats for
 * @param skimPercent The maximum amount to skim off the target
 * @param threads
 * @param maxSkimPercent
 * @returns An object detailing all the info needed to farm the target
 */
export function calculateQuadHackFarm (ns, target, threads, maxSkimPercent = DEFAULT_SKIM_PERCENT) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (threads === undefined) {
    throw new GuardError('threads is required')
  }

  const result = {}

  const targetInfo = getTargetInfo(ns, target)

  if (targetInfo.currentSecurity !== targetInfo.minSecurity) {
    throw new MinSecurityRequiredError("Quad hack farm doesn't use formulas, and so requires minimum security to calculate")
  }

  const hacksPerThread = 4
  const skimPercentPerHack = 1 - Math.pow(1 - skimPercent, (1 / hacksPerThread))
  const hackThreads = Math.floor(skimPercentPerHack / targetInfo.hackPower)
  const growthRequired = 1 / (1 - skimPercent)
  const growThreads = Math.ceil(ns.growthAnalyze(target, growthRequired))
  const securityIncraseAmount = ns.growthAnalyzeSecurity(growThreads) + ns.hackAnalyzeSecurity(hackThreads * hacksPerThread)
  const weakenDecraseAmount = ns.weakenAnalyze(1)
  const weakenThreads = Math.ceil(securityIncraseAmount / weakenDecraseAmount)

  if (MATH_DEBUGGING) {
    ns.tprint(targetInfo)
    ns.tprint('hacksPerThread = ', hacksPerThread)
    ns.tprint('skimPercentPerHack = ', skimPercentPerHack)
    ns.tprint('hackThreads = ', hackThreads)
    ns.tprint('growthRequired = ', growthRequired)
    ns.tprint('growThreads = ', growThreads)
    ns.tprint('securityIncraseAmount = ', securityIncraseAmount)
    ns.tprint('weakenDecraseAmount = ', weakenDecraseAmount)
    ns.tprint('weakenThreads = ', weakenThreads)
  }

  return result
}
