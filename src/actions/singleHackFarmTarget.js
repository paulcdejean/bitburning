/** @param {NS} ns */

import { aquireLock } from './lib/aquireLock.js'
import { releaseLock } from './lib/releaseLock.js'
import { singleHackFarmPort, home } from './lib/constants.js'
import { getSingleHackFarmInfo } from './lib/getSingleHackFarmInfo.js'
import { getTargetInfo } from './lib/getTargetInfo.js'

import { getNodes } from './nodes/getNodes.js'

import { threadAnnouce } from './actions/lib/threadAnnouce.js'
import { getRemoteRam } from './actions/lib/getRemoteRam.js'
import { batchRemotes } from './actions/lib/batchRemotes.js'

/*
Single hack farming works like this:
Firstly weakening is done in a single batch.
Then hacking and growing is batched, so it looks like so, with W being when weaken starts and ends:
W   Hack        W
W    Grow       W
W     Hack      W
W      Grow     W
W       Hack    W
W        Grow   W

The advantage of single hack farming is firstly that it's simplier.
Secondly there's a small gap between the batches, due to each one having only two operations, allowing you to fit more batches in a cycle.
Thirdly there's no operations that are run after other operations without recalculation, so it's very consistent.

The disadvantages are that there's a lot of idle time on the hacking remotes, which seems inefficent.
*/

/**
 * Wraps singleHackFarmTarget allowing you to call this action from the command line
 *
 * @param ns NS
 */
export async function main (ns) {
  const nodes = getNodes(ns)
  await singleHackFarmTarget(ns, nodes, ns.args[0], ns.args[1])
}

/** @param {NS} ns */

/**
 * Raises your money!
 * Uses the single hack methodology which is described above.
 *
 * @param ns NS
 * @param nodes the nodes object
 * @param target the target to farm
 * @param requestedThreads the number of threads we want to farm the target with, falsy means all available
 */
export async function singleHackFarmTarget (ns, nodes, target, requestedThreads) {
  // Constants
  const verb = 'Single hack farming'
  const weakenRemote = '/remotes/weaken.js'
  const growRemote = '/remotes/grow.js'
  const hackRemote = '/remotes/hack.js'

  // Gather info on target
  const targetInfo = getTargetInfo(ns, target)
  const remoteRam = getRemoteRam(ns, weakenRemote, growRemote, hackRemote)

  // Sanity checks
  if (targetInfo.currentSecurity !== targetInfo.minSecurity) {
    ns.tprint('Target ', target, ' must be at minimum security before it can be farmed')
    return
  }
  if (targetInfo.currentMoney !== targetInfo.maxMoney) {
    ns.tprint('Target ', target, ' must be at maximum money before it can be farmed')
    return
  }

  // Annouce what you're doing and how many threads
  // await aquireLock(ns)
  const threads = threadAnnouce(ns, nodes, verb, target, requestedThreads, remoteRam)

  const farmInfo = getSingleHackFarmInfo(ns, target, threads)
  ns.tprint(farmInfo)

  return

  const remotes = []

  // It's important for grows to go LAST so they get the best servers
  // Weakens go first because there's no downside to them being split up
  // This is because things are scheduled started from the back of the array using pop
  let batch = 0
  remotes.push({
    name: weakenRemote,
    threads: farmInfo.weakenThreads,
    args: [singleHackFarmPort, target, 0]
  })
  while (batch < farmInfo.batches) {
    remotes.push({
      name: hackRemote,
      threads: farmInfo.batchHackThreads,
      args: [singleHackFarmPort, target, batch]
    })
    batch = batch + 1
  }
  batch = 0
  while (batch < farmInfo.batches) {
    remotes.push({
      name: growRemote,
      threads: farmInfo.batchGrowThreads,
      args: [singleHackFarmPort, target, batch]
    })
    batch = batch + 1
  }

  batchRemotes(ns, nodes, remotes, remoteRam)

  ns.tprint('Started daemon for single hack farming ', target, ' with ', farmInfo.totalThreads, ' threads')
  ns.tprint('Number of batches is ', farmInfo.batches, ' out of a maximum of ', farmInfo.maxBatches)
  ns.tprint('Expected income from ', target, ' is ', ns.nFormat(farmInfo.score * farmInfo.totalThreads, '0.000a'))

  ns.exec('/daemons/singleHackFarmDaemon.js', home, 1, target, farmInfo.batches)

  await releaseLock(ns)
}
