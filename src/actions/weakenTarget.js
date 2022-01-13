/** @param {NS} ns */

import { weakenSecurityPower, weakenPort, home } from './lib/constants.js'
import { aquireLock } from './lib/aquireLock.js'
import { releaseLock } from './lib/releaseLock.js'

import { getNodes } from './nodes/getNodes.js'

import { getTargetInfo } from './lib/getTargetInfo.js'
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
  await weakenTarget(ns, nodes, ns.args[0], ns.args[1])
}

/**
 * Weakens the target's security to minium
 *
 * @param ns NS
 * @param nodes the nodes object
 * @param target the target to weaken
 * @param requestedThreads the number of the threads we want to use to weaken the target, falsy means all available
 */
export async function weakenTarget (ns, nodes, target, requestedThreads) {
  // Constants
  const verb = 'Weakening'
  const weakenRemote = '/remotes/weaken.js'

  // Gather info on target
  const targetInfo = getTargetInfo(ns, target)
  const remoteRam = getRemoteRam(ns, weakenRemote)

  // Sanity checks
  if (targetInfo.currentSecurity === targetInfo.minSecurity) {
    ns.tprint('Target ', target, ' is already at minimum security, no need to weaken')
    return
  }

  // Annouce what you're doing and how many threads
  await aquireLock(ns)
  const threads = threadAnnouce(ns, nodes, verb, target, requestedThreads, remoteRam)

  // Math
  const cycleCount = Math.ceil(Math.max(1, (targetInfo.currentSecurity - targetInfo.minSecurity) / weakenSecurityPower / threads))
  ns.tprint('Fully weakening ', target, ' from ', targetInfo.currentSecurity, ' security to ', targetInfo.minSecurity,
    ' will take ', cycleCount, ' cycles')

  // Launch remotes
  const remotes = [{
    name: weakenRemote,
    threads: threads,
    args: [weakenPort, target, 0]
  }]
  batchRemotes(ns, nodes, remotes, remoteRam)

  // Launch daemon
  ns.tprint('Launching daemon')
  const daemonArgs = ['/daemons/weakenDaemon.js', home, 1, target]
  ns.exec(...daemonArgs)
  await releaseLock(ns)
  return daemonArgs
}
