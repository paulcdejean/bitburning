import { GuardError } from './errors/GuardError.js'

import { getTargetInfo } from './lib/getTargetInfo.js'
import { waitForDaemonAsync } from './lib/waitForDaemonAsync.js'

import { weakenTargetAsync } from './actions/weakenTargetAsync.js'
import { growTargetAsync } from './actions/growTargetAsync.js'
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
    await waitForDaemonAsync(await weakenTargetAsync(ns, target, threads))
  }

  if (info.currentMoney !== info.maxMoney) {
    await waitForDaemonAsync(await growTargetAsync(ns, target, threads))
  }

  await quadHackFarmTargetAsync(ns, target, threads)
}
