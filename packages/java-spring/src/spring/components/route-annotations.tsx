import { Child, Refkey } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { springFramework } from "../libraries/index.js";

export interface AnnotationsProps {
  kind: string;
  parameters?: Record<string, Child>;
}

/**
 * Annotation wrapper for specifying http route annotations, such as @GetMapping, @PostMapping, @RequestParam, etc.
 *
 * @param kind The kind of annotation, see {@link springAnnotations}
 * @param parameters Parameters to be passed to the annotation, such as if the value is required
 */
export function SpringRouteAnnotation({ kind, parameters }: AnnotationsProps) {
  const httpVerbRef = springAnnotations.get(kind);
  return <jv.Annotation type={httpVerbRef} value={parameters} />;
}

export const springAnnotations = new Map<string, Refkey>([
  ["get", springFramework.GetMapping],
  ["put", springFramework.PutMapping],
  ["delete", springFramework.DeleteMapping],
  ["post", springFramework.PostMapping],
  ["patch", springFramework.PatchMapping],
  ["body", springFramework.RequestBody],
  ["path", springFramework.PathVariable],
  ["header", springFramework.RequestHeader],
  ["query", springFramework.RequestParam],
]);
