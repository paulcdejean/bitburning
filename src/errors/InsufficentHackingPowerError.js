export class InsufficentHackingPowerError extends Error {
  constructor (message) {
    super(message)
    this.name = 'InsufficentHackingPowerError'
  }

  get stack () {
    return this.stack.substring(this.stack.lastIndexOf('\n') + 1, -1)
  }
}
