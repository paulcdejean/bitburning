export class GuardError extends Error {
  constructor (message) {
    super(message)
    this.name = 'GuardError'
  }

  get stack () {
    return this.stack.substring(this.stack.lastIndexOf('\n') + 1, -1)
  }
}
