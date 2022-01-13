/** @param {NS} ns */

import { getNodes } from './nodes/getNodes.js'
import { home, remotesFolder } from './lib/constants.js'

/**
 * Wraps scpRemotes so it can be called from the command line
 *
 * @param ns NS
 */
export async function main (ns) {
  const nodes = getNodes(ns)
  await scpRemotes(ns, nodes)
}

/**
 * scps remote scripts over to all known nodes
 *
 * @param ns NS
 * @param nodes the nodes object
 */
export async function scpRemotes (ns, nodes) {
  const remotes = ns.ls(home, remotesFolder)

  for (const node in nodes) {
    await ns.scp(remotes, home, node)
  }
  ns.tprint('Finished transfering remotes')
}
