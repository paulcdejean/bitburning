import { GuardError } from './errors/GuardError.js'

import { getTargetInfo } from './lib/getTargetInfo.js'
import { waitForDaemonAsync } from './lib/waitForDaemonAsync.js'
import { getRemoteRam } from './lib/getRemoteRam.js'
import { aquireLockAsync } from './lib/aquireLockAsync.js'
import { releaseLockAsync } from './lib/releaseLockAsync.js'
import { getNodes } from './lib/getNodes.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { calculateQuadHackFarm } from './lib/calculateQuadHackFarm.js'
import { calculateHWGWFarm } from './lib/calculateHWGWFarm.js'

import { weakenTarget } from './actions/weakenTarget.js'
import { growTarget } from './actions/growTarget.js'
import { quadHackFarmTarget } from './actions/quadHackFarmTarget.js'
import { hwgwFarmTarget } from './actions/hwgwFarmTarget.js'

import {
  HACK_REMOTE_FILE,
  WEAKEN_REMOTE_FILE,
  GROW_REMOTE_FILE,
  MAX_MONEY_ALLOWANCE
} from './lib/constants.js'

/**
 * Wraps farm allowing it to be called from the command line
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

  await farmAsync(ns, ns.args[0], threads)
  await releaseLockAsync(ns)
}

/**
 * Farms the target using the best calculated method
 *
 * @param {NS} ns NS
 * @param target The target to quadhack farm
 * @param threads The number of threads to quadhack with
 */
export async function farmAsync (ns, target, threads) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (threads === undefined) {
    throw new GuardError('threads is required')
  }
  const info = getTargetInfo(ns, target)

  if (info.currentSecurity !== info.minSecurity) {
    await waitForDaemonAsync(ns, weakenTarget(ns, target, threads))
  } else {
    ns.tprint(target, ' is already at minimum secrutiy')
  }

  if (info.currentMoney < info.maxMoney * MAX_MONEY_ALLOWANCE) {
    await waitForDaemonAsync(ns, growTarget(ns, target, threads))
  } else {
    ns.tprint(target, ' is already at maximum money')
  }

  const farms = []
  farms.push(calculateQuadHackFarm(ns, target, threads))
  farms.push(calculateHWGWFarm(ns, target, threads))

  farms.sort((lhv, rhv) => rhv.moneyPerSecond - lhv.moneyPerSecond)

  if (farms[0].type === 'QUAD') {
    quadHackFarmTarget(ns, target, threads)
  } else if (farms[0].type === 'HWGW') {
    hwgwFarmTarget(ns, target, threads)
  } else {
    ns.tprint('ERROR: Unknown farming type')
  }
}
