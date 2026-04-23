import { cli } from "@src/lib";

export const newTransactionCommand = cli
  .builder()
  .name("new")
  .build();
