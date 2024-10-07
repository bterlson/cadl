// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Code generated by Microsoft (R) TypeSpec Code Generator.

package com.type.union.models;

import com.azure.core.annotation.Generated;
import com.azure.core.annotation.Immutable;
import com.azure.json.JsonReader;
import com.azure.json.JsonSerializable;
import com.azure.json.JsonToken;
import com.azure.json.JsonWriter;
import java.io.IOException;

/**
 * The Dog model.
 */
@Immutable
public final class Dog implements JsonSerializable<Dog> {
    /*
     * The bark property.
     */
    @Generated
    private final String bark;

    /**
     * Creates an instance of Dog class.
     * 
     * @param bark the bark value to set.
     */
    @Generated
    public Dog(String bark) {
        this.bark = bark;
    }

    /**
     * Get the bark property: The bark property.
     * 
     * @return the bark value.
     */
    @Generated
    public String getBark() {
        return this.bark;
    }

    /**
     * {@inheritDoc}
     */
    @Generated
    @Override
    public JsonWriter toJson(JsonWriter jsonWriter) throws IOException {
        jsonWriter.writeStartObject();
        jsonWriter.writeStringField("bark", this.bark);
        return jsonWriter.writeEndObject();
    }

    /**
     * Reads an instance of Dog from the JsonReader.
     * 
     * @param jsonReader The JsonReader being read.
     * @return An instance of Dog if the JsonReader was pointing to an instance of it, or null if it was pointing to
     * JSON null.
     * @throws IllegalStateException If the deserialized JSON object was missing any required properties.
     * @throws IOException If an error occurs while reading the Dog.
     */
    @Generated
    public static Dog fromJson(JsonReader jsonReader) throws IOException {
        return jsonReader.readObject(reader -> {
            String bark = null;
            while (reader.nextToken() != JsonToken.END_OBJECT) {
                String fieldName = reader.getFieldName();
                reader.nextToken();

                if ("bark".equals(fieldName)) {
                    bark = reader.getString();
                } else {
                    reader.skipChildren();
                }
            }
            return new Dog(bark);
        });
    }
}
