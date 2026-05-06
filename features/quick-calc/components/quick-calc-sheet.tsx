import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Image, type ImageSource } from "expo-image";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Asset } from "expo-asset";
import {
  discountSchema,
  percentSchema,
  type QuickCalcFormValues,
  type QuickCalcType,
  splitBillSchema,
  tipSchema,
} from "../schema";
import { type QuickCalcField } from "./quick-calc-card";

const smallBluuImage = {
  uri: Asset.fromModule(require("@/assets/images/small3_bluu.png")).uri,
};

type QuickCalcSheetProps = {
  type: QuickCalcType;
  imageSource: ImageSource;
  fields: readonly QuickCalcField[];
  values: QuickCalcFormValues;
  onValuesChange: (values: QuickCalcFormValues) => void;
  submissionResetKey: number;
};

type QuickCalcCopy = {
  sheetTitle: string;
  sheetSubtitle: string;
  ctaLabel: string;
  fieldErrors: Partial<Record<keyof QuickCalcFormValues, string>>;
};

const COPY_BY_TYPE: Record<QuickCalcType, QuickCalcCopy> = {
  "split-bill": {
    sheetTitle: "얼마씩 내면 될까요?",
    sheetSubtitle: "총액과 사람 수를 알려주세요",
    ctaLabel: "나눠보기",
    fieldErrors: {
      amount: "총 금액을 입력해주세요",
      count: "인원을 입력해주세요",
    },
  },
  discount: {
    sheetTitle: "얼마에 살 수 있을까요?",
    sheetSubtitle: "가격과 할인율을 입력해주세요",
    ctaLabel: "할인 금액 보기",
    fieldErrors: {
      amount: "상품 금액을 입력해주세요",
      rate: "할인율을 입력해주세요",
    },
  },
  tip: {
    sheetTitle: "팁을 더하면 얼마일까요?",
    sheetSubtitle: "금액과 팁 비율을 입력해주세요",
    ctaLabel: "총 금액 보기",
    fieldErrors: {
      amount: "결제 금액을 입력해주세요",
      rate: "팁 비율을 입력해주세요",
    },
  },
  percent: {
    sheetTitle: "몇 퍼센트인지 계산해볼게요",
    sheetSubtitle: "기준 값과 비율을 입력해주세요",
    ctaLabel: "값 구하기",
    fieldErrors: {
      amount: "기준 값을 입력해주세요",
      rate: "비율을 입력해주세요",
    },
  },
};

const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2,
});

function formatWon(value: number) {
  return `${currencyFormatter.format(Math.round(value))}원`;
}

function parseQuickCalc(type: QuickCalcType, values: QuickCalcFormValues) {
  if (type === "split-bill") {
    return splitBillSchema.safeParse(values);
  }

  if (type === "discount") {
    return discountSchema.safeParse(values);
  }

  if (type === "tip") {
    return tipSchema.safeParse(values);
  }

  return percentSchema.safeParse(values);
}

function sanitizeNumericInput(
  value: string,
  inputMode?: "decimal" | "integer",
) {
  const normalized = value.replace(/[^\d.,]/g, "");

  if (inputMode === "integer") {
    return normalized.replace(/[^\d,]/g, "");
  }

  const [head, ...tail] = normalized.split(".");

  if (tail.length === 0) {
    return head;
  }

  return `${head}.${tail.join("").replaceAll(".", "")}`;
}

function getFieldError(
  parseResult: ReturnType<typeof parseQuickCalc>,
  fieldName: keyof QuickCalcFormValues,
  type: QuickCalcType,
  hasSubmitted: boolean,
) {
  if (!hasSubmitted) {
    return null;
  }

  if (parseResult.success) {
    return null;
  }

  const hasFieldIssue = parseResult.error.issues.some(
    (issue) => issue.path[0] === fieldName,
  );

  if (!hasFieldIssue) {
    return null;
  }

  return COPY_BY_TYPE[type].fieldErrors[fieldName] ?? null;
}

