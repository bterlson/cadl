// <auto-generated/>

#nullable disable

using System;
using System.ClientModel;
using System.ClientModel.Primitives;
using System.Text.Json;

namespace Encode.Numeric.Models
{
    public partial class Uint8AsStringProperty : IJsonModel<Uint8AsStringProperty>
    {
        void IJsonModel<Uint8AsStringProperty>.Write(Utf8JsonWriter writer, ModelReaderWriterOptions options) => throw null;

        protected virtual void JsonModelWriteCore(Utf8JsonWriter writer, ModelReaderWriterOptions options) => throw null;

        Uint8AsStringProperty IJsonModel<Uint8AsStringProperty>.Create(ref Utf8JsonReader reader, ModelReaderWriterOptions options) => throw null;

        protected virtual Uint8AsStringProperty JsonModelCreateCore(ref Utf8JsonReader reader, ModelReaderWriterOptions options) => throw null;

        BinaryData IPersistableModel<Uint8AsStringProperty>.Write(ModelReaderWriterOptions options) => throw null;

        protected virtual BinaryData PersistableModelWriteCore(ModelReaderWriterOptions options) => throw null;

        Uint8AsStringProperty IPersistableModel<Uint8AsStringProperty>.Create(BinaryData data, ModelReaderWriterOptions options) => throw null;

        protected virtual Uint8AsStringProperty PersistableModelCreateCore(BinaryData data, ModelReaderWriterOptions options) => throw null;

        string IPersistableModel<Uint8AsStringProperty>.GetFormatFromOptions(ModelReaderWriterOptions options) => throw null;

        public static implicit operator BinaryContent(Uint8AsStringProperty uint8AsStringProperty) => throw null;

        public static explicit operator Uint8AsStringProperty(ClientResult result) => throw null;
    }
}