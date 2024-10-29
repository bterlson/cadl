import { Interface, Namespace } from "@typespec/compiler";

export interface Client {
  kind: "Client";
  name: string;
  type: Namespace | Interface;
  service: Namespace;
}