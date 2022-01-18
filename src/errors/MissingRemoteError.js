export class MissingRemoteError extends Error {
  constructor (message) {
    super(message)
    this.name = 'MissingRemoteError'
  }

  get stack () {
    return this.stack.substring(this.stack.lastIndexOf('\n') + 1, -1)
  }
}
