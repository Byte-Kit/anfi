import { cli } from "@anfi/lib";

export const transactionCommand = cli
  .builder()
  .name("transaction")
  .build();
