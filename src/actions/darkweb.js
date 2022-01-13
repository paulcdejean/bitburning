/** @param {NS} ns */

import { aquireLock } from './lib/aquireLock.js'
import { releaseLock } from './lib/releaseLock.js'

import { getNodes } from './nodes/getNodes.js'

import { threadAnnouce } from './actions/lib/threadAnnouce.js'
import { getRemoteRam } from './actions/lib/getRemoteRam.js'
import { batchRemotes } from './actions/lib/batchRemotes.js'

/**
 * Wraps weaken target allowing you to call this action from the command line
 *
 * @param ns NS
 */
export async function main (ns) {
  const nodes = getNodes(ns)
  await darkweb(ns, nodes, ns.args[1])
}

/**
 * Farms xp from the darkweb
 *
 * @param ns NS
 * @param nodes the nodes object
 * @param requestedThreads the number of the threads we want to use to weaken the target, falsy means all available
 */
export async function darkweb (ns, nodes, requestedThreads) {
  // Constants
  const verb = 'Farming xp'
  const darkwebRemote = '/remotes/darkweb.js'

  // Gather info on target
  const remoteRam = getRemoteRam(ns, darkwebRemote)

  // Annouce what you're doing and how many threads
  await aquireLock(ns)
  const threads = threadAnnouce(ns, nodes, verb, 'darkweb', requestedThreads, remoteRam)

  // Launch remotes
  const remotes = [{
    name: darkwebRemote,
    threads: threads,
    args: []
  }]
  batchRemotes(ns, nodes, remotes, remoteRam)

  await releaseLock(ns)
}