function buildResult(type: QuickCalcType, values: QuickCalcFormValues) {
  if (type === "split-bill") {
    const parsed = splitBillSchema.safeParse(values);

    if (!parsed.success) {
      return null;
    }

    const perPerson = Math.floor(parsed.data.amount / parsed.data.count);
    const remainder = Math.round(
      parsed.data.amount - perPerson * parsed.data.count,
    );

    return {
      headline: `1인당 ${formatWon(perPerson)}`,
      detail:
        remainder > 0
          ? `남는 ${currencyFormatter.format(remainder)}원은 따로 나눠요`
          : "딱 맞게 나눠져요",
    };
  }

  if (type === "discount") {
    const parsed = discountSchema.safeParse(values);

    if (!parsed.success) {
      return null;
    }

    const discountAmount = parsed.data.amount * (parsed.data.rate / 100);
    const finalAmount = parsed.data.amount - discountAmount;

    return {
      headline: `결제금액 ${formatWon(finalAmount)}`,
      detail: `${formatWon(discountAmount)} 할인돼요`,
    };
  }

  if (type === "tip") {
    const parsed = tipSchema.safeParse(values);

    if (!parsed.success) {
      return null;
    }

    const tipAmount = parsed.data.amount * (parsed.data.rate / 100);
    const finalAmount = parsed.data.amount + tipAmount;

    return {
      headline: `총 ${formatWon(finalAmount)}`,
      detail: `팁은 ${formatWon(tipAmount)}이에요`,
    };
  }

  const parsed = percentSchema.safeParse(values);

  if (!parsed.success) {
    return null;
  }

  const percentValue = parsed.data.amount * (parsed.data.rate / 100);

  return {
    headline: numberFormatter.format(percentValue),
    detail: `${numberFormatter.format(parsed.data.amount)}의 ${numberFormatter.format(parsed.data.rate)}%예요`,
  };
}

export function QuickCalcSheet({
  type,
  imageSource,
  fields,
  values,
  onValuesChange,
  submissionResetKey,
}: QuickCalcSheetProps) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { control, watch } = useForm<QuickCalcFormValues>({
    defaultValues: values,
    mode: "onChange",
  });
  const currentValues = watch();
  const parseResult = parseQuickCalc(type, currentValues);
  const result = hasSubmitted ? buildResult(type, currentValues) : null;
  const copy = COPY_BY_TYPE[type];

  useEffect(() => {
    const subscription = watch((nextValues) => {
      onValuesChange({
        amount: nextValues.amount ?? "",
        count: nextValues.count ?? "",
        rate: nextValues.rate ?? "",
      });
    });

    return () => subscription.unsubscribe();
  }, [onValuesChange, watch]);

  useEffect(() => {
    setHasSubmitted(false);
  }, [submissionResetKey, type]);

  return (
    <BottomSheetScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-5 pb-10 pt-2"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center gap-4">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary/15">
          <Image
            source={imageSource}
            contentFit="contain"
            style={{ width: 82, height: 82 }}
          />
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-2xl font-extrabold text-foreground"
          >
            {copy.sheetTitle}
          </Text>
          <Text
            numberOfLines={2}
            className="mt-1 text-sm font-semibold leading-5 text-muted-foreground"
          >
            {copy.sheetSubtitle}
          </Text>
        </View>
      </View>

      <View className="gap-3">
        {fields.map((field) => {
          const errorMessage = getFieldError(
            parseResult,
            field.name,
            type,
            hasSubmitted,
          );

          return (
            <View key={field.name} className="gap-1.5">
              <Text className="text-sm font-bold text-foreground">
                {field.label}
              </Text>
              <Controller
                control={control}
                name={field.name}
                render={({ field: { onBlur, onChange, value } }) => (
                  <BottomSheetTextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    keyboardType={field.keyboardType ?? "decimal-pad"}
                    onBlur={onBlur}
                    onChangeText={(nextValue) =>
                      onChange(sanitizeNumericInput(nextValue, field.inputMode))
                    }
                    value={value ?? ""}
                  />
                )}
              />
              {errorMessage ? (
                <Text className="text-xs font-semibold text-destructive">
                  {errorMessage}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <View className="relative flex-row items-center bg-primary/60 px-3 w-full rounded-3xl border-slate-300 border">
        <View className="">
          <Image
            source={smallBluuImage}
            contentFit="contain"
            style={{ width: 28, height: 28 }}
          />
        </View>
        {result ? (
          <View className="px-4 py-4">
            <Text className="mt-1 text-2xl font-extrabold text-primary-foreground">
              {result.headline}
            </Text>
            <Text className="mt-1 text-sm font-semibold text-primary-foreground/80">
              {result.detail}
            </Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.ctaLabel}
            className="min-h-14 items-center justify-center px-4 py-4 active:scale-[0.98]"
            onPress={() => setHasSubmitted(true)}
          >
            <Text className="text-base font-extrabold text-primary-foreground">
              {copy.ctaLabel}
            </Text>
          </Pressable>
        )}
      </View>
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderColor: "#d7e5f0",
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: "#eef8ff",
    color: "#1f2937",
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
