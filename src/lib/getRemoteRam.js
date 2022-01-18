import { GuardError } from './errors/GuardError.js'
import { MissingRemoteError } from './errors/MissingRemoteError.js'

/**
 * Gets the maximum RAM amount of all the remotes passed in
 *
 * @param {NS} ns NS
 * @param {...string} remotes a series of filenames of "remote" scripts
 * @returns {number} The highest RAM cost amoung the passed in remotes
 */
export function getRemoteRam (ns, ...remotes) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  const ram = []
  for (const remote of remotes) {
    if (ns.fileExists(remote)) {
      ram.push(ns.getScriptRam(remote))
    } else {
      throw new MissingRemoteError('Remote ' + remote + ' does not exist')
    }
  }

  return Math.max(...ram)
}
