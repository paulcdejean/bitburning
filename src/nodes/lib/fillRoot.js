/** @param {NS} ns */

import { getRootingTools } from './nodes/lib/getRootingTools.js'
import { pwnTarget } from './nodes/lib/pwnTarget.js'

/**
 * Fills out information on the nodes list concerning whether we have root on the node.
 * Also will aquire root if it's possible to and we don't have root.
 *
 * @param ns NS
 * @param nodes nodes object
 */
export function fillRoot (ns, nodes) {
  const tools = getRootingTools(ns)

  for (const node in nodes) {
    if (!nodes[node].root && tools.length >= nodes[node].requiredPorts) {
      pwnTarget(ns, node, tools)
      nodes[node].root = true
    }
  }
}
