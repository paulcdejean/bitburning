import { GuardError } from './errors/GuardError.js'

import {
  aquireLockAsync,
  releaseLockAsync,
  getTargetInfo
} from './lib/lib.js'

/**
 * Wrap noodleHack allowing the action to be called directly
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  await noodlesAsync()
}

/**
 * Hack n00dles
 *
 * @param {NS} ns NS
 */
export async function noodlesAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  await aquireLockAsync(ns)
  ns.tprint(getTargetInfo('n00dles'))
  await ns.hack('n00dles')
  await releaseLockAsync(ns)
}
