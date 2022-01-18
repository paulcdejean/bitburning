import { GuardError } from './errors/GuardError.js'

/**
 * Wrap around an action that launches a daemon, to wait for the daemon's completion
 *
 * @param {NS} ns NS
 * @param daemonArgs The args of the daemon we'll wait for
 */
export async function waitForDaemonAsync (ns, daemonArgs) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (daemonArgs === undefined) {
    throw new GuardError('daemonArgs is required')
  }

  ns.disableLog('asleep')
  ns.tprint('Waiting for completion of ', daemonArgs[0], ' on ', daemonArgs[1])
  ns.print('Waiting for completion of ', daemonArgs[0], ' on ', daemonArgs[1])
  while (ns.isRunning(...daemonArgs)) {
    await ns.asleep(1000)
  }
}
