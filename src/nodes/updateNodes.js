/** @param {NS} ns */
import { nodeListFile } from './nodes/lib/constants.js'
import { scanNodes } from './nodes/lib/scanNodes.js'
import { fillInfo } from './nodes/lib/fillInfo.js'
import { fillRoot } from './nodes/lib/fillRoot.js'
import { sortNodes } from './nodes/lib/sortNodes.js'

/**
 * Allows updating the node list adhoc via run
 *
 * @param ns NS
 */
export async function main (ns) {
  await updateNodes(ns, ns.args[0])
}

/**
 * Updates the nodes list file based on the current reality
 * Also roots servers that it's able to root as a side effect
 *
 * @param ns NS
 * @param freshRun Rebuilds the nodes list file from scratch, required after installing augs
 */
export async function updateNodes (ns, freshRun) {
  let nodes

  if (ns.fileExists(nodeListFile) && !freshRun) {
    nodes = JSON.parse(ns.read(nodeListFile))
  } else {
    ns.tprint('Updating nodes for a fresh ascension')
    freshRun = true // make sure we fill info if the file didn't exist
    nodes = {
      home: {
        scanned: false,
        purchased: false,
        root: true
      }
    }
    scanNodes(ns, nodes)
  }

  if (freshRun) {
    fillInfo(ns, nodes)
  }

  fillRoot(ns, nodes)

  if (freshRun) {
    const sortedNodes = sortNodes(ns, nodes)
    await ns.write(nodeListFile, JSON.stringify(sortedNodes, null, 2), 'w')
  } else {
    await ns.write(nodeListFile, JSON.stringify(nodes, null, 2), 'w')
  }

  ns.tprint('Updated nodes list')
}
