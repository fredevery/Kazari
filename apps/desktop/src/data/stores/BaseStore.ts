export class BaseStore {
  static instance: any = null;

  static getInstance<T extends typeof BaseStore>(this: T): InstanceType<T> {
    if (!this.instance) {
      this.instance = new this();
    }
    return this.instance as InstanceType<T>;
  }
}
