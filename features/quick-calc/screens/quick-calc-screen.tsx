import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Asset } from "expo-asset";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DottedBackground } from "@/components/dotted-background";

import { QuickCalcCard } from "../components/quick-calc-card";
import { QuickCalcSheet } from "../components/quick-calc-sheet";
import { type QuickCalcFormValues, type QuickCalcType } from "../schema";

const glassBluuImage = {
  uri: Asset.fromModule(require("../../../assets/images/glass_bluu.png")).uri,
};
const tagsBluuImage = {
  uri: Asset.fromModule(require("../../../assets/images/tags_bluu.png")).uri,
};
const thumbsBluuImage = {
  uri: Asset.fromModule(require("../../../assets/images/thumbs_bluu.png")).uri,
};
const welcomeBluuImage = {
  uri: Asset.fromModule(require("../../../assets/images/welcome_bluu.png")).uri,
};

const QUICK_CALC_CARDS = [
  {
    type: "split-bill",
    title: "나눠 내기",
    subtitle: "총액과 인원수만 입력해요",
    imageSource: welcomeBluuImage,
    fields: [
      {
        name: "amount",
        label: "총 금액",
        placeholder: "52,000",
        inputMode: "decimal",
      },
      {
        name: "count",
        label: "인원",
        placeholder: "10",
        keyboardType: "number-pad",
        inputMode: "integer",
      },
    ],
  },
  {
    type: "discount",
    title: "할인 계산",
    subtitle: "할인 후 가격을 바로 확인해요",
    imageSource: tagsBluuImage,
    fields: [
      {
        name: "amount",
        label: "상품 금액",
        placeholder: "52,000",
        inputMode: "decimal",
      },
      {
        name: "rate",
        label: "할인율",
        placeholder: "10",
        inputMode: "decimal",
      },
    ],
  },
  {
    type: "tip",
    title: "팁 계산",
    subtitle: "팁과 총 결제금액을 확인해요",
    imageSource: thumbsBluuImage,
    fields: [
      {
        name: "amount",
        label: "결제 금액",
        placeholder: "52,000",
        inputMode: "decimal",
      },
      {
        name: "rate",
        label: "팁 비율",
        placeholder: "10",
        inputMode: "decimal",
      },
    ],
  },
  {
    type: "percent",
    title: "퍼센트 계산",
    subtitle: "원하는 비율의 값을 구해요",
    imageSource: glassBluuImage,
    fields: [
      {
        name: "amount",
        label: "기준 값",
        placeholder: "52,000",
        inputMode: "decimal",
      },
      { name: "rate", label: "비율", placeholder: "10", inputMode: "decimal" },
    ],
  },
] as const;

const EMPTY_VALUES: QuickCalcFormValues = {
  amount: "",
  count: "",
  rate: "",
};

const INITIAL_VALUES_BY_TYPE: Record<QuickCalcType, QuickCalcFormValues> = {
  "split-bill": EMPTY_VALUES,
  discount: EMPTY_VALUES,
  tip: EMPTY_VALUES,
  percent: EMPTY_VALUES,
};

export function QuickCalcScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["58%", "90%"], []);
  const [selectedType, setSelectedType] = useState<QuickCalcType | null>(null);
  const [sheetOpenCount, setSheetOpenCount] = useState(0);
  const [valuesByType, setValuesByType] = useState(INITIAL_VALUES_BY_TYPE);
  const selectedCard =
    QUICK_CALC_CARDS.find((card) => card.type === selectedType) ?? null;

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleValuesChange = useCallback(
    (values: QuickCalcFormValues) => {
      if (!selectedType) {
        return;
      }

      setValuesByType((currentValues) => ({
        ...currentValues,
        [selectedType]: values,
      }));
    },
    [selectedType],
  );

  return (
    <DottedBackground>
      <SafeAreaView className="flex-1 bg-transparent" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-5 pb-8 pt-3"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-4">
            {QUICK_CALC_CARDS.map((card) => (
              <QuickCalcCard
                key={card.type}
                type={card.type}
                title={card.title}
                subtitle={card.subtitle}
                imageSource={card.imageSource}
                fields={card.fields}
                onPress={() => {
                  setSelectedType(card.type);
                  setSheetOpenCount((currentCount) => currentCount + 1);
                  bottomSheetRef.current?.snapToIndex(0);
                }}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        keyboardBehavior="fillParent"
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: "white" }}
        handleIndicatorStyle={{ backgroundColor: "#d4d4d8" }}
      >
        {selectedCard ? (
          <QuickCalcSheet
            key={selectedCard.type}
            type={selectedCard.type}
            imageSource={selectedCard.imageSource}
            fields={selectedCard.fields}
            values={valuesByType[selectedCard.type]}
            onValuesChange={handleValuesChange}
            submissionResetKey={sheetOpenCount}
          />
        ) : null}
      </BottomSheet>
    </DottedBackground>
  );
}
