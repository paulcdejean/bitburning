import { GuardError } from './errors/GuardError.js'

import { ROOTING_TOOLS } from './lib/nodes/constants.js'
import { HOME } from './lib/constants.js'

/**
 * Returns an array of all rooting tools the player has access to currently.
 *
 * @param ns NS
 * @returns an array of the filenames of all rooting tools the player has on their home machine.
 */
export function getRootingTools (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  const result = []
  for (const tool in ROOTING_TOOLS) {
    if (ns.fileExists(ROOTING_TOOLS[tool], HOME)) {
      result.push(ROOTING_TOOLS[tool])
    }
  }

  return result
}
