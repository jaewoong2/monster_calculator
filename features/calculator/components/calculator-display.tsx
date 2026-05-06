import { Asset } from "expo-asset";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { type CalculatorMascotMood } from "../store";

const chairBluuImage = {
  uri: Asset.fromModule(require("../../../assets/images/chair_bluu.png")).uri,
};

const RESULT_SCROLL_STEP = 140;

function formatNumberForDisplay(value: string) {
  const [integerPart, decimalPart] = value.split(".");
  const sign = integerPart.startsWith("-") ? "-" : "";
  const unsignedInteger = sign ? integerPart.slice(1) : integerPart;
  const groupedInteger = unsignedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decimalPart === undefined) {
    return `${sign}${groupedInteger}`;
  }

  return `${sign}${groupedInteger}.${decimalPart}`;
}

function formatCalculatorTextForDisplay(value: string) {
  return value.replace(/-?\d+(?:\.\d*)?/g, formatNumberForDisplay);
}

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
  onToggleHistory,
}: CalculatorDisplayProps) {
  const resultScrollRef = useRef<ScrollView>(null);
  const [resultRailWidth, setResultRailWidth] = useState(0);
  const [resultContentWidth, setResultContentWidth] = useState(0);
  const [resultScrollX, setResultScrollX] = useState(0);

  const displayExpression = errorMessage
    ? errorMessage
    : formatCalculatorTextForDisplay(expression);
  const displayValue = formatCalculatorTextForDisplay(value);
  const maxResultScrollX = Math.max(0, resultContentWidth - resultRailWidth);

  // 맨 왼쪽 숫자가 클라이언트 화면에 안보이면 -> canLeft (왼쪽으로 스크롤 가능)
  const canScrollLeft = resultScrollX > 1;
  // 맨 오른쪽 숫자가 클라이언트 화면에 안보이면 -> canRight (오른쪽으로 스크롤 가능)
  const canScrollRight = resultScrollX < maxResultScrollX - 1;

  useEffect(() => {
    if (maxResultScrollX <= 0) {
      setResultScrollX(0);
      return;
    }

    requestAnimationFrame(() => {
      resultScrollRef.current?.scrollTo({
        x: maxResultScrollX,
        animated: false,
      });
      setResultScrollX(maxResultScrollX);
    });
  }, [displayValue, maxResultScrollX]);

  const scrollResultBy = (offset: number) => {
    const nextX = Math.min(
      Math.max(resultScrollX + offset, 0),
      maxResultScrollX,
    );

    resultScrollRef.current?.scrollTo({ x: nextX, animated: true });
    setResultScrollX(nextX);
  };

  const handleCopyExpression = async () => {
    const textToCopy = errorMessage ?? expression;
    if (!textToCopy) return;
    await Clipboard.setStringAsync(textToCopy);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: "success",
      text1: "복사 완료",
      text2: "계산식이 클립보드에 복사되었습니다.",
      position: "top",
      topOffset: 50,
    });
  };

  const handleCopyValue = async () => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: "success",
      text1: "복사 완료",
      text2: "계산 결과가 클립보드에 복사되었습니다.",
      position: "top",
      topOffset: 60,
    });
  };

  return (
    <View className="mt-20 rounded-[28px] border-2 border-black/45 bg-card px-5 pb-5 pt-7">
      <View
        className="absolute -right-1 -top-[40px] h-32 w-36 items-center justify-end"
        style={{ pointerEvents: "none" }}
      >
        <Image
          source={chairBluuImage}
          contentFit="contain"
          style={{ width: 128, height: 196 }}
        />
      </View>
      <View className="absolute -top-[3.4rem] left-0 z-10">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="계산 기록 열기"
          className="h-11 w-11 items-center justify-center rounded-full border-2 border-black/35 bg-card active:scale-95"
          onPress={onToggleHistory}
        >
          <Text className="text-xl font-bold text-muted-foreground">↺</Text>
        </Pressable>
      </View>

      <View className="min-h-32 justify-between gap-4">
        <Pressable
          onPress={handleCopyExpression}
          className="h-8 justify-start active:opacity-50"
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="head"
            adjustsFontSizeToFit
            minimumFontScale={0.86}
            className="text-right text-lg leading-6 text-muted-foreground"
          >
            {displayExpression}
          </Text>
        </Pressable>

        <View className="relative h-20 flex-row items-end">
          <Pressable
            onPress={handleCopyValue}
            className="h-20 flex-1 justify-end active:opacity-50"
          >
            <View
              className="h-20 justify-end overflow-hidden"
              onLayout={(event) => {
                setResultRailWidth(event.nativeEvent.layout.width);
              }}
            >
              <ScrollView
                ref={resultScrollRef}
                horizontal
                bounces={false}
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                onContentSizeChange={(width) => setResultContentWidth(width)}
                onScroll={(event) => {
                  setResultScrollX(event.nativeEvent.contentOffset.x);
                }}
                contentContainerStyle={{
                  flexGrow: 1,
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                }}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                  className="text-right text-5xl font-extrabold text-foreground"
                >
                  {displayValue}
                </Text>
              </ScrollView>
            </View>
          </Pressable>

          {canScrollLeft && (
            <View className="absolute bottom-1.5 left-0 z-10 items-center justify-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="결과값 왼쪽으로 이동"
                onPress={() => scrollResultBy(-RESULT_SCROLL_STEP)}
                className="h-9 w-9 items-center justify-center rounded-full border border-black/20 bg-card/95"
              >
                <MaterialIcons name="chevron-left" size={26} color="#334155" />
              </Pressable>
            </View>
          )}

          {canScrollRight && (
            <View className="absolute bottom-1.5 right-0 z-10 items-center justify-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="결과값 오른쪽으로 이동"
                onPress={() => scrollResultBy(RESULT_SCROLL_STEP)}
                className="h-9 w-9 items-center justify-center rounded-full border border-black/20 bg-card/85"
              >
                <MaterialIcons name="chevron-right" size={26} color="#334155" />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
