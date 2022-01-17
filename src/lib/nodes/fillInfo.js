import { GuardError } from './errors/GuardError.js'

import { HOME } from './lib/constants.js'

/**
 * Fills out the following static info about the node:
 * RAM
 * Required hacker level
 * Open ports
 * Minimum security level
 * Maximum money
 *
 * @param ns NS
 * @param nodes nodes object
 */
export function fillInfo (ns, nodes) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (nodes === undefined) {
    throw new GuardError('nodes is required')
  }
  for (const node in nodes) {
    const serverInfo = ns.getServer(node)
    if (node === HOME) {
      nodes[node].ram = Math.max(serverInfo.maxRam - 256, 0)
    } else {
      nodes[node].ram = serverInfo.maxRam
    }

    nodes[node].hackerLevel = serverInfo.requiredHackingSkill
    nodes[node].minSecurity = serverInfo.minDifficulty
    nodes[node].requiredPorts = serverInfo.numOpenPortsRequired
    nodes[node].maxMoney = serverInfo.moneyMax
  }
}
