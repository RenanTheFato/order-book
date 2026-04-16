export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class InvalidOperationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}
