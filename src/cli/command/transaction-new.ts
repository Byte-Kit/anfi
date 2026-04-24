import { cli } from "@anfi/lib";

export const newTransactionCommand = cli
  .builder()
  .name("new")
  .build();
