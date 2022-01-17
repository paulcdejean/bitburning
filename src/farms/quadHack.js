import { GuardError } from './errors/GuardError.js'

import { DEFAULT_SKIM_PERCENT } from './lib/constants.js'

import { calculateQuadHackFarm } from './lib/calculateQuadHackFarm.js'

/**
 * Wraps quadHack allowing it to be called from the command line
 *
 * @param {NS} ns NS
 */
export function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  quadHack(ns, ns.args[0], ns.args[1])
}

/**
 * Farms the target using a single batch quad hack method.
 *
 * @param {NS} ns NS
 * @param target The target to quadhack farm
 * @param skimPercent The percentage to skim from the target
 */
export function quadHack (ns, target, skimPercent = DEFAULT_SKIM_PERCENT) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }

  calculateQuadHackFarm(ns, target, skimPercent)
}
