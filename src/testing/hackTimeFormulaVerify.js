import { GuardError } from './errors/GuardError.js'

/**
 * Wraps hackTimeFormulaVerify allowing it to be called from the command line...
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  hackTimeFormulaVerify(ns, ns.args[0])
}

/**
 * Verifies correctness of a magical hack time formula
 *
 * @param {NS} ns NS
 * @param target the target to verify the formula on
 */
export function hackTimeFormulaVerify (ns, target) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }

  const server = ns.getServer(target)
  const player = ns.getPlayer()
  const minSecurity = ns.getServerMinSecurityLevel(target)
  const requiredHackingSkill = ns.getServerRequiredHackingLevel(target)
  ns.tprint('minSecurity = ', minSecurity)
  server.hackDifficulty = minSecurity
  const minSecurityHackTime = ns.formulas.hacking.hackTime(server, player)
  const timeIncrasePerSecurity = minSecurityHackTime / ((200 / requiredHackingSkill) + minSecurity)

  ns.tprint(server)

  let n = 0
  while (n < 5) {
    server.hackDifficulty = minSecurity + n
    const actualHackTime = ns.formulas.hacking.hackTime(server, player)

    const computedHackTime = minSecurityHackTime + (timeIncrasePerSecurity * n)
    ns.tprint('actualHackTime = ', actualHackTime)
    ns.tprint('computedHackTime = ', computedHackTime)

    n = n + 1
  }
}
