import { mapJoin, refkey } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { useJavaNamePolicy } from "@alloy-js/java";
import { $, Model } from "@typespec/compiler";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { HttpOperation } from "@typespec/http";

/**
 * Emit models used for custom response types. Emits class with name `${operationName}Response`
 *
 * @param ops Operations in the program
 */
export function emitResponseModels(ops: HttpOperation[]) {
  // Determine the http operations that we need a custom response for
  const customResponseOperations = ops.filter((op) => {
    return getNonErrorResponses(op).length > 1;
  });

  return mapJoin(customResponseOperations, (op) => {
    const nonErrorResponses = getNonErrorResponses(op);
    const customResponseName = getCustomResponseModelName(op);

    return (
      <jv.SourceFile path={customResponseName + ".java"}>
        <jv.Class public name={customResponseName}>
          {mapJoin(
            nonErrorResponses,
            (res) => {
              const requiresHeaders = res.responses.some((res) => {
                return Object.values(res?.headers ?? [])?.length ?? 0 > 0;
              });
              const bodyType = res?.responses?.[0]?.body?.type;
              const name =
                // @ts-expect-error Might not exist
                bodyType?.indexer?.value?.name ?? bodyType?.name ?? res?.type?.name ?? "noBody";
              const returnType = !bodyType ? refkey("NoBody") : <TypeExpression type={bodyType} />;
              // prettier-ignore
              const finalReturnType = requiresHeaders ? (
                <>
                    {refkey("Response")}<jv.Generics types={[returnType]} />
                </>
              ) : returnType;

              return <jv.Variable private type={finalReturnType} name={name} />;
            },
            {
              joiner: "\n",
            },
          )}

          <jv.Constructor public />

          {mapJoin(
            nonErrorResponses,
            (res) => {
              const requiresHeaders = res.responses.some((res) => {
                return Object.values(res?.headers ?? [])?.length ?? 0 > 0;
              });
              const bodyType = res?.responses?.[0]?.body?.type;

              const returnType = !bodyType ? refkey("NoBody") : <TypeExpression type={bodyType} />;
              const name =
                // @ts-expect-error Might not exist
                bodyType?.indexer?.value?.name ?? bodyType?.name ?? res?.type?.name ?? "noBody";
              const variableName = useJavaNamePolicy().getName(name, "variable");
              // prettier-ignore
              const finalReturnType = requiresHeaders ? (
                <>
                  {refkey("Response")}<jv.Generics types={[returnType]} />
                </>
              ) : (
                returnType
              );

              return (
                <>
                  <jv.Method name={"get" + name} public return={finalReturnType}>
                    return this.{variableName};
                  </jv.Method>

                  <jv.Method
                    name={"set" + name}
                    public
                    parameters={{
                      value: finalReturnType,
                    }}
                  >
                    this.{variableName} = value;
                  </jv.Method>
                </>
              );
            },
            {
              joiner: "\n\n",
            },
          )}
        </jv.Class>
      </jv.SourceFile>
    );
  });
}

/**
 * Get responses for a {@link HttpOperation} that are not decorated with @error decorator
 *
 * @param op The Http Operation
 */
export function getNonErrorResponses(op: HttpOperation) {
  return op.responses.filter((res) => {
    if (res?.type?.kind !== "Model") return false;
    const responseModel = res.type as Model;
    return !$.model.isErrorModel(responseModel);
  });
}

/**
 * Get responses for a {@link HttpOperation} that are decorated with @error decorator
 *
 * @param op The Http Operation
 */
export function getErrorResponses(op: HttpOperation) {
  return op.responses.filter((res) => {
    if (res?.type?.kind !== "Model") return false;
    const responseModel = res.type as Model;
    return $.model.isErrorModel(responseModel);
  });
}

/**
 * Used to get the name when generating custom response models
 *
 * @param op The Http Operation
 */
export function getCustomResponseModelName(op: HttpOperation) {
  return op.operation.name.slice(0, 1).toUpperCase() + op.operation.name.slice(1) + "Response";
}
