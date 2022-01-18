import { GuardError } from './errors/GuardError.js'

import { getNodes } from './lib/getNodes.js'
import {
  HOME,
  REMOTES_FOLDER
} from './lib/constants.js'

/**
 * Wraps scpRemotes so it can be called from the command line
 *
 * @param ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  const nodes = getNodes(ns)
  await scpRemotesAsync(ns, nodes)
}

/**
 * scps remote scripts over to all known nodes
 *
 * @param ns NS
 * @param nodes the nodes object
 */
export async function scpRemotesAsync (ns, nodes) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (nodes === undefined) {
    throw new GuardError('nodes is required')
  }

  const remotes = ns.ls(HOME, REMOTES_FOLDER)
  for (const node in nodes) {
    await ns.scp(remotes, HOME, node)
  }

  ns.tprint('Finished transfering remotes')
}
