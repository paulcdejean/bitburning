import { GuardError } from './errors/GuardError.js'
import { MissingNodeListError } from './errors/MissingNodeListError.js'

import { NODE_LIST_FILE } from './lib/nodes/constants.js'

/**
 * Gets the nodes list from the nodes list file
 *
 * @param ns NS
 * @returns nodes object
 */
export function getNodes (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (ns.fileExists(NODE_LIST_FILE)) {
    const nodeList = JSON.parse(ns.read(NODE_LIST_FILE))
    return nodeList
  } else {
    throw new MissingNodeListError('node list not found, fix with: run actions/updateNodesAsync.js')
  }
}
