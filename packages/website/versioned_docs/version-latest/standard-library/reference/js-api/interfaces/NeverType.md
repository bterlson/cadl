[JS Api](../index.md) / NeverType

# Interface: NeverType

## Hierarchy

- [`IntrinsicType`](IntrinsicType.md)

  ↳ **`NeverType`**

## Table of contents

### Properties

- [instantiationParameters](NeverType.md#instantiationparameters)
- [isFinished](NeverType.md#isfinished)
- [kind](NeverType.md#kind)
- [name](NeverType.md#name)
- [node](NeverType.md#node)
- [projectionBase](NeverType.md#projectionbase)
- [projectionSource](NeverType.md#projectionsource)
- [projector](NeverType.md#projector)

### Accessors

- [projections](NeverType.md#projections)

### Methods

- [projectionsByName](NeverType.md#projectionsbyname)

## Properties

### instantiationParameters

• `Optional` **instantiationParameters**: [`Type`](../index.md#type)[]

#### Inherited from

[IntrinsicType](IntrinsicType.md).[instantiationParameters](IntrinsicType.md#instantiationparameters)

___

### isFinished

• **isFinished**: `boolean`

Reflect if a type has been finished(Decorators have been called).
There is multiple reasons a type might not be finished:
- a template declaration will not
- a template instance that argument that are still template parameters
- a template instance that is only partially instantiated(like a templated operation inside a templated interface)

#### Inherited from

[IntrinsicType](IntrinsicType.md).[isFinished](IntrinsicType.md#isfinished)

___

### kind

• **kind**: ``"Intrinsic"``

#### Inherited from

[IntrinsicType](IntrinsicType.md).[kind](IntrinsicType.md#kind)

___

### name

• **name**: ``"never"``

#### Overrides

[IntrinsicType](IntrinsicType.md).[name](IntrinsicType.md#name)

___

### node

• `Optional` **node**: [`Node`](../index.md#node)

#### Inherited from

[IntrinsicType](IntrinsicType.md).[node](IntrinsicType.md#node)

___

### projectionBase

• `Optional` **projectionBase**: [`Type`](../index.md#type)

#### Inherited from

[IntrinsicType](IntrinsicType.md).[projectionBase](IntrinsicType.md#projectionbase)

___

### projectionSource

• `Optional` **projectionSource**: [`Type`](../index.md#type)

#### Inherited from

[IntrinsicType](IntrinsicType.md).[projectionSource](IntrinsicType.md#projectionsource)

___

### projector

• `Optional` **projector**: [`Projector`](Projector.md)

#### Inherited from

[IntrinsicType](IntrinsicType.md).[projector](IntrinsicType.md#projector)

## Accessors

### projections

• `get` **projections**(): [`ProjectionStatementNode`](ProjectionStatementNode.md)[]

#### Returns

[`ProjectionStatementNode`](ProjectionStatementNode.md)[]

#### Inherited from

IntrinsicType.projections

## Methods

### projectionsByName

▸ **projectionsByName**(`name`): [`ProjectionStatementNode`](ProjectionStatementNode.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`ProjectionStatementNode`](ProjectionStatementNode.md)[]

#### Inherited from

[IntrinsicType](IntrinsicType.md).[projectionsByName](IntrinsicType.md#projectionsbyname)