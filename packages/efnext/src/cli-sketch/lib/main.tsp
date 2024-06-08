import "../../../dist/src/cli-sketch/src/decorators.js";

namespace TypeSpecCLI;

extern dec short(target: Reflection.ModelProperty, value: valueof string);
extern dec positional(target: Reflection.ModelProperty);
extern dec invertable(target: Reflection.ModelProperty);
extern dec cli(target: Reflection.Namespace | Reflection.Interface);
