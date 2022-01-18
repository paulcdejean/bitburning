import { GuardError } from './errors/GuardError.js'

import { getTargetInfo } from './lib/getTargetInfo.js'
import { waitForDaemonAsync } from './lib/waitForDaemonAsync.js'

import { weakenTarget } from './actions/weakenTarget.js'
import { growTarget } from './actions/growTarget.js'
import { quadHackFarmTargetAsync } from './actions/quadHackFarmTargetAsync.js'

/**
 * Wraps quadHack allowing it to be called from the command line
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  await quadHackAsync(ns, ns.args[0], ns.args[1])
}

/**
 * Farms the target using a single batch quad hack method.
 *
 * @param {NS} ns NS
 * @param target The target to quadhack farm
 * @param threads The number of threads to quadhack with
 */
export async function quadHackAsync (ns, target, threads) {
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
    await waitForDaemonAsync(ns, await weakenTarget(ns, target, threads))
  } else {
    ns.tprint(target, ' is already at minimum secrutiy')
  }

  if (info.currentMoney !== info.maxMoney) {
    await waitForDaemonAsync(ns, await growTarget(ns, target, threads))
  } else {
    ns.tprint(target, ' is already at maximum money')
  }

  await quadHackFarmTargetAsync(ns, target, threads)
}
