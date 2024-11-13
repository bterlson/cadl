// <auto-generated/>

#nullable disable

using System;

namespace UnbrandedTypeSpec.Models
{
    internal static partial class FloatFixedEnumExtensions
    {
        public static float ToSerialSingle(this FloatFixedEnum value) => value switch
        {
            FloatFixedEnum.OneDotOne => 1.1F,
            FloatFixedEnum.TwoDotTwo => 2.2F,
            FloatFixedEnum.FourDotFour => 4.4F,
            _ => throw new ArgumentOutOfRangeException(nameof(value), value, "Unknown FloatFixedEnum value.")
        };

        public static FloatFixedEnum ToFloatFixedEnum(this float value)
        {
            if ((value == 1.1F))
            {
                return FloatFixedEnum.OneDotOne;
            }
            if ((value == 2.2F))
            {
                return FloatFixedEnum.TwoDotTwo;
            }
            if ((value == 4.4F))
            {
                return FloatFixedEnum.FourDotFour;
            }
            throw new ArgumentOutOfRangeException(nameof(value), value, "Unknown FloatFixedEnum value.");
        }
    }
}
