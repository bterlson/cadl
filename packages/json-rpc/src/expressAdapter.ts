import { NextFunction, Request, Response } from "express";

interface Marshaller {
  name: string;
  methods: Record<string, Function>;
}

export function expressAdapter(marshallers: Marshaller | Marshaller[]) {
  if (!Array.isArray(marshallers)) {
    marshallers = [marshallers];
  }

  const byName = new Map<string, Marshaller>();
  for (const marshaller of marshallers) {
    byName.set(marshaller.name, marshaller);
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    const { method, params, id } = unpackJsonRPCFromRequest(req);

    const [name, methodName] = method.split(".");

    const marshaller = byName.get(name);
    if (!marshaller) {
      throw new Error("Unknown method " + method);
    }

    const methodFn = marshaller.methods[methodName];
    if (!methodFn) {
      throw new Error("Unknown method " + method);
    }

    try {
      let result = await methodFn(params);
      res.json(result);
      console.log("Got result.");
      next();
    } catch (error: any) {
      res.status(500).json({ code: "Request Failed", message: error.message });
      next();
    }
  };
}

function unpackJsonRPCFromRequest(req: Request) {
  let method, params, id;
  if (req.method === "GET") {
    method = req.url.split("?")[0].split("/").slice(1).join(".");
    params = Object.entries(req.query).reduce((acc, [key, value]) => {
      if (key === "__id__") {
        return acc;
      }

      acc[key] = JSON.parse(String(value));
      return acc;
    }, {} as any);
    id = req.params.__id__ ? String(req.params.__id__) : undefined;
  } else {
    method = req.body.method;
    params = req.body.params;
    id = req.body.id;
  }

  return { method, params, id };
}

/*
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
