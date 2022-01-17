import { GuardError } from './errors/GuardError.js'

/**
 * Wraps the rmrf function.
 *
 * @param ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  rmrf(ns)
}

/**
 * Delets all non .exe files from home.
 *
 * @param {NS} ns NS
 */
export function rmrf (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  const files = ns.ls('home')
  for (const file in files) {
    if (files[file].substring(files[file].length - 4) !== '.exe') {
      ns.rm(files[file], 'home')
    }
  }
}
