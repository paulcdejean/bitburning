import { GuardError } from './errors/GuardError.js'

import { getRemoteRam } from './lib/getRemoteRam.js'
import { aquireLockAsync } from './lib/aquireLockAsync.js'
import { releaseLockAsync } from './lib/releaseLockAsync.js'
import { getNodes } from './lib/getNodes.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { batchRemotes } from './lib/batchRemotes.js'

import {
  SHARE_REMOTE_FILE
} from './lib/constants.js'

/**
 * Wraps the weaken target action, allowing you to call it from the command line
 * args[0] is the target and is required
 * args[1] is the maximum number of threads, default to all available
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  const remoteRam = getRemoteRam(ns, SHARE_REMOTE_FILE)

  await aquireLockAsync(ns)
  const nodes = getNodes(ns)
  let threads = getAvailableThreads(ns, nodes, remoteRam)

  if (ns.args[1] && ns.args[1] < threads) {
    threads = ns.args[1]
  }

  share(ns, threads)
  await releaseLockAsync(ns)
}

/**
 * Weakens a target to min security, launching a daemon and remote to faciliate this
 *
 * @param {NS} ns NS
 * @param threads The number of threads to use to share
 */
export function share (ns, threads) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (threads === undefined) {
    throw new GuardError('threads is required')
  }

  ns.tprint('Sharing with ', threads, ' threads')

  const remoteRam = getRemoteRam(ns, SHARE_REMOTE_FILE)

  // Launch remotes
  const remotes = [{
    name: SHARE_REMOTE_FILE,
    threads: threads,
    args: []
  }]
  batchRemotes(ns, remotes, remoteRam)
}
