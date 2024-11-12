// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Buffers;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Microsoft.Generator.CSharp;

/// <summary>
/// Provides a way to read a <see cref="UnsafeBufferSequence"/> without exposing the underlying buffers.
/// This class is not thread safe and should only be used by one thread at a time.
/// If you dispose while another thread is copying you will end up with a partial copy.
/// </summary>
internal partial class UnsafeBufferSequence
{
    //Only needed to restrict ctor access of Reader to BufferSequence
    private class ReaderInstance : Reader
    {
        public ReaderInstance(UnsafeBufferSegment[] buffers, int count)
            : base(buffers, count)
        {
        }
    }

    internal class Reader : IDisposable
    {
        private UnsafeBufferSegment[] _buffers;
        private int _count;
        private bool _isDisposed;
        private static readonly object _disposeLock = new object();

        private protected Reader(UnsafeBufferSegment[] buffers, int count)
        {
            _buffers = buffers;
            _count = count;
        }

        public long Length
        {
            get
            {
                if (_isDisposed)
                {
                    throw new ObjectDisposedException(nameof(Reader));
                }

                long result = 0;
                for (int i = 0; i < _count; i++)
                {
                    result += _buffers[i].Written;
                }
                return result;
            }
        }

        public void CopyTo(Stream stream, CancellationToken cancellation)
        {
            if (_isDisposed)
            {
                throw new ObjectDisposedException(nameof(Reader));
            }

            for (int i = 0; i < _count; i++)
            {
                cancellation.ThrowIfCancellationRequested();

                UnsafeBufferSegment buffer = _buffers[i];
                byte[] bufferToWrite = Encoding.UTF8.GetBytes(buffer.Array, 0, buffer.Written);
                stream.Write(bufferToWrite, 0, bufferToWrite.Length);
            }
        }

        public void CopyTo(StringBuilder builder, bool reduce, IEnumerable<string> namespaces, HashSet<string> types, CancellationToken cancellation)
        {
            if (_isDisposed)
            {
                throw new ObjectDisposedException(nameof(Reader));
            }

            for (int i = 0; i < _count; i++)
            {
                cancellation.ThrowIfCancellationRequested();

                UnsafeBufferSegment buffer = _buffers[i];
                if (reduce)
                {
                    ReduceBuffer(ref buffer, namespaces, types);
                }
                builder.Append(buffer.Array, 0, buffer.Written);
            }
        }

        private void ReduceBuffer(ref UnsafeBufferSegment buffer, IEnumerable<string> namespaces, HashSet<string> types)
        {
            var span = buffer.Array.AsSpan(0, buffer.Written);
            var typeStartIndex = span.IndexOf("global::");
            int offset = 0;
            List<(int, int)> shiftPairs = new List<(int, int)>();
            while (typeStartIndex != -1 && typeStartIndex < span.Length) //while there are more global:: to find
            {
                shiftPairs.Add((offset + typeStartIndex, offset + typeStartIndex + 8));
                typeStartIndex += 8 + offset; //skip past global::

                //make sure we get an actual type not a static property or method
                var end = ExtractTypeName(span, typeStartIndex);
                string typeName = GetName(span, typeStartIndex, end);

                int nextStart = typeStartIndex;
                int endShift = typeStartIndex;
                do
                {
                    endShift = nextStart;
                    int count = 0;
                    bool inSystem = false;
                    foreach (var ns in namespaces)
                    {
                        var nsSpan = ns.AsSpan();
                        var overlap = FindLargestOverlap(nsSpan, span.Slice(nextStart, end - nextStart));
                        var startWithoutOverlap = nextStart + overlap.Length;
                        if (span[startWithoutOverlap] == '.')
                            startWithoutOverlap++;
                        string testName = overlap.IsEmpty
                            ? $"global::{ns}.{GetName(span, startWithoutOverlap, end)}"
                            : $"global::{nsSpan.Slice(0, overlap.Length)}.{GetName(span, startWithoutOverlap, end)}";
                        if (types.Contains(testName) || Type.GetType(testName, false) != null)
                        {
                            if (nsSpan.StartsWith("System", StringComparison.Ordinal))
                            {
                                if (!inSystem)
                                    count++;
                                inSystem = true;
                            }
                            else
                            {
                                count++;
                            }
                            if (count > 1)
                                break;
                        }
                    }
                    if (count > 1)
                    {
                        break;
                    }
                    nextStart = PopNextSegment(span, nextStart, end);
                } while (nextStart < end); //pop the parts of the name
                shiftPairs.Add((typeStartIndex, endShift));
                shiftPairs.Add((end + 1, end + 4));
                offset = end + 4;
                typeStartIndex = span.Slice(offset).IndexOf("global::");
            }

            if (shiftPairs.Count > 0)
            {
                var pairIndex = 1;
                var first = shiftPairs[0];
                var next = shiftPairs.Count > pairIndex ? shiftPairs[pairIndex] : (0, 0);
                var delta = first.Item2 - first.Item1;
                span = buffer.Array.AsSpan(0, buffer.Written);
                for (int i = first.Item1; i + delta < span.Length; i++)
                {
                    while (i + delta == next.Item1)
                    {
                        delta += next.Item2 - next.Item1;
                        next = shiftPairs.Count > ++pairIndex ? shiftPairs[pairIndex] : (0, 0);
                    }
                    if (i + delta >= span.Length)
                        break;
                    span[i] = span[i + delta];
                }
            }

            int removed = 0;
            foreach (var pair in shiftPairs)
            {
                removed += pair.Item2 - pair.Item1;
            }
            buffer.Written -= removed;
        }

