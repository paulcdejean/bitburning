
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
 * Farms enough to buy SQLInject.exe
 *
 * @param {NS} ns NS
 */
export async function goalFiveAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  // There's an AUG that allows you to start with this program
  if (ns.fileExists('SQLInject.exe')) {
    ns.tprint('SQLInject.exe detected, skipping goal!')
    return
  }

  if (ns.getServerMoneyAvailable(HOME) < 250000000) {
    await aquireLockAsync(ns)
    const nodes = getNodes(ns)
    const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE, GROW_REMOTE_FILE, HACK_REMOTE_FILE)
    const threads = getAvailableThreads(ns, nodes, remoteRam)

    // Targeting
    // Just pick the best one this time...
    const score = hiscore(ns, nodes, threads)

    ns.tprint('Farming ', score[0].name, ' with ', score[0].farmType, '. Expected income is ',
      ns.nFormat(score[0].moneyPerSecond, '0.000a'), '/s and cycle time is ', ns.tFormat(score[0].cycleTime))

    await farmAsync(ns, score[0].name, threads)
    await releaseLockAsync(ns)

    ns.tprint('Waiting for you to have enough money to buy SQLInject.exe')
    while (ns.getServerMoneyAvailable(HOME) < 250000000) {
      await ns.asleep(10)
    }

    await stopFarmsAsync(ns)
  }

  ns.tprint('Waiting for you to buy SQLInject.exe, you should have enough')
  while (!ns.fileExists('SQLInject.exe')) {
    await ns.asleep(1000)
  }
  ns.tprint('Thanks for buying SQLInject.exe updating nodes')
  await updateNodesAsync(ns)
  ns.tprint('Goal 5 is completed at ', ns.tFormat(ns.getTimeSinceLastAug()))
}

/**
 * Wrapper
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  await goalFiveAsync(ns)
}
