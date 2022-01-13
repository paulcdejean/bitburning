/** @param {NS} ns */

/**
 * Returns an info object about a particular target
 *
 * @param ns NS
 * @param target the target to return info about
 * @returns a taret info object
 */
export function getTargetInfo (ns, target) {
  const serverInfo = ns.getServer(target)
  const info = {}
  info.name = target
  info.minSecurity = serverInfo.minDifficulty
  info.currentSecurity = serverInfo.hackDifficulty
  info.maxMoney = serverInfo.moneyMax
  info.currentMoney = Math.max(serverInfo.moneyAvailable, 1)
  info.weakenTime = ns.getWeakenTime(target)
  info.growTime = ns.getGrowTime(target)
  info.hackTime = ns.getHackTime(target)

  return info
}
