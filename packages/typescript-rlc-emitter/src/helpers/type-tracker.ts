import { Type } from "@typespec/compiler";

export interface TypeTracker {
  track(group: TypeTrackingGroup, type: Type): void;
  untrack(group: TypeTrackingGroup, type: Type): void;
  isTracked(type: Type): boolean;
  getTracked(): Map<TypeTrackingGroup, Set<Type>>;
  getTracked(group: TypeTrackingGroup): Type[];
}

export type TypeTrackingGroup = "parameter" | "response" | "model" | "ungrouped";

export function createTypeTracker(): TypeTracker {
  const trackedTypes: Map<TypeTrackingGroup, Set<Type>> = new Map();

  const track = (group: TypeTrackingGroup, type: Type) => {
    if (!trackedTypes.has(group)) {
      trackedTypes.set(group, new Set());
    }

    trackedTypes.get(group)!.add(type);
  };

  const untrack = (group: TypeTrackingGroup, type: Type) => {
    if (!trackedTypes.has(group)) {
      return;
    }

    trackedTypes.get(group)!.delete(type);
  };

  const isTracked = (type: Type) => {
    for (const tracked of trackedTypes.values()) {
      if (tracked.has(type)) {
        return true;
      }
    }

    return false;
  };

  function getTracked(): Map<TypeTrackingGroup, Set<Type>>;
  function getTracked(group: TypeTrackingGroup): Type[];
  function getTracked(group?: TypeTrackingGroup): Type[] | Map<TypeTrackingGroup, Set<Type>> {
    if (!group) {
      return trackedTypes;
    }

    if (!trackedTypes.has(group)) {
      return [];
    }

    return Array.from(trackedTypes.get(group)!);
  }

  return {
    track,
    untrack,
    isTracked,
    getTracked,
  };
}
