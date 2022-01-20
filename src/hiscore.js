import { GuardError } from './errors/GuardError.js'

import { getNodes } from './lib/getNodes.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { calculateQuadHackFarm } from './lib/calculateQuadHackFarm.js'
import { calculateHWGWFarm } from './lib/calculateHWGWFarm.js'
import { getRemoteRam } from './lib/getRemoteRam.js'

import {
  WEAKEN_REMOTE_FILE,
  GROW_REMOTE_FILE,
  HACK_REMOTE_FILE
} from './lib/constants.js'

/**
 * Echos out information on what the best server for hacking is to the command line.
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  const nodes = getNodes(ns)
  let threads = ns.args[0]
  if (!threads) {
    const remoteRam = getRemoteRam(ns, WEAKEN_REMOTE_FILE, GROW_REMOTE_FILE, HACK_REMOTE_FILE)
    threads = getAvailableThreads(ns, nodes, remoteRam)
  }

  ns.tprint('Available threads = ', threads)

  const scoreArray = hiscore(ns, nodes, threads)

  for (const score of scoreArray) {
    ns.tprint('Farm ', score.farmType, ' on ', score.name,
      ' earns ', ns.nFormat(score.moneyPerSecond, '0.000a'),
      '/s with cycle time ', ns.tFormat(score.cycleTime))
  }
}

/**
 * Returns an array of nodes you can hack along with a score for them.
 *
 * @param {NS} ns NS
 * @param nodes Nodes object
 * @param threads Number of threads to calculate scoring for. If called from the command line is all available threads.
 * @returns the following info about hackable nodes sorted. Money per second, cycle time, farming method.
 */
export function hiscore (ns, nodes, threads) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (nodes === undefined) {
    throw new GuardError('nodes is required')
  }
  if (threads === undefined) {
    throw new GuardError('threads is required')
  }
  const result = []

  for (const node in nodes) {
    if (nodes[node].hackerLevel <= ns.getHackingLevel() &&
        nodes[node].root &&
        nodes[node].maxMoney > 0
    ) {
      const quadHackResults = calculateQuadHackFarm(ns, node, threads)
      if (quadHackResults.moneyPerSecond > 0) {
        result.push({
          name: node,
          farmType: 'QUAD',
          moneyPerSecond: quadHackResults.moneyPerSecond,
          cycleTime: quadHackResults.cycleTime,
          threads: threads
        })
      }

      const hwgwFarmResults = calculateHWGWFarm(ns, node, threads)
      if (hwgwFarmResults.moneyPerSecond > 0) {
        result.push({
          name: node,
          farmType: 'HWGW',
          moneyPerSecond: hwgwFarmResults.moneyPerSecond,
          cycleTime: hwgwFarmResults.cycleTime,
          threads: threads
        })
      }
    }
  }

  result.sort((lhv, rhv) => rhv.moneyPerSecond - lhv.moneyPerSecond)

  return result
}
