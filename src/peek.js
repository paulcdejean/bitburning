import { GuardError } from './errors/GuardError.js'

/**
 * Wrapper
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  peek(ns)
}

/**
 * tprint port data
 *
 * @param {NS} ns NS
 */
export function peek (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  for (let n = 1; n <= 7; n++) {
    ns.tprint('Port ', n, ': ', ns.peek(n))
  }
}
