/* eslint-disable bitburning/export-filename */

import { MILLISECONDS_IN_A_SECOND } from './lib/constants.js'

/**
 * tprint current income level
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  const scriptIncome = ns.getScriptIncome()
  const timeSinceAug = ns.getTimeSinceLastAug() / MILLISECONDS_IN_A_SECOND
  ns.tprint('Current income: ', ns.nFormat(scriptIncome[0], '0.000a'))
  ns.tprint('Total hacking earnings: ', ns.nFormat(scriptIncome[1] * timeSinceAug, '0.000a'))
}
