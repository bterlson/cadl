// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Microsoft.Generator.CSharp.Primitives;
using Microsoft.Generator.CSharp.Providers;

namespace Microsoft.Generator.CSharp.Writers
{
    internal static class AlloyComponentWriter
    {
        public static void Write(OutputLibrary library, string filePath)
        {
            Dictionary<string, List<TypeProvider>> directoryHash = [];
            foreach (var type in library.TypeProviders)
            {
                var directory = Path.Combine("./", Path.GetDirectoryName(type.RelativeFilePath)!.Replace("\\", "/"));
                if (directoryHash.ContainsKey(directory))
                {
                    directoryHash[directory].Add(type);
                }
                else
                {
                    directoryHash.Add(directory, [type]);
                }
            }

            using var file = File.Create(Path.Combine(filePath, "domain-specific-metadata.json"));
            JsonWriterOptions options = new() { Indented = true };
            using var writer = new Utf8JsonWriter(file, options);
            writer.WriteStartObject();
            writer.WritePropertyName("directories");
            writer.WriteStartArray();
            foreach (var directory in directoryHash.Keys)
            {
                writer.WriteStartObject();
                writer.WritePropertyName("name");
                writer.WriteStringValue(directory);
                writer.WritePropertyName("files");
                writer.WriteStartArray();
                foreach (var type in directoryHash[directory])
                {
                    writer.WriteStartObject();
                    writer.WritePropertyName("name");
                    writer.WriteStringValue(Path.GetFileName(type.RelativeFilePath));
                    writer.WritePropertyName("typeDeclaration");
                    writer.WriteStartObject();
                    writer.WritePropertyName("name");
                    writer.WriteStringValue(type.Name);
                    writer.WritePropertyName("content");
                    TypeProviderWriter typeWriter = new(type);
                    writer.WriteStringValue(typeWriter.Write().Content);
                    writer.WriteEndObject();
                    writer.WriteEndObject();
                }
                writer.WriteEndArray();
                writer.WriteEndObject();
            }
            writer.WriteEndArray();
            writer.WriteEndObject();
        }
    }
}
