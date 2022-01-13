/** @param {NS} ns */

import { getNodes } from './nodes/getNodes.js'
import { getTargetInfo } from './lib/getTargetInfo.js'
import { weakenSecurityPower, home } from './lib/constants.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { weakenTarget } from './actions/weakenTarget.js'

/**
 * Weakens all servers starting from the fastest to weaken.
 *
 * @param ns NS
 */
export async function main (ns) {
  const weakenList = []
  const weakenRemote = '/remotes/weaken.js'
  const nodes = getNodes(ns)
  for (const node in nodes) {
    if (nodes[node].maxMoney > 0) {
      weakenList.push(getTargetInfo(ns, node))
    }
  }

  const remoteRam = ns.getScriptRam(weakenRemote, home)

  weakenList.sort((lhv, rhv) => { return lhv.weakenTime - rhv.weakenTime })

  let threadCount = getAvailableThreads(ns, nodes, remoteRam)
  ns.tprint(remoteRam)
  ns.tprint(threadCount)

  for (const nodeToWeaken of weakenList) {
    if (nodeToWeaken.currentSecurity !== nodeToWeaken.minSecurity) {
      const requiredThreads = Math.ceil((nodeToWeaken.currentSecurity - nodeToWeaken.minSecurity) / weakenSecurityPower)

      if (requiredThreads <= threadCount) {
        threadCount = threadCount - requiredThreads
        await weakenTarget(ns, nodes, nodeToWeaken.name, requiredThreads)
      } else {
        break
      }
    }
  }
}
