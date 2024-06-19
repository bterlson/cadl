import { RequestOptions } from "@typespec/ts-http-runtime";

export type DemoServiceWidgetsListRequestParameters = RequestOptions & {};
export type DemoServiceWidgetsReadRequestParameters = RequestOptions & {};
export type DemoServiceWidgetsCreateRequestParameters = RequestOptions & {
  body: { weight: number; color: "red" | "blue" };
};
export type DemoServiceWidgetsUpdateRequestParameters = RequestOptions & {
  body: { weight: number; color: "red" | "blue" };
};
export type DemoServiceWidgetsDeleteRequestParameters = RequestOptions & {};
export type DemoServiceWidgetsAnalyzeRequestParameters = RequestOptions & {};
