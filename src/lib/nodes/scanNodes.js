import { GuardError } from './errors/GuardError.js'

/**
 * Returns a fresh shiny new list of nodes via recursive scanning.
 *
 * @param ns NS
 * @param nodes nodes object
 */
export function scanNodes (ns, nodes) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (nodes === undefined) {
    throw new GuardError('nodes is required')
  }

  const startingNodeCount = Object.keys(nodes).length
  // Run scan on each node in the list. Add any new nodes to the nodes.
  for (const node in nodes) {
    let scanResults = []
    if (nodes[node].scanned === false) {
      scanResults = ns.scan(node)
      nodes[node].scanned = true
    }

    for (const result in scanResults) {
      if (!(scanResults[result] in nodes)) {
        nodes[scanResults[result]] = {
          scanned: false,
          purchased: false,
          root: ns.hasRootAccess(scanResults[result])
        }
      }
    }
  }

  const newNodeCount = Object.keys(nodes).length

  // If the nodes has grown since the start of the function, recur.
  if (newNodeCount > startingNodeCount) {
    scanNodes(ns, nodes)
  }
  // If it hasn't, then we're found all nodes so we can conclude.
}
