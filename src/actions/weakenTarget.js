import { GuardError } from './errors/GuardError.js'

import { getTargetInfo } from './lib/getTargetInfo.js'
import { getRemoteRam } from './lib/getRemoteRam.js'
import { aquireLockAsync } from './lib/aquireLockAsync.js'
import { releaseLockAsync } from './lib/releaseLockAsync.js'
import { getNodes } from './lib/getNodes.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { batchRemotes } from './lib/batchRemotes.js'

import {
  WEAKEN_REMOTE_FILE,
  WEAKEN_PORT,
  HOME
} from './lib/constants.js'

/**
 * Wraps the weaken target action, allowing you to call it from the command line
 * args[0] is the target and is required
 * args[1] is the maximum number of threads, default to all available
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE)

  await aquireLockAsync(ns)
  const nodes = getNodes(ns)
  let threads = getAvailableThreads(ns, nodes, remoteRam)
  ns.tprint(threads)

  if (ns.args[1] && ns.args[1] < threads) {
    threads = ns.args[1]
  }

  weakenTarget(ns, ns.args[0], threads)
  await releaseLockAsync(ns)
}

/**
 * Weakens a target to min security, launching a daemon and remote to faciliate this
 *
 * @param {NS} ns NS
 * @param target The target to weaken
 * @param threads The number of threads to use to weaken the target
 * @returns The arguments of the weaken daemon launched to supervise this action
 */
export function weakenTarget (ns, target, threads) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (threads === undefined) {
    throw new GuardError('threads is required')
  }

  ns.tprint('Weakening ', target, ' with ', threads, ' threads')

  const targetInfo = getTargetInfo(ns, target)
  const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE)

  const cycleCount = Math.ceil(Math.max(1, (targetInfo.currentSecurity - targetInfo.minSecurity) / ns.weakenAnalyze(threads)))
  ns.tprint('Fully weakening ', target, ' from ', targetInfo.currentSecurity, ' security to ', targetInfo.minSecurity,
    ' will take ', cycleCount, ' cycles')

  // Launch remotes
  const remotes = [{
    name: WEAKEN_REMOTE_FILE,
    threads: threads,
    args: [WEAKEN_PORT, target, 0]
  }]
  batchRemotes(ns, remotes, remoteRam)

  // Launch daemon
  ns.tprint('Launching daemon')
  const daemonArgs = ['/daemons/weakenDaemon.js', HOME, 1, target]
  // ns.exec(...daemonArgs)
  return daemonArgs
}
