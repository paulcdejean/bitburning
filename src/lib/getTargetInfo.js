import { GuardError } from './errors/GuardError.js'

import { SAFE_LEVELS_UP } from './lib/constants.js'

/**
 * Returns an info object about a particular target
 *
 * @param {NS} ns NS
 * @param target the target to return info about
 * @returns a taret info object
 */
export function getTargetInfo (ns, target) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }

  const serverInfo = ns.getServer(target)
  const info = {}

  info.hackPower = ns.hackAnalyze(target)

  // Formulas divination, see testing/hackPowerFormulaVerify.js
  const playerHackingLevel = ns.getHackingLevel()
  const hackingSkillMult = (playerHackingLevel - (serverInfo.requiredHackingSkill - 1)) / playerHackingLevel
  const normalizedHackingPower = info.hackPower / hackingSkillMult
  const safeHackingLevel = playerHackingLevel + SAFE_LEVELS_UP
  const safeHackingSkillMult = (safeHackingLevel - (serverInfo.requiredHackingSkill - 1)) / safeHackingLevel
  const safeHackingPower = normalizedHackingPower * safeHackingSkillMult

  info.name = target
  info.minSecurity = serverInfo.minDifficulty
  info.currentSecurity = serverInfo.hackDifficulty
  info.maxMoney = serverInfo.moneyMax
  info.currentMoney = Math.max(serverInfo.moneyAvailable, 1)
  info.weakenTime = ns.getWeakenTime(target)
  info.growTime = ns.getGrowTime(target)
  info.hackTime = ns.getHackTime(target)
  info.requiredSkill = serverInfo.requiredHackingSkill
  info.safeHackPower = safeHackingPower

  return info
}
