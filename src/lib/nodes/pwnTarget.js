import { GuardError } from './errors/GuardError.js'

/**
 * Attempts to get root on the target using the provided port opening tools.
 *
 * @param ns NS
 * @param target the target to get root on
 * @param tools an array of port opening tools that exist on home
 */
export function pwnTarget (ns, target, tools) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (tools === undefined) {
    throw new GuardError('tools is required')
  }
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
