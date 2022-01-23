/* eslint-disable bitburning/export-filename */

/**
 * Shares the thing
 *
 * @param {NS} ns NS
 */
export async function main (ns) {
  while (true) {
    await ns.share()
  }
}
