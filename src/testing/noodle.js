
import { GuardError } from './errors/GuardError.js'

import { calculateHWGWFarm } from './lib/calculateHWGWFarm.js'
import { calculateQuadHackFarm } from './lib/calculateQuadHackFarm.js'

/**
 * noodle
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  noodle(ns)
}

/**
 * noodle
 *
 * @param {NS} ns NS
 */
export function noodle (ns) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  let quadHackIncome = 0

  const target = ns.args[0]
  let hwgwFarm

  ns.tprint('Target = ', target)

  ns.tprint('Thread count = 132')
  hwgwFarm = calculateHWGWFarm(ns, target, 132)
  quadHackIncome = calculateQuadHackFarm(ns, target, 132, 4).moneyPerSecond
  ns.tprint('Quad hack has income ', ns.nFormat(quadHackIncome, '0.000a'))
  ns.tprint('HWGW farm has income ', ns.nFormat(hwgwFarm.moneyPerSecond, '0.000a'), ' and batch count ', hwgwFarm.batches)

  ns.tprint('Thread count = 276')
  hwgwFarm = calculateHWGWFarm(ns, target, 276)
  quadHackIncome = calculateQuadHackFarm(ns, target, 276, 4).moneyPerSecond
  ns.tprint('Quad hack has income ', ns.nFormat(quadHackIncome, '0.000a'))
  ns.tprint('HWGW farm has income ', ns.nFormat(hwgwFarm.moneyPerSecond, '0.000a'), ' and batch count ', hwgwFarm.batches)

  ns.tprint('Thread count = 576')
  hwgwFarm = calculateHWGWFarm(ns, target, 576)
  quadHackIncome = calculateQuadHackFarm(ns, target, 576, 4).moneyPerSecond
  ns.tprint('Quad hack has income ', ns.nFormat(quadHackIncome, '0.000a'))
  ns.tprint('HWGW farm has income ', ns.nFormat(hwgwFarm.moneyPerSecond, '0.000a'), ' and batch count ', hwgwFarm.batches)

  ns.tprint('Thread count = 5000')
  hwgwFarm = calculateHWGWFarm(ns, target, 5000)
  quadHackIncome = calculateQuadHackFarm(ns, target, 5000, 4).moneyPerSecond
  ns.tprint('Quad hack has income ', ns.nFormat(quadHackIncome, '0.000a'))
  ns.tprint('HWGW farm has income ', ns.nFormat(hwgwFarm.moneyPerSecond, '0.000a'), ' and batch count ', hwgwFarm.batches)
}
