import { GuardError } from './errors/GuardError.js'

import { getNodes } from './lib/getNodes.js'
import { getRemoteRam } from './lib/getRemoteRam.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { aquireLockAsync } from './lib/aquireLockAsync.js'
import { releaseLockAsync } from './lib/releaseLockAsync.js'

import { stopFarmsAsync } from './actions/stopFarmsAsync.js'
import { updateNodesAsync } from './actions/updateNodesAsync.js'
import { buyServer } from './actions/buyServer.js'
import { scpRemotesAsync } from './actions/scpRemotesAsync.js'

import { farmAsync } from './farmAsync.js'

import { hiscore } from './hiscore.js'

import {
  WEAKEN_REMOTE_FILE,
  GROW_REMOTE_FILE,
  HACK_REMOTE_FILE,
  HOME
} from './lib/constants.js'

/**
 * Maxes out on max ram purchased servers, even deleting non max servers to do this
 *
 * @param {NS} ns NS
 */
export async function goalSevenAsync (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  const maxServerRam = ns.getPurchasedServerMaxRam()
  const largestServerPrice = ns.getPurchasedServerCost(maxServerRam)

  while (true) {
    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
      if (ns.getServerMoneyAvailable(HOME) > largestServerPrice) {
        buyServer(ns, largestServerPrice)
        await updateNodesAsync(ns)
        await scpRemotesAsync(ns)
      } else {
      // Start a farm
        await aquireLockAsync(ns)
        const nodes = getNodes(ns)
        const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE, GROW_REMOTE_FILE, HACK_REMOTE_FILE)
        const threads = getAvailableThreads(ns, nodes, remoteRam)

        // Targeting
        // Out of the top 10, pick the method that has the shortest cycle time.
        const score = hiscore(ns, nodes, threads)
        score.splice(10, score.length - 10)
        score.sort((lhv, rhv) => lhv.cycleTime - rhv.cycleTime)

        ns.tprint('Farming ', score[0].name, ' with ', score[0].farmType, '. Expected income is ',
          ns.nFormat(score[0].moneyPerSecond, '0.000a'), '/s and cycle time is ', ns.tFormat(score[0].cycleTime))

        await farmAsync(ns, score[0].name, threads)
        await releaseLockAsync(ns)

        ns.tprint('Waiting for you to have enough money to a max server costing ', ns.nFormat(largestServerPrice, '0.000a'))
        while (ns.getServerMoneyAvailable(HOME) < largestServerPrice) {
          await ns.asleep(10)
        }
        await stopFarmsAsync(ns)
      }
    }

    const purchasedServerList = ns.getPurchasedServers()
    let lowestRamServer
    let lowestRam = maxServerRam
    for (const purchasedServer of purchasedServerList) {
      if (ns.getServerMaxRam(purchasedServer) < lowestRam) {
        lowestRam = ns.getServerMaxRam(purchasedServer)
        lowestRamServer = purchasedServer
      }
    }

    if (lowestRam < maxServerRam) {
      ns.tprint('Deleting server ', lowestRamServer, ' with ', lowestRam, ' ram')
      ns.deleteServer(lowestRamServer)
      await updateNodesAsync(ns)
    } else {
      ns.tprint('Purchased servers are maxed, goal seven is complete at ', ns.tFormat(ns.getTimeSinceLastAug()))
      return
    }
  }
}

/**
 * Wrapper
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  await goalSevenAsync(ns)
}
