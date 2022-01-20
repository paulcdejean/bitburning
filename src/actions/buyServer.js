import { GuardError } from './errors/GuardError.js'
import { ServerPurchaseError } from './errors/ServerPurchaseError.js'

/**
 * Buys the most expensive server that's cheaper than the maxPrice
 *
 * @param {NS} ns NS
 * @param maxPrice The maximum amount to pay for the server, defaults to Infinity
 */
export function buyServer (ns, maxPrice = Infinity) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (maxPrice < 110000) {
    throw new GuardError('maxPrice must be greater than 110k')
  }

  let serverRam = ns.getPurchasedServerMaxRam()

  while (ns.getPurchasedServerCost(serverRam) >= maxPrice) {
    serverRam = serverRam / 2
  }

  const purchaseResult = ns.purchaseServer('purchased', serverRam)

  if (purchaseResult === '') {
    throw new ServerPurchaseError('Failed to purchase server!')
  } else {
    ns.tprint('Purchased server ', purchaseResult, ' with ', serverRam, ' RAM')
  }
}

/**
 * wrapper
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  buyServer(ns, ns.args[0])
}
