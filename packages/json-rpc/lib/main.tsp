import "../dist/src/index.js";

namespace JsonRpc;

extern dec query(target: Reflection.Operation);
extern dec create(target: Reflection.Operation);
extern dec update(target: Reflection.Operation);
extern dec delete(target: Reflection.Operation);
extern dec jsonRpc(target: Reflection.Interface | Reflection.Namespace | Reflection.Operation);
