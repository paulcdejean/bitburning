import { GuardError } from './errors/GuardError.js'

import { getNodes } from './lib/getNodes.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'

import { initPortsAsync } from './actions/initPortsAsync.js'
import { updateNodesAsync } from './actions/updateNodesAsync.js'
import { scpRemotesAsync } from './actions/scpRemotesAsync.js'

/**
 * Wraps init allowing it to be called from the command line.
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  await updateNodesAsync(ns)

  await initPortsAsync(ns)

  const nodes = getNodes(ns)

  await scpRemotesAsync(ns, nodes)

  const availableThreads = getAvailableThreads(ns, nodes, 1.75)

  ns.tprint('Available threads: ', availableThreads)
}
