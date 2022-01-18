import { GuardError } from './errors/GuardError.js'

import { getNodes } from './lib/getNodes.js'

/**
 * Runs remotes across all available nodes.
 *
 * @param {NS} ns NS
 * @param remotes An array of remotes to exec on nodes
 * @param remoteRam The amount of RAM we assume a remote to have
 */
export function batchRemotes (ns, remotes, remoteRam) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (remotes === undefined) {
    throw new GuardError('remotes is required')
  }
  if (remoteRam === undefined) {
    throw new GuardError('remoteRam is required')
  }

  let currentBatch = remotes.pop()
  const nodes = getNodes(ns)

  let subBatchNumber = 0
  for (const node in nodes) {
    if (nodes[node].root) {
      const nodeRam = nodes[node].ram - ns.getServerUsedRam(node)
      let nodeThreads = Math.floor(nodeRam / remoteRam)

      while (nodeThreads >= currentBatch.threads) {
        // Consume all of the batch's threads, then pop the next batch
        ns.exec(currentBatch.name, node, currentBatch.threads, currentBatch.threads, subBatchNumber, ...currentBatch.args)
        nodeThreads = nodeThreads - currentBatch.threads

        if (remotes.length > 0) {
          currentBatch = remotes.pop()
          subBatchNumber = 0
        } else {
          return
        }
      }

      // Just go to the next node right away don't exec with wrong threads
      if (nodeThreads <= 0) {
        continue
      }

      // Consume all the node's threads, then go to the next node
      ns.exec(currentBatch.name, node, nodeThreads, nodeThreads, subBatchNumber, ...currentBatch.args)
      currentBatch.threads = currentBatch.threads - nodeThreads

      subBatchNumber = subBatchNumber + 1
    }
  }
}
