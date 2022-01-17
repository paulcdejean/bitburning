import { GuardError } from './errors/GuardError.js'

import { getNodes } from './lib/getNodes.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'

import { initPortsAsync } from './actions/initPortsAsync.js'
import { updateNodesAsync } from './actions/updateNodesAsync.js'

/**
 * Wraps init allowing it to be called from the command line.
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  await initAsync(ns)
}

/**
 * Good to run at the start of a run.
 *
 * @param {NS} ns NS
 */
export async function initAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  await updateNodesAsync(ns)

  await initPortsAsync(ns)

  // scpRemotes(ns)

  const nodes = getNodes(ns)

  const availableThreads = getAvailableThreads(ns, nodes, 1.75)

  ns.tprint('Available threads: ', availableThreads)
}
