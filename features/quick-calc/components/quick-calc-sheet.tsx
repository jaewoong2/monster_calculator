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
  unitPriceSchema,
  interestSchema,
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
  "unit-price": {
    sheetTitle: "단가/가성비를 비교해볼게요",
    sheetSubtitle: "두 상품의 가격과 용량을 입력해주세요",
    ctaLabel: "비교하기",
    fieldErrors: {
      priceA: "A 가격을 입력해주세요",
      quantityA: "A 용량을 입력해주세요",
      priceB: "B 가격을 입력해주세요",
      quantityB: "B 용량을 입력해주세요",
    },
  },
  interest: {
    sheetTitle: "간단 이자를 계산해볼게요",
    sheetSubtitle: "원금과 이자율, 기간을 입력해주세요",
    ctaLabel: "만기 금액 보기",
    fieldErrors: {
      principal: "원금을 입력해주세요",
      rate: "이자율을 입력해주세요",
      period: "기간을 입력해주세요",
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

  if (type === "unit-price") {
    return unitPriceSchema.safeParse(values);
  }

  if (type === "interest") {
    return interestSchema.safeParse(values);
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

  if (type === "unit-price") {
    const parsed = unitPriceSchema.safeParse(values);

    if (!parsed.success) {
      return null;
    }

    const { priceA, quantityA, priceB, quantityB } = parsed.data;
    const unitPriceA = priceA / quantityA;
    const unitPriceB = priceB / quantityB;

    let headline = "";
    let detail = "";

    if (unitPriceA < unitPriceB) {
      headline = "A 상품이 더 저렴해요!";
      detail = `1단위 당 A는 ${numberFormatter.format(unitPriceA)}원, B는 ${numberFormatter.format(unitPriceB)}원`;
    } else if (unitPriceA > unitPriceB) {
      headline = "B 상품이 더 저렴해요!";
      detail = `1단위 당 B는 ${numberFormatter.format(unitPriceB)}원, A는 ${numberFormatter.format(unitPriceA)}원`;
    } else {
      headline = "두 상품의 가성비가 같아요!";
      detail = `1단위 당 ${numberFormatter.format(unitPriceA)}원으로 동일해요`;
    }

    return { headline, detail };
  }

  if (type === "interest") {
    const parsed = interestSchema.safeParse(values);

    if (!parsed.success) {
      return null;
    }

    const { principal, rate, period } = parsed.data;
    // 예금 단리 계산: 원금 * 이자율 * (기간/12)
    const grossInterest = principal * (rate / 100) * (period / 12);
    // 세금 (일반 과세 15.4%)
    const tax = grossInterest * 0.154;
    const netInterest = grossInterest - tax;
    const finalAmount = principal + netInterest;

    return {
      headline: `${formatWon(finalAmount)}`,
      detail: `세후 이자 ${formatWon(netInterest)} (세전 ${formatWon(grossInterest)})`,
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
        priceA: nextValues.priceA ?? "",
        quantityA: nextValues.quantityA ?? "",
        priceB: nextValues.priceB ?? "",
        quantityB: nextValues.quantityB ?? "",
        principal: nextValues.principal ?? "",
        period: nextValues.period ?? "",
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
