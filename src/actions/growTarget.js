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
  MATH_DEBUGGING
} from './lib/constants.js'

/**
 * Wraps the weaken target action, allowing you to call it from the command line
 * args[0] is the target and is required
 * args[1] is the maximum number of threads, default to all available
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE)

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
 * @returns The arguments of the grow daemon launched to supervise this action
 */
export function growTarget (ns, target, threads) {
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

  if (MATH_DEBUGGING) {
    ns.tprint('weakenSecurityPower = ', weakenSecurityPower)
    ns.tprint('growSecurityPower = ', growSecurityPower)
    ns.tprint('weakenRatio = ', weakenRatio)
    ns.tprint('growRatio = ', growRatio)
    ns.tprint('weakenThreads = ', weakenThreads)
    ns.tprint('growThreads = ', growThreads)
    ns.tprint('growthNeeded = ', growthNeeded)
    ns.tprint('cycleCount = ', cycleCount)
  }

  ns.tprint('Fully growing ', target, ' from ', targetInfo.currentMoney, ' security to ', targetInfo.maxMoney,
    ' will take ', cycleCount, ' cycles')

  const daemonArgs = [daemonFilename, HOME, 1, target]

  return daemonArgs
}
