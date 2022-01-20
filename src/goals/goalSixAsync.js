
import { GuardError } from './errors/GuardError.js'

import { getNodes } from './lib/getNodes.js'
import { getRemoteRam } from './lib/getRemoteRam.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { aquireLockAsync } from './lib/aquireLockAsync.js'
import { releaseLockAsync } from './lib/releaseLockAsync.js'

import { stopFarmsAsync } from './actions/stopFarmsAsync.js'
import { updateNodesAsync } from './actions/updateNodesAsync.js'
import { buyServer } from './actions/buyServer.js'

import { farmAsync } from './farmAsync.js'

import { hiscore } from './hiscore.js'

import {
  WEAKEN_REMOTE_FILE,
  GROW_REMOTE_FILE,
  HACK_REMOTE_FILE,
  HOME
} from './lib/constants.js'

/**
 * Buys more and more expensive servers until it buys a max server maxes server count
 *
 * @param {NS} ns NS
 */
export async function goalSixAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  const largestServerPrice = ns.getPurchasedServerCost(ns.getPurchasedServerMaxRam())

  // Buy a server about as expensive as SQLInject.exe
  let serverMaxCost = 250000000

  while (true) {
    if (ns.getServerMoneyAvailable(HOME) < serverMaxCost) {
      // Start a farm
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

      ns.tprint('Waiting for you to have enough money to buy server costing at most ', ns.nFormat(serverMaxCost, '0.000a'))
      while (ns.getServerMoneyAvailable(HOME) < serverMaxCost) {
        await ns.asleep(10)
      }
      await stopFarmsAsync(ns)
    }

    buyServer(ns, serverMaxCost)
    await updateNodesAsync(ns)

    if (serverMaxCost > largestServerPrice) {
      ns.tprint('Sucessfully purchased a max server, goal is complete')
      return
    }

    if (ns.getPurchasedServers().length === ns.getPurchasedServerLimit()) {
      ns.tprint('Max out purchased servers, goal is complete')
      return
    }

    serverMaxCost = serverMaxCost * 2
  }
}

/**
 * Wrapper
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  await goalSixAsync(ns)
}
