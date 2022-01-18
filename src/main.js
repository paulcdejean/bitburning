import { waitForExecAsync } from './lib/waitForExecAsync.js'

import { initPortsAsync } from './actions/initPortsAsync.js'
import { updateNodesAsync } from './actions/updateNodesAsync.js'
import { scpRemotesAsync } from './actions/scpRemotesAsync.js'

import {
  HOME
} from './lib/constants.js'

/**
 * LETS GO!
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  ns.disableLog('disableLog')
  await updateNodesAsync(ns)
  await initPortsAsync(ns)
  await scpRemotesAsync(ns)

  await waitForExecAsync(ns, ns.exec('/goals/goalOneAsync.js', HOME))
  // await waitForExecAsync(ns, ns.exec('/goals/goalTwoAsync.js', HOME))
  // await waitForExecAsync(ns, ns.exec('/goals/goalThreeAsync.js', HOME))
  // await waitForExecAsync(ns, ns.exec('/goals/goalFourAsync.js', HOME))
  // await waitForExecAsync(ns, ns.exec('/goals/goalFiveAsync.js', HOME))
  // await waitForExecAsync(ns, ns.exec('/goals/goalSixAsync.js', HOME))

  ns.disableLog('asleep')
  ns.tprint('All goals completed!')
}
