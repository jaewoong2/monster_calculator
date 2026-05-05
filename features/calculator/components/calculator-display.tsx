import { Pressable, Text, View } from 'react-native';

import { type CalculatorMascotMood } from '../store';
import { BluuMascot } from './bluu-mascot';

type CalculatorDisplayProps = {
  expression: string;
  value: string;
  errorMessage: string | null;
  mascotMood: CalculatorMascotMood;
  historyCount: number;
  onToggleHistory: () => void;
};

export function CalculatorDisplay({
  expression,
  value,
  errorMessage,
  mascotMood,
  historyCount,
  onToggleHistory,
}: CalculatorDisplayProps) {
  return (
    <View className="overflow-hidden rounded-[28px] border border-white/70 bg-card p-5 shadow-lg">
      <View className="mb-3 flex-row items-center justify-between gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="계산 기록 열기"
          className="flex-row items-center rounded-full border border-border bg-card px-4 py-2 active:scale-95"
          onPress={onToggleHistory}>
          <Text className="text-lg text-muted-foreground">↺</Text>
          <Text className="ml-2 text-sm font-bold text-muted-foreground">계산 기록</Text>
        </Pressable>
        <Text className="text-sm font-semibold text-muted-foreground">{historyCount}개</Text>
      </View>

      <View className="flex-row items-start justify-between gap-4">
        <View className="min-h-28 flex-1 justify-end">
          <Text numberOfLines={1} className="text-right text-base text-muted-foreground">
            {errorMessage ?? expression}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.45}
            className="mt-2 text-right text-6xl font-bold text-foreground">
            {value}
          </Text>
        </View>
        <BluuMascot mood={mascotMood} />
      </View>
    </View>
  );
}
