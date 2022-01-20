
import { GuardError } from './errors/GuardError.js'

import { getNodes } from './lib/getNodes.js'
import { getRemoteRam } from './lib/getRemoteRam.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { aquireLockAsync } from './lib/aquireLockAsync.js'
import { releaseLockAsync } from './lib/releaseLockAsync.js'

import { stopFarmsAsync } from './actions/stopFarmsAsync.js'
import { updateNodesAsync } from './actions/updateNodesAsync.js'

import { farmAsync } from './farmAsync.js'

import { hiscore } from './hiscore.js'

import {
  WEAKEN_REMOTE_FILE,
  GROW_REMOTE_FILE,
  HACK_REMOTE_FILE,
  HOME
} from './lib/constants.js'

/**
 * Farms enough to buy HTTPWorm.exe
 *
 * @param {NS} ns NS
 */
export async function goalFourAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  // There's an AUG that allows you to start with this program
  if (ns.fileExists('HTTPWorm.exe')) {
    ns.tprint('HTTPWorm.exe detected, skipping goal!')
    return
  }

  if (ns.getServerMoneyAvailable(HOME) < 30000000) {
    await aquireLockAsync(ns)
    const nodes = getNodes(ns)
    const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE, GROW_REMOTE_FILE, HACK_REMOTE_FILE)
    const threads = getAvailableThreads(ns, nodes, remoteRam)

    // Targeting
    // Out of the top 5, pick the method that has the shortest cycle time.
    const score = hiscore(ns, nodes, threads)
    score.splice(5, score.length - 5)
    score.sort((lhv, rhv) => lhv.cycleTime - rhv.cycleTime)

    ns.tprint('Farming ', score[0].name, ' with ', score[0].farmType, '. Expected income is ',
      ns.nFormat(score[0].moneyPerSecond, '0.000a'), '/s and cycle time is ', ns.tFormat(score[0].cycleTime))

    await farmAsync(ns, score[0].name, threads)
    await releaseLockAsync(ns)

    ns.tprint('Waiting for you to have enough money to buy HTTPWorm.exe')
    while (ns.getServerMoneyAvailable(HOME) < 30000000) {
      await ns.asleep(10)
    }

    await stopFarmsAsync(ns)
  }

  ns.tprint('Waiting for you to buy HTTPWorm.exe, you should have enough')
  while (!ns.fileExists('HTTPWorm.exe')) {
    await ns.asleep(1000)
  }
  ns.tprint('Thanks for buying HTTPWorm.exe updating nodes')
  await updateNodesAsync(ns)
  ns.tprint('Goal 4 is completed')
}

/**
 * Wrapper
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  await goalFourAsync(ns)
}
