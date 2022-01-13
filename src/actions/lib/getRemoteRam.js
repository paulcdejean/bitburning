/** @param {NS} ns */

/**
 * Returns the maximum amount of RAM used by all passed in remotes
 *
 * @param ns NS
 * @param {...string} remotes filenames of remotes
 * @returns {number} The GB of RAM used by the costliest remote
 */
export function getRemoteRam (ns, ...remotes) {
  const ram = []
  for (const remote of remotes) {
    if (ns.fileExists(remote)) {
      ram.push(ns.getScriptRam(remote))
    } else {
      ns.tprint('ERROR: remote ', remote, ' does not exist!')
    }
  }

  return Math.max(...ram)
}
