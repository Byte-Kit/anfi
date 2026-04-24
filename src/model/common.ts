export interface Entity {
  id: string;
}

export abstract class BaseEntity implements Entity {
  id: string;

  constructor(id: string | null = null) {
    this.id = id ?? crypto.randomUUID();
  }
}
