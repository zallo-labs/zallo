export class Unimplemented extends Error {
  public readonly name = 'Unimplemented';

  constructor(feature: string) {
    super(`Unimplemented: ${feature}`);
  }
}
