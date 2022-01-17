import { GuardError } from './errors/GuardError.js'

import { scanNodes } from './lib/nodes/scanNodes.js'
import { fillInfo } from './lib/nodes/fillInfo.js'
import { fillRoot } from './lib/nodes/fillRoot.js'

import { NODE_LIST_FILE } from './lib/nodes/constants.js'

/**
 * Allows updating the node list adhoc via run
 *
 * @param ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  await updateNodesAsync(ns)
}

/**
 * Updates the nodes list file based on the current reality
 * Also roots servers that it's able to root as a side effect
 *
 * @param ns NS
 */
export async function updateNodesAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  const nodes = {
    home: {
      scanned: false,
      purchased: false,
      root: true
    }
  }
  scanNodes(ns, nodes)

  fillInfo(ns, nodes)

  fillRoot(ns, nodes)

  await ns.write(NODE_LIST_FILE, JSON.stringify(nodes, null, 2), 'w')

  ns.tprint('Updated nodes list')
}
