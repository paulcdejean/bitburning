import { GuardError } from './errors/GuardError.js'

/**
 * Wrapper
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  hackPowerFormulaVerify(ns)
}

/**
 * Debugs the formula for how much your hacking power goes up on levelup
 *
 * @param {NS} ns NS
 */
export function hackPowerFormulaVerify (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  const server = ns.getServer('phantasy')
  const player = ns.getPlayer()
  let skillMult = (player.hacking - (server.requiredHackingSkill - 1)) / player.hacking

  const computedNormalizedHackingPower = ns.hackAnalyze('phantasy') / skillMult

  skillMult = (player.hacking - (server.requiredHackingSkill - 1)) / player.hacking
  ns.tprint('Hacking level = ', player.hacking)
  ns.tprint('Formulas power = ', ns.formulas.hacking.hackPercent(server, player))
  ns.tprint('Computed hacking power = ', computedNormalizedHackingPower * skillMult)

  player.hacking = player.hacking + 100
  skillMult = (player.hacking - (server.requiredHackingSkill - 1)) / player.hacking
  ns.tprint('skillMult = ', skillMult)
  ns.tprint('Hacking level = ', player.hacking)
  ns.tprint('Hacking power = ', ns.formulas.hacking.hackPercent(server, player))
  ns.tprint('Computed hacking power = ', computedNormalizedHackingPower * skillMult)
}
