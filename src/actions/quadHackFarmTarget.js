import { GuardError } from './errors/GuardError.js'
import { FileNotFoundError } from './errors/FileNotFoundError.js'

import { getRemoteRam } from './lib/getRemoteRam.js'
import { aquireLockAsync } from './lib/aquireLockAsync.js'
import { releaseLockAsync } from './lib/releaseLockAsync.js'
import { getNodes } from './lib/getNodes.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { batchRemotes } from './lib/batchRemotes.js'
import { calculateQuadHackFarm } from './lib/calculateQuadHackFarm.js'

import {
  WEAKEN_REMOTE_FILE,
  GROW_REMOTE_FILE,
  HACK_REMOTE_FILE,
  FARM_PORT,
  HOME
} from './lib/constants.js'

/**
 * Wraps the quad hack farm target action, allowing you to call it from the command line
 * args[0] is the target and is required
 * args[1] is the maximum number of threads, default to all available
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE, GROW_REMOTE_FILE, HACK_REMOTE_FILE)

  await aquireLockAsync(ns)
  const nodes = getNodes(ns)
  let threads = getAvailableThreads(ns, nodes, remoteRam)

  if (ns.args[1] && ns.args[1] < threads) {
    threads = ns.args[1]
  }

  quadHackFarmTarget(ns, ns.args[0], threads)
  await releaseLockAsync(ns)
}

/**
 * Quad hack farms the target
 *
 * @param {NS} ns NS
 * @param target the target to quad hack farm
 * @param threads the maximum number of threads to utilize
 * @returns The arguments of the quad hack farm daemon launched to supervise this action
 */
export function quadHackFarmTarget (ns, target, threads) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (threads === undefined) {
    throw new GuardError('maxThreads is required')
  }

  // Each farm type needs a seperate daemon, cause that is where the course correction math happens
  const daemonFilename = '/daemons/quadHackFarmDaemonAsync.js'
  if (!ns.fileExists(daemonFilename)) {
    throw new FileNotFoundError("Couldn't find daemon file " + daemonFilename)
  }

  ns.tprint('Quad hack farming ', target, ' with ', threads, ' threads')

  const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE, GROW_REMOTE_FILE, HACK_REMOTE_FILE)
  const farmCalculation = calculateQuadHackFarm(ns, target, threads)

  ns.tprint('Excepted income is ', ns.nFormat(farmCalculation.moneyPerSecond, '0.000a'),
    '/s and expected cycle time is ', ns.tFormat(farmCalculation.cycleTime))

  // Launch remotes
  const remotes = [
    {
      name: GROW_REMOTE_FILE,
      threads: farmCalculation.growThreads,
      args: [FARM_PORT, target, 0, 'grow']
    },
    {
      name: WEAKEN_REMOTE_FILE,
      threads: farmCalculation.weakenThreads,
      args: [FARM_PORT, target, 0, 'weaken']
    },
    {
      name: HACK_REMOTE_FILE,
      threads: farmCalculation.hackThreads,
      args: [FARM_PORT, target, 0, 'hack', 4]
    }
  ]
  // batchRemotes(ns, remotes, remoteRam)

  // Launch daemon
  ns.tprint('Launching daemon')
  const daemonArgs = [daemonFilename, HOME, 1, target, farmCalculation.hackThreads]
  // ns.exec(...daemonArgs)
  return daemonArgs
}
