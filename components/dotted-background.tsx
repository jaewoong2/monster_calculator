import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type DottedBackgroundProps = {
  children: ReactNode;
};

const DOT_COLORS = ["#1297e8", "#54b9f2", "#a9dbf8", "#eaf6fd"];

const DOTS = Array.from({ length: 176 }, (_, index) => {
  const row = Math.floor(index / 11);
  const column = index % 11;

  return {
    id: index,
    color: DOT_COLORS[(index * 7 + row + column) % DOT_COLORS.length],
    opacity: 0.45 + ((index * 13) % 5) * 0.1,
    transform: [
      { translateX: ((index * 17) % 19) - 9 },
      { translateY: ((index * 23) % 17) - 8 },
    ],
  };
});

export function DottedBackground({ children }: DottedBackgroundProps) {
  return (
    <View className="flex-1 bg-white">
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View className="flex-row flex-wrap">
          {DOTS.map((dot) => (
            <View
              key={dot.id}
              className="h-14 w-14 items-center justify-center"
            >
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: dot.color,
                  opacity: dot.opacity,
                  transform: dot.transform,
                }}
              />
            </View>
          ))}
        </View>
      </View>
      {children}
    </View>
  );
}
