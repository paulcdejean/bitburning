import { GuardError } from './errors/GuardError.js'

/**
 * Wrapper
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  info(ns, ns.args[0])
}
/**
 * tprints info about a target
 *
 * @param {NS} ns NS
 * @param target The target to get info on
 */
export function info (ns, target) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }

  const maxMoney = ns.getServerMaxMoney(target)
  const currentMoney = ns.getServerMoneyAvailable(target)
  const hackRate = ns.hackAnalyze(target)

  ns.tprint('Server name ', target)
  ns.tprint('Max money ', maxMoney)
  ns.tprint('Current money ', currentMoney)
  ns.tprint('Server growth ', ns.getServerGrowth(target))
  ns.tprint('Min security ', ns.getServerMinSecurityLevel(target))
  ns.tprint('Current security ', ns.getServerSecurityLevel(target))
  ns.tprint('Weaken time ', ns.tFormat(ns.getWeakenTime(target)))
  ns.tprint('Grow time ', ns.tFormat(ns.getGrowTime(target)))
  ns.tprint('Grow rate ', ns.getServerGrowth(target))
  ns.tprint('Hack time ', ns.tFormat(ns.getHackTime(target)))
  ns.tprint('Hack rate ', hackRate)
  ns.tprint('Grow calls required per hack ', ns.growthAnalyze(target, 1 + hackRate))
  ns.tprint('Grow calls required to double ', ns.growthAnalyze(target, 2))
  ns.tprint('Grow calls required to max ', ns.growthAnalyze(target, maxMoney / currentMoney))
  ns.tprint('Hack chance ', ns.hackAnalyzeChance(target))
}
