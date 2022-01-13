/** @param {NS} ns */

import { getAvailableThreads } from './lib/getAvailableThreads.js'

/**
 * Annouces what action is being performed and how many threads are performing it.
 *
 * @param ns NS
 * @param nodes nodes object
 * @param verb The verb of the action being performed
 * @param target The target the action is being performed on
 * @param requestedThreads The number of threads the action is requesting, falsy means all available
 * @param remoteRam The amount of RAM the remote performing this action consume per thread
 * @returns {number} The number of threads that are granted to perform the action
 */
export function threadAnnouce (ns, nodes, verb, target, requestedThreads, remoteRam) {
  const availableThreads = getAvailableThreads(ns, nodes, remoteRam)

  if (!requestedThreads) {
    ns.tprint(verb, ' target ', target, ' with up to all available threads ', availableThreads)
    ns.print(verb, ' target ', target, ' with up to all available threads ', availableThreads)
    return availableThreads
  } else if (requestedThreads > availableThreads) {
    ns.tprint('Insufficent threads to fufil request. ', verb, ' target ', target, ' with up to all remaining threads ', availableThreads)
    ns.print('Insufficent threads to fufil request. ', verb, ' target ', target, ' with up to all remaining threads ', availableThreads)
    return availableThreads
  } else {
    ns.tprint(verb, ' target ', target, ' with up to ', requestedThreads, ' threads')
    ns.print(verb, ' target ', target, ' with up to ', requestedThreads, ' threads')
    return requestedThreads
  }
}
