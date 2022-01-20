export class ServerPurchaseError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ServerPurchaseError'
  }

  get stack () {
    return this.stack.substring(this.stack.lastIndexOf('\n') + 1, -1)
  }
}
