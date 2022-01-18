import { GuardError } from './errors/GuardError.js'

import { getNodes } from './lib/getNodes.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { calculateQuadHackFarm } from './lib/calculateQuadHackFarm.js'

/**
 * Echos out information on what the best server for hacking is to the command line.
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }

  const nodes = getNodes(ns)
  const availableThreads = getAvailableThreads(ns, nodes, 1.75)

  const scoreArray = hiscore(ns, nodes, availableThreads)

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
    if (nodes[node].hackerLevel <= ns.getHackingLevel()) {
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
    }
  }

  result.sort((lhv, rhv) => rhv.moneyPerSecond - lhv.moneyPerSecond)

  return result
}
