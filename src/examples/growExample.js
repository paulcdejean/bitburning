/** @param {NS} ns */

/**
 * Fiddling with growPercent from the formulas API
 *
 * @param ns NS
 */
export async function main (ns) {
  const server = ns.getServer(ns.args[0])
  const player = ns.getPlayer()

  let result

  ns.tprint('Minimum security level is ', server.minDifficulty)

  result = ns.formulas.hacking.growPercent(server, 1, player)
  ns.tprint('Security level: ', server.hackDifficulty)
  ns.tprint('Grow percent: ', result)
  ns.tprint('Double threads: ', Math.log(2) / Math.log(result))

  server.hackDifficulty = server.hackDifficulty + 1
  result = ns.formulas.hacking.growPercent(server, 1, player)
  ns.tprint('Security level: ', server.hackDifficulty)
  ns.tprint('Grow percent: ', result)
  ns.tprint('Double threads: ', Math.log(2) / Math.log(result))

  server.hackDifficulty = server.hackDifficulty + 1
  result = ns.formulas.hacking.growPercent(server, 1, player)
  ns.tprint('Security level: ', server.hackDifficulty)
  ns.tprint('Grow percent: ', result)
  ns.tprint('Double threads: ', Math.log(2) / Math.log(result))

  server.hackDifficulty = server.hackDifficulty + 1
  result = ns.formulas.hacking.growPercent(server, 1, player)
  ns.tprint('Security level: ', server.hackDifficulty)
  ns.tprint('Grow percent: ', result)
  ns.tprint('Double threads: ', Math.log(2) / Math.log(result))

  server.hackDifficulty = server.hackDifficulty + 1
  result = ns.formulas.hacking.growPercent(server, 1, player)
  ns.tprint('Security level: ', server.hackDifficulty)
  ns.tprint('Grow percent: ', result)
  ns.tprint('Double threads: ', Math.log(2) / Math.log(result))

  server.hackDifficulty = server.hackDifficulty + 1
  result = ns.formulas.hacking.growPercent(server, 1, player)
  ns.tprint('Security level: ', server.hackDifficulty)
  ns.tprint('Grow percent: ', result)
  ns.tprint('Double threads: ', Math.log(2) / Math.log(result))

  server.hackDifficulty = 1
  result = ns.formulas.hacking.growPercent(server, 1, player)
  ns.tprint('Security level: ', server.hackDifficulty)
  ns.tprint('Grow percent: ', result)
  ns.tprint('Double threads: ', Math.log(2) / Math.log(result))
}

// var server = getServer("n00dles")
// var player = getPlayer()

// server["hackDifficulty"] = 1
// var currentWeakenTime = formulas.hacking.weakenTime(server, player)
// tprint(currentWeakenTime)
// server["hackDifficulty"] = 2
// currentWeakenTime = formulas.hacking.weakenTime(server, player)
// tprint(currentWeakenTime)
// server["hackDifficulty"] = 3
// currentWeakenTime = formulas.hacking.weakenTime(server, player)
// tprint(currentWeakenTime)
// server["hackDifficulty"] = 4
// currentWeakenTime = formulas.hacking.weakenTime(server, player)
// tprint(currentWeakenTime)
// server["hackDifficulty"] = 5
// currentWeakenTime = formulas.hacking.weakenTime(server, player)
// tprint(currentWeakenTime)

// player["hacking"] = 1

// server["hackDifficulty"] = 1
// var currentWeakenTime = formulas.hacking.weakenTime(server, player)
// tprint(currentWeakenTime)
// server["hackDifficulty"] = 2
// currentWeakenTime = formulas.hacking.weakenTime(server, player)
// tprint(currentWeakenTime)
// server["hackDifficulty"] = 3
// currentWeakenTime = formulas.hacking.weakenTime(server, player)
// tprint(currentWeakenTime)
// server["hackDifficulty"] = 4
// currentWeakenTime = formulas.hacking.weakenTime(server, player)
// tprint(currentWeakenTime)
// server["hackDifficulty"] = 5
// currentWeakenTime = formulas.hacking.weakenTime(server, player)
// tprint(currentWeakenTime)
