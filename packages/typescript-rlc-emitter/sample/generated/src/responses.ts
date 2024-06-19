import { Widget, Error } from "./models.js";

export interface DemoServiceWidgetsList200Response {
  status: "200";
  headers: { contentType: "application/json" };
  body?: Widget[];
}
export interface DemoServiceWidgetsListDefaultResponse {
  status: string;
  headers: { contentType: "application/json" };
  body: Error;
}
export interface DemoServiceWidgetsRead200Response {
  status: "200";
  headers: { contentType: "application/json" };
  body: Widget;
}
export interface DemoServiceWidgetsReadDefaultResponse {
  status: string;
  headers: { contentType: "application/json" };
  body: Error;
}
export interface DemoServiceWidgetsCreate200Response {
  status: "200";
  headers: { contentType: "application/json" };
  body: Widget;
}
export interface DemoServiceWidgetsCreateDefaultResponse {
  status: string;
  headers: { contentType: "application/json" };
  body: Error;
}
export interface DemoServiceWidgetsUpdate200Response {
  status: "200";
  headers: { contentType: "application/json" };
  body: Widget;
}
export interface DemoServiceWidgetsUpdateDefaultResponse {
  status: string;
  headers: { contentType: "application/json" };
  body: Error;
}
export interface DemoServiceWidgetsDelete204Response {
  status: "204";
  headers: { contentType: "application/json" };
}
export interface DemoServiceWidgetsDeleteDefaultResponse {
  status: string;
  headers: { contentType: "application/json" };
  body: Error;
}
export interface DemoServiceWidgetsAnalyze200Response {
  status: "200";
  headers: { contentType: "application/json" };
  body: string;
}
export interface DemoServiceWidgetsAnalyzeDefaultResponse {
  status: string;
  headers: { contentType: "application/json" };
  body: Error;
}
