/** @param {NS} ns */

import { weakenSecurityPower, growPort, home } from './lib/constants.js'
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
  await growTarget(ns, nodes, ns.args[0], ns.args[1])
}

/**
 * Grows the target's money to the maximum
 *
 * @param ns NS
 * @param nodes the nodes object
 * @param target the target to grow
 * @param requestedThreads the number of the threads we want to use to grow the target, falsy means all available
 */
export async function growTarget (ns, nodes, target, requestedThreads) {
  // Constants
  const verb = 'Growing'
  const weakenRemote = '/remotes/weaken.js'
  const growRemote = '/remotes/grow.js'

  // Gather info on target
  const targetInfo = getTargetInfo(ns, target)
  const remoteRam = getRemoteRam(ns, weakenRemote, growRemote)

  // Sanity checks
  if (targetInfo.currentSecurity !== targetInfo.minSecurity) {
    ns.tprint('Target ', target, ' must be at minimum security before it can be grown')
    return
  }
  if (targetInfo.currentMoney === targetInfo.maxMoney) {
    ns.tprint('Target ', target, ' is already at maximum money, no need to grow')
    return
  }

  // Annouce what you're doing and how many threads
  await aquireLock(ns)
  const threads = threadAnnouce(ns, nodes, verb, target, requestedThreads, remoteRam)

  // Math
  const growRatio = growSecurityPower
  const growThreads = Math.floor(threads * growRatio)
  const weakenThreads = Math.ceil(threads * weakenRatio)
  const growthNeeded = targetInfo.maxMoney / targetInfo.currentMoney
  const neededThreads = Math.ceil(ns.growthAnalyze(target, growthNeeded))
  const cycleCount = Math.ceil(neededThreads / threads)

  // Print math results
  ns.print('growRatio = ', growRatio)
  ns.print('weakenRatio = ', weakenRatio)
  ns.print('growThreads = ', growThreads)
  ns.print('weakenThreads = ', weakenThreads)
  ns.print('growthNeeded = ', growthNeeded)
  ns.print('neededThreads = ', neededThreads)

  ns.tprint('Fully growing ', target, ' from ', targetInfo.currentMoney, ' to ', targetInfo.maxMoney,
    ' will take ', cycleCount, ' cycles')

  // Launch remotes
  const remotes = [
    {
      name: weakenRemote,
      threads: weakenThreads,
      args: [growPort, target, 0]
    },
    {
      name: growRemote,
      threads: growThreads,
      args: [growPort, target, 0]
    }
  ]
  batchRemotes(ns, nodes, remotes, remoteRam)

  // Launch daemon
  ns.tprint('Launching daemon')
  const daemonArgs = ['/daemons/growDaemon.js', home, 1, target]
  ns.exec(...daemonArgs)

  await releaseLock(ns)
  return daemonArgs
}
