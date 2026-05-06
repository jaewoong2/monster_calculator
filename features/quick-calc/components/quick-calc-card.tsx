import { Image, type ImageSource } from 'expo-image';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';

import {
  discountSchema,
  percentSchema,
  type QuickCalcFormValues,
  type QuickCalcType,
  splitBillSchema,
  tipSchema,
} from '../schema';

type QuickCalcField = {
  name: keyof QuickCalcFormValues;
  label: string;
  placeholder: string;
  keyboardType?: 'decimal-pad' | 'number-pad';
};

type QuickCalcCardProps = {
  type: QuickCalcType;
  title: string;
  subtitle: string;
  imageSource: ImageSource;
  fields: readonly QuickCalcField[];
  isExpanded: boolean;
  onPress: () => void;
};

const currencyFormatter = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 2,
});

function formatWon(value: number) {
  return `${currencyFormatter.format(Math.round(value))}원`;
}

function parseQuickCalc(type: QuickCalcType, values: QuickCalcFormValues) {
  if (type === 'split-bill') {
    return splitBillSchema.safeParse(values);
  }

  if (type === 'discount') {
    return discountSchema.safeParse(values);
  }

  if (type === 'tip') {
    return tipSchema.safeParse(values);
  }

  return percentSchema.safeParse(values);
}

function getFieldError(
  parseResult: ReturnType<typeof parseQuickCalc>,
  fieldName: keyof QuickCalcFormValues,
) {
  if (parseResult.success) {
    return null;
  }

  return parseResult.error.issues.find((issue) => issue.path[0] === fieldName)?.message ?? null;
}

function buildResult(type: QuickCalcType, values: QuickCalcFormValues) {
  if (type === 'split-bill') {
    const parsed = splitBillSchema.safeParse(values);

    if (!parsed.success) {
      return null;
    }

    const perPerson = Math.floor(parsed.data.amount / parsed.data.count);
    const remainder = Math.round(parsed.data.amount - perPerson * parsed.data.count);

    return {
      headline: `1인당 ${formatWon(perPerson)}`,
      detail: remainder > 0 ? `남는 금액 ${formatWon(remainder)}은 따로 확인하세요` : '딱 맞게 나눠져요',
    };
  }

  if (type === 'discount') {
    const parsed = discountSchema.safeParse(values);

    if (!parsed.success) {
      return null;
    }

    const discountAmount = parsed.data.amount * (parsed.data.rate / 100);
    const finalAmount = parsed.data.amount - discountAmount;

    return {
      headline: `결제 금액 ${formatWon(finalAmount)}`,
      detail: `할인 금액은 ${formatWon(discountAmount)}입니다`,
    };
  }

  if (type === 'tip') {
    const parsed = tipSchema.safeParse(values);

    if (!parsed.success) {
      return null;
    }

    const tipAmount = parsed.data.amount * (parsed.data.rate / 100);
    const finalAmount = parsed.data.amount + tipAmount;

    return {
      headline: `총 ${formatWon(finalAmount)}`,
      detail: `팁은 ${formatWon(tipAmount)}입니다`,
    };
  }

  const parsed = percentSchema.safeParse(values);

  if (!parsed.success) {
    return null;
  }

  const percentValue = parsed.data.amount * (parsed.data.rate / 100);

  return {
    headline: `${numberFormatter.format(parsed.data.rate)}% 값은 ${numberFormatter.format(percentValue)}`,
    detail: `기준 값 ${numberFormatter.format(parsed.data.amount)}에서 계산했어요`,
  };
}

export function QuickCalcCard({
  type,
  title,
  subtitle,
  imageSource,
  fields,
  isExpanded,
  onPress,
}: QuickCalcCardProps) {
  const { control, watch } = useForm<QuickCalcFormValues>({
    defaultValues: {
      amount: '',
      count: '',
      rate: '',
    },
    mode: 'onChange',
  });
  const values = watch();
  const parseResult = parseQuickCalc(type, values);
  const result = buildResult(type, values);

  return (
    <View className="overflow-hidden rounded-[28px] border border-white/70 bg-card">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title} 열기`}
        className="flex-row items-center gap-4 px-5 py-4 active:scale-[0.99]"
        onPress={onPress}>
        <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary/15">
          <Image source={imageSource} contentFit="contain" style={{ width: 82, height: 82 }} />
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-xl font-extrabold text-foreground">
            {title}
          </Text>
          <Text numberOfLines={2} className="mt-1 text-sm font-semibold leading-5 text-muted-foreground">
            {subtitle}
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-full bg-muted">
          <Text className="text-2xl font-extrabold text-primary">{isExpanded ? '−' : '›'}</Text>
        </View>
      </Pressable>

      {isExpanded ? (
        <View className="gap-4 border-t border-border px-5 pb-5 pt-4">
          <View className="gap-3">
            {fields.map((field) => {
              const errorMessage = getFieldError(parseResult, field.name);

              return (
                <View key={field.name} className="gap-1.5">
                  <Text className="text-sm font-bold text-foreground">{field.label}</Text>
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: { onBlur, onChange, value } }) => (
                      <TextInput
                        className="rounded-2xl border border-border bg-background px-4 py-3 text-lg font-bold text-foreground"
                        placeholder={field.placeholder}
                        placeholderTextColor="#788594"
                        keyboardType={field.keyboardType ?? 'decimal-pad'}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errorMessage ? (
                    <Text className="text-xs font-semibold text-destructive">{errorMessage}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>

          <View className="rounded-3xl bg-primary px-4 py-4">
            {result ? (
              <>
                <Text className="text-sm font-bold text-primary-foreground/80">계산 결과</Text>
                <Text className="mt-1 text-2xl font-extrabold text-primary-foreground">
                  {result.headline}
                </Text>
                <Text className="mt-1 text-sm font-semibold text-primary-foreground/80">
                  {result.detail}
                </Text>
              </>
            ) : (
              <Text className="text-sm font-bold text-primary-foreground">
                값을 입력하면 바로 계산해요
              </Text>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}
