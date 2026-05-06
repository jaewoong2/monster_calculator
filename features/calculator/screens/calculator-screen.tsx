import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/shallow";

import { DottedBackground } from "@/components/dotted-background";
import { useCalculationHistoryStore } from "@/stores/calculation-history-store";

import { CalculatorDisplay } from "../components/calculator-display";
import {
  CalculatorKey,
  type CalculatorKeyTone,
} from "../components/calculator-key";
import { useCalculatorStore, type CalculatorOperator } from "../store";

type CalculatorKeyAction =
  | "digit"
  | "decimal"
  | "operator"
  | "equals"
  | "clear"
  | "delete"
  | "percent"
  | "toggleSign";

type CalculatorKeyConfig = {
  label: string;
  action: CalculatorKeyAction;
  tone?: CalculatorKeyTone;
  wide?: boolean;
};

const TOP_KEY_ROWS: CalculatorKeyConfig[][] = [
  [
    { label: "AC", action: "clear", tone: "utility" },
    { label: "%", action: "percent", tone: "utility" },
    { label: "÷", action: "operator", tone: "operator" },
    { label: "×", action: "operator", tone: "operator" },
  ],
  [
    { label: "7", action: "digit" },
    { label: "8", action: "digit" },
    { label: "9", action: "digit" },
    { label: "-", action: "operator", tone: "operator" },
  ],
  [
    { label: "4", action: "digit" },
    { label: "5", action: "digit" },
    { label: "6", action: "digit" },
    { label: "+", action: "operator", tone: "operator" },
  ],
];

const BOTTOM_LEFT_KEY_ROWS: CalculatorKeyConfig[][] = [
  [
    { label: "1", action: "digit" },
    { label: "2", action: "digit" },
    { label: "3", action: "digit" },
  ],
  [
    { label: "+/-", action: "toggleSign", tone: "utility" },
    { label: "0", action: "digit" },
    { label: ".", action: "decimal" },
  ],
];

export function CalculatorScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["55%", "90%"], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );
  const {
    currentValue,
    expression,
    errorMessage,
    mascotMood,
    inputDigit,
    inputDecimal,
    inputPercent,
    toggleSign,
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
      inputPercent: state.inputPercent,
      toggleSign: state.toggleSign,
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

  const handleKeyPress = (key: CalculatorKeyConfig) => {
    if (key.action === "digit") {
      inputDigit(key.label);
      return;
    }

    if (key.action === "decimal") {
      inputDecimal();
      return;
    }

    if (key.action === "operator") {
      chooseOperator(key.label as CalculatorOperator);
      return;
    }

    if (key.action === "equals") {
      evaluate();
      return;
    }

    if (key.action === "delete") {
      deleteLast();
      return;
    }

    if (key.action === "percent") {
      inputPercent();
      return;
    }

    if (key.action === "toggleSign") {
      toggleSign();
      return;
    }

    clear();
  };

  return (
    <DottedBackground>
      <SafeAreaView className="flex-1 bg-transparent" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          contentContainerClassName="gap-5 px-5 pb-8 pt-3"
          showsVerticalScrollIndicator={false}
        >
          <CalculatorDisplay
            expression={expression}
            value={currentValue}
            errorMessage={errorMessage}
            mascotMood={mascotMood}
            historyCount={entries.length}
            onToggleHistory={() => bottomSheetRef.current?.snapToIndex(0)}
          />

          <View className="flex-1 gap-3">
            {TOP_KEY_ROWS.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-1 flex-row gap-3">
                {row.map((key) => (
                  <CalculatorKey
                    key={key.label}
                    label={key.label}
                    tone={key.tone}
                    wide={key.wide}
                    onPress={() => handleKeyPress(key)}
                  />
                ))}
              </View>
            ))}
            <View className="flex-[2] flex-row gap-3">
              <View className="flex-[3] gap-3">
                {BOTTOM_LEFT_KEY_ROWS.map((row, rowIndex) => (
                  <View key={rowIndex} className="flex-1 flex-row gap-3">
                    {row.map((key) => (
                      <CalculatorKey
                        key={key.label}
                        label={key.label}
                        tone={key.tone}
                        wide={key.wide}
                        onPress={() => handleKeyPress(key)}
                      />
                    ))}
                  </View>
                ))}
              </View>
              <CalculatorKey
                label="="
                tone="equals"
                onPress={() => handleKeyPress({ label: "=", action: "equals" })}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: "white" }}
        handleIndicatorStyle={{ backgroundColor: "#d4d4d8" }}
      >
        <BottomSheetView className="flex-1 px-5 pb-8 pt-3">
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-2xl font-extrabold text-foreground">
              기록
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="계산 기록 전체 삭제"
              className="rounded-full bg-muted px-4 py-2 active:scale-95"
              onPress={() => {
                clearEntries();
                bottomSheetRef.current?.close();
              }}
            >
              <Text className="text-sm font-bold text-muted-foreground">
                전체 삭제
              </Text>
            </Pressable>
          </View>

          <BottomSheetScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {entries.length === 0 ? (
              <View className="py-10 items-center justify-center">
                <Text className="text-base font-medium text-muted-foreground">
                  아직 저장된 계산이 없어요
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {entries.map((entry) => (
                  <View
                    key={entry.id}
                    className="flex-row items-center justify-between gap-4 rounded-3xl bg-muted/50 px-5 py-4"
                  >
                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-base font-semibold text-muted-foreground"
                      >
                        {entry.expression}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="mt-1 text-2xl font-extrabold text-foreground"
                      >
                        {entry.result}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheet>
    </DottedBackground>
  );
}
