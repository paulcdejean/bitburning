/** @param {NS} ns */

import { mathDebuggingEnabled, growSecurityPower, hackSecurityPower, weakenSecurityPower, home, singleHackFarmPort } from './lib/constants.js'
import { getGrowthAmount } from './lib/getGrowthAmount.js'
import { getAvailableThreads } from './lib/getAvailableThreads.js'
import { getTargetInfo } from './lib/getTargetInfo.js'
import { getNodes } from './nodes/getNodes.js'
import { getRemoteRam } from './actions/lib/getRemoteRam.js'
import { batchRemotes } from './actions/lib/batchRemotes.js'
import { growTarget } from './actions/growTarget.js'
import { weakenTarget } from './actions/weakenTarget.js'
import { initPorts } from './actions/initPorts.js'
import { scpRemotes } from './actions/scpRemotes.js'
import { waitFor } from './lib/waitFor.js'
import { updateNodes } from './nodes/updateNodes.js'

/**
 * Eat n00dles
 *
 * @param ns NS
 */
export async function main (ns) {
  const noodles = 'n00dles'

  const noodleInfo = getTargetInfo(ns, noodles)
  const nodes = getNodes(ns)

  await initPorts(ns)
  await updateNodes(ns, true)
  await scpRemotes(ns, nodes)

  if (noodleInfo.currentSecurity !== noodleInfo.minSecurity) {
    const daemonArgs = await weakenTarget(ns, nodes, noodles)
    await waitFor(ns, daemonArgs)
  }

  if (noodleInfo.currentMoney !== noodleInfo.maxMoney) {
    const daemonArgs = await growTarget(ns, nodes, noodles)
    ns.tprint(daemonArgs)
    await waitFor(ns, daemonArgs)
  }

  const weakenRemote = '/remotes/weaken.js'
  const growRemote = '/remotes/grow.js'
  const hackRemote = '/remotes/hack.js'

  const remoteRam = getRemoteRam(ns, weakenRemote, growRemote, hackRemote)

  // Gets grow percentage without the formulas API
  const growthRate = getGrowthAmount(ns, noodles)
  const hackRate = ns.hackAnalyze(noodles)
  const hackThreadsPerGrow = (1 - (1 / growthRate)) / hackRate
  const availableThreads = getAvailableThreads(ns, nodes, remoteRam)

  const growRatio = hackRate / ((growthRate - 1) + hackRate)
  const hackRatio = (growthRate - 1) / ((growthRate - 1) + hackRate)
  const growHackSecurity = (growSecurityPower * growRatio) + (hackSecurityPower * hackRatio)
  const weakenRatio = growHackSecurity / (weakenSecurityPower + growHackSecurity)
  const growHackRatio = weakenSecurityPower / (weakenSecurityPower + growHackSecurity)

  const growHackThreads = Math.floor(availableThreads * growHackRatio)
  const weakenThreads = Math.ceil(availableThreads * weakenRatio)
  const growThreads = Math.ceil(growHackThreads * growRatio)
  const hackThreads = Math.floor(growHackThreads * hackRatio)

  if (mathDebuggingEnabled) {
    ns.tprint('growthRate = ', growthRate)
    ns.tprint('hackRate = ', hackRate)
    ns.tprint('hackThreadsPerGrow = ', hackThreadsPerGrow)
    ns.tprint('availableThreads = ', availableThreads)
    ns.tprint('growRatio = ', growRatio)
    ns.tprint('hackRatio = ', hackRatio)
    ns.tprint('weakenRatio = ', weakenRatio)
    ns.tprint('weakenThreads = ', weakenThreads)
    ns.tprint('growHackThreads = ', growHackThreads)
    ns.tprint('growThreads = ', growThreads)
    ns.tprint('hackThreads = ', hackThreads)
  }

  const remotes = [
    {
      name: weakenRemote,
      threads: weakenThreads,
      args: [singleHackFarmPort, noodles, 0]
    },
    {
      name: growRemote,
      threads: growThreads,
      args: [singleHackFarmPort, noodles, 0]
    },
    {
      name: hackRemote,
      threads: hackThreads,
      args: [singleHackFarmPort, noodles, 0]
    }
  ]

  batchRemotes(ns, nodes, remotes, remoteRam)

  ns.exec('/daemons/singleHackFarmDaemon.js', home, 1, noodles, 1)
}
