
import { GuardError } from './errors/GuardError.js'

import { getNodes } from './lib/getNodes.js'
import { getRemoteRam } from './lib/getRemoteRam.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { aquireLockAsync } from './lib/aquireLockAsync.js'
import { releaseLockAsync } from './lib/releaseLockAsync.js'

import { quadHackAsync } from './farms/quadHackAsync.js'

import {
  WEAKEN_REMOTE_FILE,
  GROW_REMOTE_FILE,
  HACK_REMOTE_FILE
} from './lib/constants.js'

/**
 * Farms enough to buy the TOR router and BruteSSH.exe
 *
 * @param {NS} ns NS
 */
export async function goalOneAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  ns.tprint('Quad hack farming n00dles to for enough money to buy the tor router and BruteSSH.exe')

  await aquireLockAsync(ns)
  const nodes = getNodes(ns)
  const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE, GROW_REMOTE_FILE, HACK_REMOTE_FILE)
  const threads = getAvailableThreads(ns, nodes, remoteRam)
  await quadHackAsync(ns, 'n00dles', threads)
  await releaseLockAsync(ns)
}

/**
 * Wrapper
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  await goalOneAsync(ns)
}
