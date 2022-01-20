/* eslint-disable bitburning/export-filename */

/**
 * Hacks a target, is under the control of a daemon given by the daemonPort
 * Designed to run on remote machines, so shouldn't import libraries
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  // eslint-disable-next-line no-unused-vars
  const threads = ns.args[0]
  // const subBatchNumber = ns.args[1]
  const daemonPort = ns.args[2]
  const target = ns.args[3]
  const batch = ns.args[4]
  const operation = ns.args[5]
  const hackCount = ns.args[6]

  let portString
  let portData
  let cycle = 0

  ns.disableLog('disableLog')
  ns.disableLog('enableLog')

  while (true) {
    // Wait for the port to have the next cycle
    // Stop the remote if the operation is finished

    ns.disableLog('asleep')
    while (!(portData?.[target]?.cycle > cycle)) {
      portString = ns.peek(daemonPort)
      try {
        portData = JSON.parse(portString)
        if (portData?.[target]?.finished && cycle > 0) {
          return
        }
      } catch (e) {}
      await ns.asleep(0.1)
    }
    ns.enableLog('asleep')

    cycle = cycle + 1
    ns.print('Starting cycle ', cycle, ' on batch ', batch)

    const hackSleep = portData[target].batches[batch][operation]
    await ns.asleep(hackSleep)

    let hackNumber = 0
    while (hackNumber < hackCount) {
      hackNumber = hackNumber + 1
      await ns.hack(target)
      ns.tprint('Batch ', batch, ' hack #', hackNumber, ' ',
        threads, ' threads: ', ns.nFormat(ns.getServerMoneyAvailable(target), '0.000a'))
    }
  }
}
