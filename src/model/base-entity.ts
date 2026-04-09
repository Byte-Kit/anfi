import { Entity } from "./index.ts";

export abstract class BaseEntity implements Entity {
  id: string;

  constructor(id: string | null = null) {
    this.id = id ?? crypto.randomUUID();
  }
}