        private string GetName(Span<char> span, int typeStartIndex, int end)
        {
            var name = span.Slice(typeStartIndex, end - typeStartIndex + 1);
            var start = end + 4;

            if (span.Length > start && span[start] == '<')
            {
                int typeParams = 1;
                for (int i = start; i < span.Length; i++)
                {
                    if (span[i] == '>')
                        break;
                    if (span[i] == ',')
                        typeParams++;
                }
                return $"{name}`{typeParams}";
            }
            else
            {
                return name.ToString();
            }
        }

        private int PopNextSegment(Span<char> span, int start, int end)
        {
            while (span[start] != '.' && start < end)
            {
                start++;
            }
            return start + 1;
        }

        public static ReadOnlySpan<char> FindLargestOverlap(ReadOnlySpan<char> usingNamespace, ReadOnlySpan<char> typeName)
        {
            int maxLength = Math.Min(usingNamespace.Length, typeName.Length);

            for (int length = maxLength; length > 0; length--)
            {
                if (usingNamespace.Slice(usingNamespace.Length - length).SequenceEqual(typeName.Slice(0, length)))
                {
                    return usingNamespace.Slice(usingNamespace.Length - length);
                }
            }

            return ReadOnlySpan<char>.Empty;
        }

        public static int ExtractTypeName(Span<char> input, int startIndex)
        {
            return input.Slice(startIndex).IndexOf("$$$") + startIndex - 1;
        }

        public async Task CopyToAsync(Stream stream, CancellationToken cancellation)
        {
            if (_isDisposed)
            {
                throw new ObjectDisposedException(nameof(Reader));
            }

            for (int i = 0; i < _count; i++)
            {
                cancellation.ThrowIfCancellationRequested();

                UnsafeBufferSegment buffer = _buffers[i];
                byte[] bufferToWrite = Encoding.UTF8.GetBytes(buffer.Array, 0, buffer.Written);
                await stream.WriteAsync(bufferToWrite, 0, bufferToWrite.Length, cancellation).ConfigureAwait(false);
            }
        }

        public BinaryData ToBinaryData()
        {
            if (_isDisposed)
            {
                throw new ObjectDisposedException(nameof(Reader));
            }

            long length = Length;
            if (length > int.MaxValue)
            {
                throw new InvalidOperationException($"Length of serialized model is too long.  Value was {length} max is {int.MaxValue}");
            }
            using var stream = new MemoryStream((int)length);
            CopyTo(stream, default);
            return new BinaryData(stream.GetBuffer().AsMemory(0, (int)stream.Position));
        }

        public void Dispose()
        {
            if (!_isDisposed)
            {
                lock (_disposeLock)
                {
                    if (!_isDisposed)
                    {
                        int buffersToReturnCount = _count;
                        var buffersToReturn = _buffers;
                        _count = 0;
                        _buffers = Array.Empty<UnsafeBufferSegment>();
                        for (int i = 0; i < buffersToReturnCount; i++)
                        {
                            ArrayPool<char>.Shared.Return(buffersToReturn[i].Array);
                        }
                        _isDisposed = true;
                    }
                }
            }
        }
    }
}
