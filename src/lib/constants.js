export const HOME = 'home'

export const NULL_PORT_DATA = 'NULL PORT DATA'
export const UNLOCKED = 'UNLOCKED'
export const STOP_FARMS = 'STOP_FARMS'
export const FARMS_STOPPED = 'FARMS_STOPPED'
export const MILLISECONDS_IN_A_SECOND = 1000

export const LOCK_PORT = 1
export const WEAKEN_PORT = 2
export const GROW_PORT = 3
export const FARM_PORT = 4
export const FARM_STOP_PORT = 5

export const REMOTES_FOLDER = '/remotes/'

export const DEFAULT_SKIM_PERCENT = 0.5

export const MATH_DEBUGGING = false

export const DEFAULT_CYCLE_BUFFER = 200
export const DEFAULT_OPS_BUFFER = 50

export const WEAKEN_REMOTE_FILE = '/remotes/weaken.js'
export const GROW_REMOTE_FILE = '/remotes/grow.js'
export const HACK_REMOTE_FILE = '/remotes/hack.js'

// Money that is greater than 99% of max is considered the same as max
// This is so we don't regrow 1% all the time cause of level up drift
export const MAX_MONEY_ALLOWANCE = 0.99

// The number of times its safe to level up during a HWGW farm or something
export const SAFE_LEVELS_UP = 20

export const PURCHASED_PREFIX = 'purchased'
