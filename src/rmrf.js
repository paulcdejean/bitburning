/** @param {NS} ns */

/**
 * Delete all files on home.
 *
 * @param ns NS
 */
export async function main (ns) {
  const files = ns.ls('home')
  for (const file in files) {
    if (files[file].substring(files[file].length - 4) !== '.exe') {
      ns.rm(files[file], 'home')
    }
  }
}
