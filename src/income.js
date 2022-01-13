/** @param {NS} ns */

import { milisecondsInASecond } from './lib/constants'

/**
 * tprint current income level
 *
 * @param ns NS
 */
export async function main (ns) {
  const scriptIncome = ns.getScriptIncome()
  const timeSinceAug = ns.getTimeSinceLastAug() / milisecondsInASecond
  ns.tprint('Current income: ', ns.nFormat(scriptIncome[0], '0.000a'))
  ns.tprint('Total hacking earnings: ', ns.nFormat(scriptIncome[1] * timeSinceAug, '0.000a'))
}
