import { Type } from "@typespec/compiler";
import { CustomKeyMap } from "@typespec/compiler/emitter-framework";

const typeKeyer = CustomKeyMap.objectKeyer();
const refkeyKeyer = ([type, variant]: [Type, string]) => `${typeKeyer.getKey(type)}-${variant}`;
const refkeys = new CustomKeyMap<[Type, string], symbol>(refkeyKeyer);
export function getRefkey(type: Type, variant: string) {
  let key = refkeys.get([type, variant]);
  if (key) {
    return key;
  }

  key = Symbol();
  refkeys.set([type, variant], key);
  return key;
}
