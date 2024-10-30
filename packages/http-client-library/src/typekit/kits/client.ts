import { Model, Operation, Service } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";

export interface ClientKit {
  getName(): string;
  /**
   * Return the model that should be used to initialize the client.
   *
   * @param client the client to get the initialization model for
   */
  getInitializationModel(): Model;

  /**
   * Return the methods on the client
   *
   * @param client the client to get the methods for
   */
  listServiceOperations(): Operation[];
}

export class ClientKitImpl implements ClientKit {
  private service: Service;

  constructor(service: Service) {
    this.service = service;
  }

  getName() {
    const name = this.service.type.name;
    return name.endsWith("Client") ? name : `${name}Client`;
  }

  getInitializationModel() {
    const base = $.model.create({
      name: "ClientInitializationOptions",
      properties: {},
    });
    return base;
  }

  listServiceOperations(): Operation[] {
    return [];
  }
}
