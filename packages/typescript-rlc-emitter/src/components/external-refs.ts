export const coreLib = {
  httpRuntime: {
    RequestOptions: ["@typespec/ts-http-runtime", "RequestOptions"],
    StreamableMethod: ["@typespec/ts-http-runtime", "StreamableMethod"],
    Client: ["@typespec/ts-http-runtime", "Client"],
  },
} as const;
