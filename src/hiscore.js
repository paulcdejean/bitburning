/** @param {NS} ns */
import { getNodes } from './nodes/getNodes.js'
import { getSingleHackFarmInfo } from './lib/getSingleHackFarmInfo.js'

/**
 * tprint current values of ports
 *
 * @param ns NS
 */
export async function main (ns) {
  const nodes = getNodes(ns)
  const results = []
  const tooHighLevel = []
  for (const node in nodes) {
    if (nodes[node].hackerLevel <= ns.getHackingLevel()) {
      if (nodes[node].maxMoney > 0) {
        const farmInfo = getSingleHackFarmInfo(ns, node)
        results.push({
          name: node,
          score: farmInfo.score,
          threads: farmInfo.totalThreads
        })
      }
    } else {
      tooHighLevel.push({ name: node, level: nodes[node].hackerLevel })
    }
  }

  tooHighLevel.sort((lhv, rhv) => { return lhv.level - rhv.level })
  results.sort((lhv, rhv) => { return rhv.score - lhv.score })
  for (const result of results) {
    ns.tprint(result.name, ' earns ', ns.nFormat(result.score, '0.000a'), ' per thread per second and supports ',
      result.threads, ' maximum threads and has weaken time ', ns.tFormat(ns.getWeakenTime(result.name)))
  }

  if (tooHighLevel.length > 0) {
    ns.tprint("The next target you'll be able to hack is ", tooHighLevel[0].name, ' at hacking level ', tooHighLevel[0].level)
  }
}
