import { GuardError } from './errors/GuardError.js'

import { calculateQuadHackBatch } from './lib/calculateQuadHackBatch.js'

import {
  DEFAULT_CYCLE_BUFFER,
  DEFAULT_OPS_BUFFER
} from './lib/constants.js'

/**
 * Calculates the profitability, number of threads and cycle time, for the quad hack farm method.
 * If run with non minimum security gives a very rough guesstimate.
 *
 * @param {NS} ns NS
 * @param target The target to calculate quad hack farm stats for
 * @param threads The number of threads to calculate the farm for
 * @param opsBuffer The amount to of padding between the hack grow and weaken
 * @param cycleBuffer The amount to wait after weaken lands, before calculating the cycle
 * @returns An object detailing all the info needed to farm the target
 */
export function calculateQuadHackFarm (ns, target, threads, opsBuffer = DEFAULT_OPS_BUFFER, cycleBuffer = DEFAULT_CYCLE_BUFFER) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (threads === undefined) {
    throw new GuardError('threads is required')
  }

  // Just a single batch, with 4 hacks per thread
  return calculateQuadHackBatch(ns, target, threads, 4, opsBuffer, cycleBuffer)
}
