export class FileNotFoundError extends Error {
  constructor (message) {
    super(message)
    this.name = 'FileNotFound'
  }

  get stack () {
    return this.stack.substring(this.stack.lastIndexOf('\n') + 1, -1)
  }
}
