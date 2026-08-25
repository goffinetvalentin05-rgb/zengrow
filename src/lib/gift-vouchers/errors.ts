export class GiftVoucherServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "GiftVoucherServiceError";
  }
}
