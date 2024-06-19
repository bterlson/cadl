import { StreamableMethod, Client } from "@typespec/ts-http-runtime";
import {
  DemoServiceWidgetsListRequestParameters,
  DemoServiceWidgetsCreateRequestParameters,
  DemoServiceWidgetsReadRequestParameters,
  DemoServiceWidgetsUpdateRequestParameters,
  DemoServiceWidgetsDeleteRequestParameters,
  DemoServiceWidgetsAnalyzeRequestParameters,
} from "./parameters.js";
import {
  DemoServiceWidgetsList200Response,
  DemoServiceWidgetsListDefaultResponse,
  DemoServiceWidgetsCreate200Response,
  DemoServiceWidgetsCreateDefaultResponse,
  DemoServiceWidgetsRead200Response,
  DemoServiceWidgetsReadDefaultResponse,
  DemoServiceWidgetsUpdate200Response,
  DemoServiceWidgetsUpdateDefaultResponse,
  DemoServiceWidgetsDelete204Response,
  DemoServiceWidgetsDeleteDefaultResponse,
  DemoServiceWidgetsAnalyze200Response,
  DemoServiceWidgetsAnalyzeDefaultResponse,
} from "./responses.js";

export interface Routes {
  (path: "/widgets"): {
    get(
      options?: DemoServiceWidgetsListRequestParameters,
    ): StreamableMethod<
      DemoServiceWidgetsList200Response | DemoServiceWidgetsListDefaultResponse
    >;
    post(
      options: DemoServiceWidgetsCreateRequestParameters,
    ): StreamableMethod<
      | DemoServiceWidgetsCreate200Response
      | DemoServiceWidgetsCreateDefaultResponse
    >;
  };
  (
    path: "/widgets/{id}",
    id: string,
  ): {
    get(
      options?: DemoServiceWidgetsReadRequestParameters,
    ): StreamableMethod<
      DemoServiceWidgetsRead200Response | DemoServiceWidgetsReadDefaultResponse
    >;
    patch(
      options: DemoServiceWidgetsUpdateRequestParameters,
    ): StreamableMethod<
      | DemoServiceWidgetsUpdate200Response
      | DemoServiceWidgetsUpdateDefaultResponse
    >;
    delete(
      options?: DemoServiceWidgetsDeleteRequestParameters,
    ): StreamableMethod<
      | DemoServiceWidgetsDelete204Response
      | DemoServiceWidgetsDeleteDefaultResponse
    >;
  };
  (
    path: "/widgets/{id}/analyze",
    id: string,
  ): {
    post(
      options?: DemoServiceWidgetsAnalyzeRequestParameters,
    ): StreamableMethod<
      | DemoServiceWidgetsAnalyze200Response
      | DemoServiceWidgetsAnalyzeDefaultResponse
    >;
  };
}
export type DemoServiceClient = Client & { path: Routes };
