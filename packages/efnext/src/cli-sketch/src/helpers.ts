import { createContext, useContext } from "#typespec/emitter/core";
import { EmitContext, Type, getDoc, isIntrinsicType } from "@typespec/compiler";
import { getShortName, hasShortName, isInvertable, isPositional, listClis } from "./decorators.js";

export const HelperContext = createContext<ReturnType<typeof getStateHelpers>>();

export function useHelpers() {
  return useContext(HelperContext)!;
}

export function getStateHelpers(context: EmitContext) {
  return {
    string: {
      is(type: Type) {
        if (type.kind !== "Scalar") return false;
        return isIntrinsicType(context.program, type, "string");
      },
    },
    option: {
      hasShortName: hasShortName.bind(undefined, context),
      getShortName: getShortName.bind(undefined, context),
      isPositional: isPositional.bind(undefined, context),
      isInvertable: isInvertable.bind(undefined, context),
    },
    boolean: {
      is(type: Type) {
        if (type.kind !== "Scalar") return false;
        return isIntrinsicType(context.program, type, "boolean");
      },
    },
    getDoc: getDoc.bind(undefined, context.program),
    listClis: listClis.bind(undefined, context),
  };
}
