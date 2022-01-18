import { GuardError } from './errors/GuardError.js'

/**
 * Farms the best target using the best method.
 *
 * @param ns NS
 * @param farmScore An object that consists of a farm type, target and some other info
 */
export function best (ns, farmScore) {
  if (ns === undefined) {
    throw new GuardError('ns is required')
  }
  if (farmScore === undefined) {
    throw new GuardError('farmScore is required')
  }
}
