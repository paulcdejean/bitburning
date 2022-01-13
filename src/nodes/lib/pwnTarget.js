/** @param {NS} ns */

/**
 * Attempts to get root on the target using the provided port opening tools.
 *
 * @param ns NS
 * @param target the target to get root on
 * @param tools an array of port opening tools that exist on home
 */
export function pwnTarget (ns, target, tools) {
  if (tools.includes('BruteSSH.exe')) {
    ns.brutessh(target)
  }
  if (tools.includes('FTPCrack.exe')) {
    ns.ftpcrack(target)
  }
  if (tools.includes('relaySMTP.exe')) {
    ns.relaysmtp(target)
  }
  if (tools.includes('HTTPWorm.exe')) {
    ns.httpworm(target)
  }

  if (tools.includes('SQLInject.exe')) {
    ns.sqlinject(target)
  }

  ns.nuke(target)
}
