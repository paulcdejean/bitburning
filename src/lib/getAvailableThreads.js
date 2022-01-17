import { GuardError } from './errors/GuardError.js'

/**
 * Gets the number of currently available threads on all nodes we have access to.
 *
 * @param {NS} ns NS
 * @param nodes The nodes object
 * @param remoteRam The avilable RAM for a remote we'll use to calculate available thread count
 * @returns The number of available threads
 */
export function getAvailableThreads (ns, nodes, remoteRam) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (nodes === undefined) {
    throw new GuardError('nodes is required')
  }
  if (remoteRam === undefined) {
    throw new GuardError('remoteRam is required')
  }
  let reenableLog = false
  let result = 0

  if (ns.isLogEnabled('getServerUsedRam')) {
    reenableLog = true
    ns.disableLog('getServerUsedRam')
  }

  for (const node in nodes) {
    if (nodes[node].root) {
      // To avoid negative values for home, due to the reserved RAM functionality there
      const nodeRam = Math.max(nodes[node].ram - ns.getServerUsedRam(node), 0)
      result = result + Math.floor(nodeRam / remoteRam)
    }
  }
  if (reenableLog) {
    ns.enableLog('getServerUsedRam')
  }
  return result
}
