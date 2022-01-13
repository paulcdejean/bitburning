/** @param {NS} ns */

/**
 * tprint current values of ports
 *
 * @param ns NS
 */
export async function main (ns) {
  ns.disableLog('asleep')
  ns.tail()
  while (true) {
    ns.commitCrime('mug')
    while (await ns.isBusy()) {
      await ns.asleep(1)
    }
  }
}
