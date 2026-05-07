import { type ReactNode } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

type DottedBackgroundProps = {
  children: ReactNode;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 이미지처럼 연하고 sparse한 dots: 아주 연한 파란/회색 계열
const DOT_COLOR = "#b8d9f0";

// 화면 전체에 흩뿌려진 느낌으로 dot 좌표를 생성 (pseudo-random but deterministic)
function pseudoRand(seed: number): number {
  const x = Math.sin(seed + 1) * 2758.5453123;
  return x - Math.floor(x);
}

const DOTS = Array.from({ length: 60 }, (_, i) => {
  const x = pseudoRand(i * 3 + 0) * SCREEN_WIDTH;
  const y = pseudoRand(i * 3 + 1) * SCREEN_HEIGHT;
  const size = 5 + pseudoRand(i * 3 + 2) * 5; // 5~10px
  const opacity = 0.18 + pseudoRand(i * 3 + 0.5) * 0.22; // 0.18~0.4

  return { id: i, x, y, size, opacity };
});

export function DottedBackground({ children }: DottedBackgroundProps) {
  return (
    <View className="flex-1 bg-white">
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {DOTS.map((dot) => (
          <View
            key={dot.id}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: DOT_COLOR,
              opacity: dot.opacity,
            }}
          />
        ))}
      </View>
      {children}
    </View>
  );
}
