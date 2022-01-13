/** @param {NS} ns */

import { nullPortData } from './lib/constants.js'

/**
 * Grabs the port and updates it with new data for a specific target
 *
 * @param ns NS
 * @param port the port to update
 * @param target the target to update data for
 * @param data the data we're upserting to the port+target
 */
export async function updateTargetPortData (ns, port, target, data) {
  // Grab the port data
  let portString = ns.readPort(port)
  while (portString === nullPortData) {
    await ns.asleep(1)
    portString = ns.readPort(port)
  }
  const portData = JSON.parse(portString)

  // New cycle data for the target
  portData[target] = data
  // Put the port data back
  await ns.writePort(port, JSON.stringify(portData))
}
