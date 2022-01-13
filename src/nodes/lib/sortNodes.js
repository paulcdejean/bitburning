/** @param {NS} ns */

/**
 * YES this is a thing. Due to a race condition we want to split up grows as little as possible.
 * To faciliate this we sort all our nodes from most RAM to least
 *
 * @param ns NS
 * @param nodes nodes object
 * @returns a shorted nodes object
 */
export function sortNodes (ns, nodes) {
  const nodeRamList = []
  const sortedNodes = {}

  for (const node in nodes) {
    nodeRamList.push({
      name: node,
      ram: nodes[node].ram
    })
  }

  nodeRamList.sort((lhv, rhv) => { return rhv.ram - lhv.ram })

  for (const ramEntry of nodeRamList) {
    sortedNodes[ramEntry.name] = nodes[ramEntry.name]
  }

  return sortedNodes
}
