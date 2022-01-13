/** @param {NS} ns */

/**
 * tprint current values of ports
 *
 * @param ns NS
 * @param daemonArgs
 */
export async function waitFor (ns, daemonArgs) {
  // Wrap around an action that launches a daemon, to wait for the daemon's completion
  ns.disableLog('sleep')
  ns.tprint('Waiting for completion of ', daemonArgs[0], ' on ', daemonArgs[1])
  ns.print('Waiting for completion of ', daemonArgs[0], ' on ', daemonArgs[1])
  while (ns.scriptRunning(...daemonArgs)) {
    await ns.asleep(1000)
  }
}
