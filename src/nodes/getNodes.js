/** @param {NS} ns */
import { nodeListFile } from './nodes/lib/constants.js'

/**
 * Pretty prints the nodes list
 *
 * @param ns NS
 */
export async function main (ns) {
  ns.tprint(JSON.stringify(getNodes(ns), null, 2))
}

/**
 * Gets the nodes list from the nodes list file
 *
 * @param ns NS
 * @returns nodes object
 */
export function getNodes (ns) {
  if (ns.fileExists(nodeListFile)) {
    const nodeList = JSON.parse(ns.read(nodeListFile))
    return nodeList
  } else {
    ns.tprint('node list not found, fix with: run nodes/updateNodes.js')
    return {}
  }
}
