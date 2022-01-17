import { GuardError } from './errors/GuardError.js'
import { DEFAULT_SKIM_PERCENT } from './lib/constants.js'
/**
 * TODO
 *
 * @param {NS} ns NS
 * @param target The target to calculate for
 * @param skimPercent The maximum amount we want to skim off the target
 * @param availableThreads The
 */
export function calculateHWGWFarm (ns, target, skimPercent = DEFAULT_SKIM_PERCENT, availableThreads = Infinity) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
}
