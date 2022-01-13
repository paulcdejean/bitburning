/** @param {NS} ns */

import { home } from './lib/constants.js'

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
  for (const node in nodes) {
    const serverInfo = ns.getServer(node)
    if (node === home) {
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
