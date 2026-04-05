import { Entity } from "./index.ts";

export abstract class BaseEntity implements Entity {
  id: string;

  constructor(id?: string) {
    this.id = id ?? crypto.randomUUID();
  }
}
