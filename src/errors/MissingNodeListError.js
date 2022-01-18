export class MissingNodeListError extends Error {
  constructor (message) {
    super(message)
    this.name = 'MissingNodeListError'
  }

  get stack () {
    return this.stack.substring(this.stack.lastIndexOf('\n') + 1, -1)
  }
}
