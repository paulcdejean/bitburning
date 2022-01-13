import { getNodes } from './nodes/getNodes.js'

/**
 * Gets the number of threads available to launch a remote with a given amount of RAM
 *
 * @param ns NS
 * @param nodes nodes object
 * @param remoteRam The RAM of the remote script we're computing threads for
 * @returns {number} The number of threads available for the remote to consume
 */
export async function main (ns) {
  const nodes = getNodes(ns)
  ns.tprint(getAvailableThreads(ns, nodes, 1.85))
}

/**
 * @param ns
 * @param nodes
 * @param remoteRam
 */
export function getAvailableThreads (ns, nodes, remoteRam) {
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
