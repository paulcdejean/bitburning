/** @param {NS} ns */

/**
 * tprint current values of ports
 *
 * @param ns NS
 */
export async function main (ns) {
  for (let n = 1; n <= 7; n++) {
    ns.tprint('Port ', n, ': ', ns.peek(n))
  }
}
