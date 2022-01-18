import { GuardError } from './errors/GuardError.js'

/**
 * Quad hack farms the target TODO
 *
 * @param {NS} ns NS
 * @param target the target to quad hack farm
 * @param maxThreads the maximum number of threads to utilize
 */
export async function quadHackFarmTargetAsync (ns, target, maxThreads) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (maxThreads === undefined) {
    throw new GuardError('maxThreads is required')
  }
}
