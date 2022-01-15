/** @param {NS} ns */

import { GuardError } from './errors/GuardError.js'

import {
  aquireLock,
  releaseLock
} from './lib/lib.js'

/**
 * Wrap noodleHack allowing the action to be called directly
 *
 * @param ns NS
 */
export async function main (ns) {
  await NoodleHack()
}

/**
 * Hack n00dles
 *
 * @param ns NS
 */
export async function NoodleHack (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  await aquireLock(ns)
  await ns.hack('n00dles')
  await releaseLock(ns)
}
