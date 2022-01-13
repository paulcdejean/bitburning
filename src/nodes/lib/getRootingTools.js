/** @param {NS} ns */

import { rootingTools } from './nodes/lib/constants.js'
import { home } from './lib/constants.js'

/**
 * Returns an array of all rooting tools the player has access to currently.
 *
 * @param ns NS
 * @returns an array of the filenames of all rooting tools the player has on their home machine.
 */
export function getRootingTools (ns) {
  const result = []
  for (const tool in rootingTools) {
    if (ns.fileExists(rootingTools[tool], home)) {
      result.push(rootingTools[tool])
    }
  }

  return result
}
