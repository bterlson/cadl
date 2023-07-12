/*import { getRegisteredAPI } from "@typespec/json-api";
import express, { Request, Response, NextFunction } from "express";

export function createExpressMiddleware(api: any) {
  const { createMarshaller } = getRegisteredAPI(api);
  const marshaller = createMarshaller(api);

  return (req: Request, res: Response, next: NextFunction) => {
    const { method, params, id } = unpackJsonRPCFromRequest(req);
    const components = method.split(".");
    
    let current = marshaller;
    for (const component of components) {
      if (current.hasOwnProperty(component)) {
        current = current[component]
      }

      throw new Error("Couldn't find method " + method);
    }

    let result = current.apply(current, params);
    // todo: error handling
    res.send(result);
  }
}

function unpackJsonRPCFromRequest(req: Request) {
  let method, params, id;
  if (req.method === "GET") {

  } else {
    method = req.body.method;
    params = req.body.params;
    id = req.body.id;
  }

  return { method, params, id };
}
*/

/*
export interface ApiInterface {
  Todos: Todos;
}

export function createMarshaller(host: ApiInterface): ApiInterface {
  return {
    Todos: {
      createTodo(todo) {
        // validate todo
        // unmarshal json
        const result = host.Todos.createTodo(todo);
        // apply defaults
        // marshal to json
        // validate outputs
        return result;
      },
    },
  };
}

export const API: ApiInterface = {} as any;
registerAPI(API, { createMarshaller });
*/
