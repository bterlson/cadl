# -------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for
# license information.
# --------------------------------------------------------------------------
import pytest
from routes.aio import RoutesClient


@pytest.fixture
async def client():
    async with RoutesClient() as client:
        yield client


@pytest.mark.asyncio
async def test_fixed(client: RoutesClient):
    await client.fixed()


@pytest.mark.asyncio
async def test_in_interface_fixed(client: RoutesClient):
    await client.in_interface.fixed()


@pytest.mark.asyncio
async def test_path_parameters_template_only(client: RoutesClient):
    await client.path_parameters.template_only(
        param="a",
    )


@pytest.mark.asyncio
async def test_path_parameters_explicit(client: RoutesClient):
    await client.path_parameters.explicit(
        param="a",
    )


@pytest.mark.asyncio
async def test_path_parameters_annotation_only(client: RoutesClient):
    await client.path_parameters.annotation_only(
        param="a",
    )


@pytest.mark.asyncio
async def test_path_parameters_reserved_expansion_template(client: RoutesClient):
    await client.path_parameters.reserved_expansion.template(
        param="foo/bar baz",
    )


@pytest.mark.asyncio
async def test_path_parameters_reserved_expansion_annotation(client: RoutesClient):
    await client.path_parameters.reserved_expansion.annotation(
        param="foo/bar baz",
    )


# @pytest.mark.asyncio
# async def test_path_parameters_simple_expansion_standard_primitive(client: RoutesClient):
#     await client.path_parameters.simple_expansion.standard.primitive(
#         param="a",
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_simple_expansion_standard_array(client: RoutesClient):
#     await client.path_parameters.simple_expansion.standard.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_simple_expansion_standard_record(client: RoutesClient):
#     await client.path_parameters.simple_expansion.standard.record(
#         param={"a": 1, "b": 2},
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_simple_expansion_explode_primitive(client: RoutesClient):
#     await client.path_parameters.simple_expansion.explode.primitive(
#         param="a",
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_simple_expansion_explode_array(client: RoutesClient):
#     await client.path_parameters.simple_expansion.explode.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_simple_expansion_explode_record(client: RoutesClient):
#     await client.path_parameters.simple_expansion.explode.record(
#         param={"a": 1, "b": 2},
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_path_expansion_standard_primitive(client: RoutesClient):
#     await client.path_parameters.path_expansion.standard.primitive(
#         param="a",
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_path_expansion_standard_array(client: RoutesClient):
#     await client.path_parameters.path_expansion.standard.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_path_expansion_standard_record(client: RoutesClient):
#     await client.path_parameters.path_expansion.standard.record(
#         param={"a": 1, "b": 2},
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_path_expansion_explode_primitive(client: RoutesClient):
#     await client.path_parameters.path_expansion.explode.primitive(
#         param="a",
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_path_expansion_explode_array(client: RoutesClient):
#     await client.path_parameters.path_expansion.explode.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_path_expansion_explode_record(client: RoutesClient):
#     await client.path_parameters.path_expansion.explode.record(
#         param={"a": 1, "b": 2},
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_label_expansion_standard_primitive(client: RoutesClient):
#     await client.path_parameters.label_expansion.standard.primitive(
#         param="a",
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_label_expansion_standard_array(client: RoutesClient):
#     await client.path_parameters.label_expansion.standard.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_label_expansion_standard_record(client: RoutesClient):
#     await client.path_parameters.label_expansion.standard.record(
#         param={"a": 1, "b": 2},
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_label_expansion_explode_primitive(client: RoutesClient):
#     await client.path_parameters.label_expansion.explode.primitive(
#         param="a",
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_label_expansion_explode_array(client: RoutesClient):
#     await client.path_parameters.label_expansion.explode.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_label_expansion_explode_record(client: RoutesClient):
#     await client.path_parameters.label_expansion.explode.record(
#         param={"a": 1, "b": 2},
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_matrix_expansion_standard_primitive(client: RoutesClient):
#     await client.path_parameters.matrix_expansion.standard.primitive(
#         param="a",
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_matrix_expansion_standard_array(client: RoutesClient):
#     await client.path_parameters.matrix_expansion.standard.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_matrix_expansion_standard_record(client: RoutesClient):
#     await client.path_parameters.matrix_expansion.standard.record(
#         param={"a": 1, "b": 2},
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_matrix_expansion_explode_primitive(client: RoutesClient):
#     await client.path_parameters.matrix_expansion.explode.primitive(
#         param="a",
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_matrix_expansion_explode_array(client: RoutesClient):
#     await client.path_parameters.matrix_expansion.explode.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_path_parameters_matrix_expansion_explode_record(client: RoutesClient):
#     await client.path_parameters.matrix_expansion.explode.record(
#         param={"a": 1, "b": 2},
#     )


@pytest.mark.asyncio
async def test_query_parameters_template_only(client: RoutesClient):
    await client.query_parameters.template_only(
        param="a",
    )


@pytest.mark.asyncio
async def test_query_parameters_explicit(client: RoutesClient):
    await client.query_parameters.explicit(
        param="a",
    )


@pytest.mark.asyncio
async def test_query_parameters_annotation_only(client: RoutesClient):
    await client.query_parameters.annotation_only(
        param="a",
    )


@pytest.mark.asyncio
async def test_query_parameters_query_expansion_standard_primitive(client: RoutesClient):
    await client.query_parameters.query_expansion.standard.primitive(
        param="a",
    )


# @pytest.mark.asyncio
# async def test_query_parameters_query_expansion_standard_array(client: RoutesClient):
#     await client.query_parameters.query_expansion.standard.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_query_parameters_query_expansion_standard_record(client: RoutesClient):
#     await client.query_parameters.query_expansion.standard.record(
#         param={"a": 1, "b": 2},
#     )


@pytest.mark.asyncio
async def test_query_parameters_query_expansion_explode_primitive(client: RoutesClient):
    await client.query_parameters.query_expansion.explode.primitive(
        param="a",
    )


# @pytest.mark.asyncio
# async def test_query_parameters_query_expansion_explode_array(client: RoutesClient):
#     await client.query_parameters.query_expansion.explode.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_query_parameters_query_expansion_explode_record(client: RoutesClient):
#     await client.query_parameters.query_expansion.explode.record(
#         param={"a": 1, "b": 2},
#     )


@pytest.mark.asyncio
async def test_query_parameters_query_continuation_standard_primitive(client: RoutesClient):
    await client.query_parameters.query_continuation.standard.primitive(
        param="a",
    )


# @pytest.mark.asyncio
# async def test_query_parameters_query_continuation_standard_array(client: RoutesClient):
#     await client.query_parameters.query_continuation.standard.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_query_parameters_query_continuation_standard_record(client: RoutesClient):
#     await client.query_parameters.query_continuation.standard.record(
#         param={"a": 1, "b": 2},
#     )


@pytest.mark.asyncio
async def test_query_parameters_query_continuation_explode_primitive(client: RoutesClient):
    await client.query_parameters.query_continuation.explode.primitive(
        param="a",
    )


# @pytest.mark.asyncio
# async def test_query_parameters_query_continuation_explode_array(client: RoutesClient):
#     await client.query_parameters.query_continuation.explode.array(
#         param=["a", "b"],
#     )


# @pytest.mark.asyncio
# async def test_query_parameters_query_continuation_explode_record(client: RoutesClient):
#     await client.query_parameters.query_continuation.explode.record(
#         param={"a": 1, "b": 2},
#     )