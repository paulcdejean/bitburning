import { GuardError } from './errors/GuardError.js'
import { FileNotFoundError } from './errors/FileNotFoundError.js'

import { getTargetInfo } from './lib/getTargetInfo.js'
import { getRemoteRam } from './lib/getRemoteRam.js'
import { aquireLockAsync } from './lib/aquireLockAsync.js'
import { releaseLockAsync } from './lib/releaseLockAsync.js'
import { getNodes } from './lib/getNodes.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { batchRemotes } from './lib/batchRemotes.js'

import {
  WEAKEN_REMOTE_FILE,
  GROW_REMOTE_FILE,
  GROW_PORT,
  HOME,
  MATH_DEBUGGING,
  DEFAULT_CYCLE_BUFFER,
  DEFAULT_OPS_BUFFER
} from './lib/constants.js'

/**
 * Wraps the weaken target action, allowing you to call it from the command line
 * args[0] is the target and is required
 * args[1] is the maximum number of threads, default to all available
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE, GROW_REMOTE_FILE)

  await aquireLockAsync(ns)
  const nodes = getNodes(ns)
  let threads = getAvailableThreads(ns, nodes, remoteRam)

  if (ns.args[1] && ns.args[1] < threads) {
    threads = ns.args[1]
  }

  growTarget(ns, ns.args[0], threads)
  await releaseLockAsync(ns)
}

/**
 * Grows a target to max money.
 *
 * @param {NS} ns NS
 * @param target The target to grow to max money
 * @param threads The number of threads to use to grow the target
 * @param cycleBuffer The amount of time to wait after the weaken to calculate the cycle
 * @param opsBuffer The amount of time to wait between the grow and the weaken
 * @returns The arguments of the grow daemon launched to supervise this action
 */
export function growTarget (ns, target, threads, cycleBuffer = DEFAULT_CYCLE_BUFFER, opsBuffer = DEFAULT_OPS_BUFFER) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (threads === undefined) {
    throw new GuardError('threads is required')
  }

  const daemonFilename = '/daemons/growDaemonAsync.js'
  if (!ns.fileExists(daemonFilename)) {
    throw new FileNotFoundError("Couldn't find daemon file " + daemonFilename)
  }

  ns.tprint('Growing ', target, ' with ', threads, ' threads')

  const targetInfo = getTargetInfo(ns, target)
  const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE, GROW_REMOTE_FILE)
  const weakenSecurityPower = ns.weakenAnalyze(1)
  const growSecurityPower = ns.growthAnalyzeSecurity(1)
  const weakenRatio = growSecurityPower / (weakenSecurityPower + growSecurityPower)
  const growRatio = weakenSecurityPower / (weakenSecurityPower + growSecurityPower)
  const weakenThreads = Math.ceil(threads * weakenRatio)
  const growThreads = Math.ceil(threads * growRatio)
  const growthNeeded = targetInfo.maxMoney / targetInfo.currentMoney
  const cycleCount = Math.ceil(ns.growthAnalyze(target, growthNeeded) / growThreads)
  const cycleTime = targetInfo.weakenTime + cycleBuffer

  if (MATH_DEBUGGING) {
    ns.tprint('weakenSecurityPower = ', weakenSecurityPower)
    ns.tprint('growSecurityPower = ', growSecurityPower)
    ns.tprint('weakenRatio = ', weakenRatio)
    ns.tprint('growRatio = ', growRatio)
    ns.tprint('weakenThreads = ', weakenThreads)
    ns.tprint('growThreads = ', growThreads)
    ns.tprint('growthNeeded = ', growthNeeded)
    ns.tprint('cycleCount = ', cycleCount)
    ns.tprint('cycleTime = ', cycleTime)
  }

  ns.tprint('Fully growing ', target, ' from ', ns.nFormat(targetInfo.currentMoney, '0.000a'), ' money to ', ns.nFormat(targetInfo.maxMoney, '0.000a'),
    ' will take ', cycleCount, ' cycles at ', ns.tFormat(cycleTime), ' per cycle')

  // Launch remotes
  const remotes = [
    {
      name: GROW_REMOTE_FILE,
      threads: growThreads,
      args: [GROW_PORT, target, 0]
    },
    {
      name: WEAKEN_REMOTE_FILE,
      threads: weakenThreads,
      args: [GROW_PORT, target, 0]
    }
  ]
  batchRemotes(ns, remotes, remoteRam)

  // Launch daemon
  ns.tprint('Launching daemon')
  const daemonArgs = [daemonFilename, HOME, 1, target]
  ns.exec(...daemonArgs)
  return daemonArgs
}
