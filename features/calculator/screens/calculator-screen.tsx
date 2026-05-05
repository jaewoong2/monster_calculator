import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/shallow';

import { useCalculationHistoryStore } from '@/stores/calculation-history-store';

import { CalculatorDisplay } from '../components/calculator-display';
import { CalculatorKey, type CalculatorKeyTone } from '../components/calculator-key';
import { useCalculatorStore, type CalculatorOperator } from '../store';

type CalculatorKeyAction = 'digit' | 'decimal' | 'operator' | 'equals' | 'clear' | 'delete';

type CalculatorKeyConfig = {
  label: string;
  action: CalculatorKeyAction;
  tone?: CalculatorKeyTone;
  wide?: boolean;
};

const KEY_ROWS: CalculatorKeyConfig[][] = [
  [
    { label: 'AC', action: 'clear', tone: 'utility' },
    { label: '⌫', action: 'delete', tone: 'utility' },
    { label: '÷', action: 'operator', tone: 'operator' },
    { label: '×', action: 'operator', tone: 'operator' },
  ],
  [
    { label: '7', action: 'digit' },
    { label: '8', action: 'digit' },
    { label: '9', action: 'digit' },
    { label: '-', action: 'operator', tone: 'operator' },
  ],
  [
    { label: '4', action: 'digit' },
    { label: '5', action: 'digit' },
    { label: '6', action: 'digit' },
    { label: '+', action: 'operator', tone: 'operator' },
  ],
  [
    { label: '1', action: 'digit' },
    { label: '2', action: 'digit' },
    { label: '3', action: 'digit' },
    { label: '=', action: 'equals', tone: 'equals' },
  ],
  [
    { label: '0', action: 'digit', wide: true },
    { label: '.', action: 'decimal' },
  ],
] as const;

export function CalculatorScreen() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const {
    currentValue,
    expression,
    errorMessage,
    mascotMood,
    inputDigit,
    inputDecimal,
    chooseOperator,
    evaluate,
    clear,
    deleteLast,
  } = useCalculatorStore(
    useShallow((state) => ({
      currentValue: state.currentValue,
      expression: state.expression,
      errorMessage: state.errorMessage,
      mascotMood: state.mascotMood,
      inputDigit: state.inputDigit,
      inputDecimal: state.inputDecimal,
      chooseOperator: state.chooseOperator,
      evaluate: state.evaluate,
      clear: state.clear,
      deleteLast: state.deleteLast,
    })),
  );
  const { entries, clearEntries } = useCalculationHistoryStore(
    useShallow((state) => ({
      entries: state.entries,
      clearEntries: state.clearEntries,
    })),
  );

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-8 pt-3"
        showsVerticalScrollIndicator={false}>
        <View>
          <Text className="text-5xl font-extrabold text-primary-foreground">계산기</Text>
          <Text className="mt-1 text-base font-semibold text-primary-foreground/80">
            똑똑하게 계산해요!
          </Text>
        </View>

        <CalculatorDisplay
          expression={expression}
          value={currentValue}
          errorMessage={errorMessage}
          mascotMood={mascotMood}
          historyCount={entries.length}
          onToggleHistory={() => setIsHistoryOpen((value) => !value)}
        />

        {isHistoryOpen ? (
          <View className="rounded-3xl border border-white/70 bg-card p-4 shadow-sm">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-extrabold text-foreground">계산 기록</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="계산 기록 전체 삭제"
                className="rounded-full bg-muted px-3 py-2 active:scale-95"
                onPress={clearEntries}>
                <Text className="text-xs font-bold text-muted-foreground">전체 삭제</Text>
              </Pressable>
            </View>
            {entries.length === 0 ? (
              <Text className="py-3 text-sm font-medium text-muted-foreground">
                아직 저장된 계산이 없어요
              </Text>
            ) : (
              <View className="gap-2">
                {entries.slice(0, 5).map((entry) => (
                  <View
                    key={entry.id}
                    className="flex-row items-center justify-between gap-3 rounded-2xl bg-muted/70 px-3 py-2">
                    <View className="flex-1">
                      <Text numberOfLines={1} className="text-sm font-semibold text-muted-foreground">
                        {entry.expression}
                      </Text>
                      <Text numberOfLines={1} className="text-lg font-extrabold text-foreground">
                        {entry.result}
                      </Text>
                    </View>
                    <Text className="text-xs font-semibold text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-white/70 bg-card px-4 py-3 shadow-sm">
            <Text className="text-2xl text-secondary">👥</Text>
            <Text numberOfLines={1} className="mt-1 text-base font-extrabold text-foreground">
              나눠 계산하기
            </Text>
            <Text numberOfLines={1} className="text-xs font-semibold text-muted-foreground">
              Split Bill
            </Text>
          </View>
          <View className="flex-1 rounded-2xl border border-white/70 bg-card px-4 py-3 shadow-sm">
            <Text className="text-2xl text-secondary">%</Text>
            <Text numberOfLines={1} className="mt-1 text-base font-extrabold text-foreground">
              할인 계산하기
            </Text>
            <Text numberOfLines={1} className="text-xs font-semibold text-muted-foreground">
              Discount
            </Text>
          </View>
        </View>

        <View className="gap-3">
          {KEY_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-3">
              {row.map((key) => {
                const onPress = () => {
                  if (key.action === 'digit') {
                    inputDigit(key.label);
                    return;
                  }

                  if (key.action === 'decimal') {
                    inputDecimal();
                    return;
                  }

                  if (key.action === 'operator') {
                    chooseOperator(key.label as CalculatorOperator);
                    return;
                  }

                  if (key.action === 'equals') {
                    evaluate();
                    return;
                  }

                  if (key.action === 'delete') {
                    deleteLast();
                    return;
                  }

                  clear();
                };

                return (
                  <CalculatorKey
                    key={key.label}
                    label={key.label}
                    tone={key.tone}
                    wide={key.wide}
                    onPress={onPress}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
