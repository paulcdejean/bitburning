import { GuardError } from './errors/GuardError.js'

import {
  NULL_PORT_DATA
} from './lib/constants.js'

/**
 * Grabs the port and updates it with new data for a specific target
 *
 * @param ns NS
 * @param port the port to update
 * @param target the target to update data for
 * @param data the data we're upserting to the port+target
 */
export async function updateTargetPortDataAsync (ns, port, target, data) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (port === undefined) {
    throw new GuardError('port is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (data === undefined) {
    throw new GuardError('data is required')
  }

  // Grab the port data
  let portString = ns.readPort(port)
  while (portString === NULL_PORT_DATA) {
    await ns.asleep(1)
    portString = ns.readPort(port)
  }
  const portData = JSON.parse(portString)

  // New cycle data for the target
  portData[target] = data
  // Put the port data back
  await ns.writePort(port, JSON.stringify(portData))
}
