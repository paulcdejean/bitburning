/** @param {NS} ns */

/**
 * Execs all the arrays of remotes provided, on all available nodes
 *
 * @param ns NS
 * @param nodes the nodes object
 * @param remotes an array of remotes we want to launch
 * @param remoteRam the max amount of ram any of the remotes takes
 */
export function batchRemotes (ns, nodes, remotes, remoteRam) {
  let reenableLog = false
  if (ns.isLogEnabled('exec')) {
    reenableLog = true
    ns.disableLog('exec')
  }

  ns.tprint(remotes)

  let currentBatch = remotes.pop()

  let subBatchNumber = 0
  for (const node in nodes) {
    if (nodes[node].root) {
      const nodeRam = nodes[node].ram - ns.getServerUsedRam(node)
      let nodeThreads = Math.floor(nodeRam / remoteRam)

      while (nodeThreads >= currentBatch.threads) {
        // Consume all of the batch's threads, then pop the next batch
        if (currentBatch.threads < 1) {
          ns.tprint('WARNING: Wanting to exec with wrong threads at A ', currentBatch.threads)
        }
        ns.exec(currentBatch.name, node, currentBatch.threads, currentBatch.threads, subBatchNumber, ...currentBatch.args)
        nodeThreads = nodeThreads - currentBatch.threads

        if (remotes.length > 0) {
          currentBatch = remotes.pop()
          subBatchNumber = 0
        } else {
          if (reenableLog) {
            ns.enableLog('exec')
          }
          return
        }
      }

      // Just go to the next node right away don't exec with wrong threads
      if (nodeThreads <= 0) {
        continue
      }

      // Consume all the node's threads, then go to the next node
      if (nodeThreads < 1) {
        ns.tprint('WARNING: Wanting to exec with wrong threads at B ', nodeThreads)
      }
      ns.exec(currentBatch.name, node, nodeThreads, nodeThreads, subBatchNumber, ...currentBatch.args)
      currentBatch.threads = currentBatch.threads - nodeThreads

      subBatchNumber = subBatchNumber + 1
    }
  }

  if (reenableLog) {
    ns.enableLog('exec')
  }
}
