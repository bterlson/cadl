[JS Api](../index.md) / BaseType

# Interface: BaseType

## Hierarchy

- **`BaseType`**

  ↳ [`ObjectType`](ObjectType.md)

  ↳ [`Projection`](Projection.md)

  ↳ [`IntrinsicType`](IntrinsicType.md)

  ↳ [`Model`](Model.md)

  ↳ [`ModelProperty`](ModelProperty.md)

  ↳ [`Scalar`](Scalar.md)

  ↳ [`Interface`](Interface.md)

  ↳ [`Enum`](Enum.md)

  ↳ [`EnumMember`](EnumMember.md)

  ↳ [`Operation`](Operation.md)

  ↳ [`Namespace`](Namespace.md)

  ↳ [`StringLiteral`](StringLiteral.md)

  ↳ [`NumericLiteral`](NumericLiteral.md)

  ↳ [`BooleanLiteral`](BooleanLiteral.md)

  ↳ [`Tuple`](Tuple.md)

  ↳ [`Union`](Union.md)

  ↳ [`UnionVariant`](UnionVariant.md)

  ↳ [`TemplateParameter`](TemplateParameter.md)

  ↳ [`Decorator`](Decorator.md)

  ↳ [`FunctionType`](FunctionType.md)

  ↳ [`FunctionParameter`](FunctionParameter.md)

## Table of contents

### Properties

- [instantiationParameters](BaseType.md#instantiationparameters)
- [isFinished](BaseType.md#isfinished)
- [kind](BaseType.md#kind)
- [node](BaseType.md#node)
- [projectionBase](BaseType.md#projectionbase)
- [projectionSource](BaseType.md#projectionsource)
- [projector](BaseType.md#projector)

### Accessors

- [projections](BaseType.md#projections)

### Methods

- [projectionsByName](BaseType.md#projectionsbyname)

## Properties

### instantiationParameters

• `Optional` **instantiationParameters**: [`Type`](../index.md#type)[]

___

### isFinished

• **isFinished**: `boolean`

Reflect if a type has been finished(Decorators have been called).
There is multiple reasons a type might not be finished:
- a template declaration will not
- a template instance that argument that are still template parameters
- a template instance that is only partially instantiated(like a templated operation inside a templated interface)

___

### kind

• **kind**: `string`

___

### node

• `Optional` **node**: [`Node`](../index.md#node)

___

### projectionBase

• `Optional` **projectionBase**: [`Type`](../index.md#type)

___

### projectionSource

• `Optional` **projectionSource**: [`Type`](../index.md#type)

___

### projector

• `Optional` **projector**: [`Projector`](Projector.md)

## Accessors

### projections

• `get` **projections**(): [`ProjectionStatementNode`](ProjectionStatementNode.md)[]

#### Returns

[`ProjectionStatementNode`](ProjectionStatementNode.md)[]

## Methods

### projectionsByName

▸ **projectionsByName**(`name`): [`ProjectionStatementNode`](ProjectionStatementNode.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`ProjectionStatementNode`](ProjectionStatementNode.md)[]