import { GuardError } from './errors/GuardError.js'

/**
 * Calculates the number of cycles it will take to grow a target to max money
 *
 * @param {NS} ns NS
 * @param target the target to calculate against
 * @param threads the threads used to determine the number of grow cycles required
 * @returns the number of cycles required
 */
export function calculateGrowCycles (ns, target, threads) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (target === undefined) {
    throw new GuardError('target is required')
  }
  if (threads === undefined) {
    throw new GuardError('threads is required')
  }

  const growthNeeded = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target)
  const cycleCount = Math.ceil(ns.growthAnalyze(target, growthNeeded) / threads)
  return cycleCount
}
