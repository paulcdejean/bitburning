export class MinSecurityRequiredError extends Error {
  constructor (message) {
    super(message)
    this.name = 'MinSecurityRequired'
  }

  get stack () {
    return this.stack.substring(this.stack.lastIndexOf('\n') + 1, -1)
  }
}
