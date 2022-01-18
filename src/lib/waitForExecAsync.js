import { GuardError } from './errors/GuardError.js'

/**
 * Pauses execution until the script with the provided PID finishes
 *
 * @param {NS} ns NS
 * @param pid The pid of the script to wait to finish
 */
export async function waitForExecAsync (ns, pid) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (pid === undefined) {
    throw new GuardError('pid is required')
  }

  ns.disableLog('asleep')

  while (ns.isRunning(pid)) {
    await ns.asleep(1000)
  }
}
