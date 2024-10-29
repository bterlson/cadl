import { code } from "@alloy-js/core";
import * as jv from "@alloy-js/java";

/**
 * Used when declaring no body for a response
 */
export function NoBody() {
  return (
    <jv.SourceFile path="NoBody.java">
      {code`
        /**
        * Represents a response with no body. Used for custom response classes
        */
      `}
      <jv.Class public name={"NoBody"}>
        <jv.Constructor public></jv.Constructor>
      </jv.Class>
    </jv.SourceFile>
  );
}
