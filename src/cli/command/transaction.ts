import { cli } from "@src/lib";

export const transactionCommand = cli
  .builder()
  .name("transaction")
  .build();
