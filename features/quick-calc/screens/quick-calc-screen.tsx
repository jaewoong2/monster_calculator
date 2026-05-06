import { Asset } from 'expo-asset';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DottedBackground } from '@/components/dotted-background';

import { QuickCalcCard } from '../components/quick-calc-card';
import { type QuickCalcType } from '../schema';

const glassBluuImage = { uri: Asset.fromModule(require('../../../assets/images/glass_bluu.png')).uri };
const tagsBluuImage = { uri: Asset.fromModule(require('../../../assets/images/tags_bluu.png')).uri };
const thumbsBluuImage = { uri: Asset.fromModule(require('../../../assets/images/thumbs_bluu.png')).uri };
const welcomeBluuImage = { uri: Asset.fromModule(require('../../../assets/images/welcome_bluu.png')).uri };

const QUICK_CALC_CARDS = [
  {
    type: 'split-bill',
    title: '나눠 계산하기',
    subtitle: '총 금액을 인원수로 나눠 계산해요',
    imageSource: welcomeBluuImage,
    fields: [
      { name: 'amount', label: '총 금액', placeholder: '예: 48000' },
      { name: 'count', label: '인원수', placeholder: '예: 4', keyboardType: 'number-pad' },
    ],
  },
  {
    type: 'discount',
    title: '할인 계산하기',
    subtitle: '할인 전/후 금액을 쉽게 계산해요',
    imageSource: tagsBluuImage,
    fields: [
      { name: 'amount', label: '할인 전 금액', placeholder: '예: 39000' },
      { name: 'rate', label: '할인율', placeholder: '예: 15' },
    ],
  },
  {
    type: 'tip',
    title: '팁 계산하기',
    subtitle: '팁 금액과 총 금액을 간편하게 계산해요',
    imageSource: thumbsBluuImage,
    fields: [
      { name: 'amount', label: '총 금액', placeholder: '예: 52000' },
      { name: 'rate', label: '팁 비율', placeholder: '예: 10' },
    ],
  },
  {
    type: 'percent',
    title: '퍼센트 계산',
    subtitle: '퍼센트 값과 비율을 빠르게 구해요',
    imageSource: glassBluuImage,
    fields: [
      { name: 'amount', label: '기준 값', placeholder: '예: 50000' },
      { name: 'rate', label: '비율', placeholder: '예: 15' },
    ],
  },
] as const;

export function QuickCalcScreen() {
  const [expandedType, setExpandedType] = useState<QuickCalcType>('split-bill');

  return (
    <DottedBackground>
      <SafeAreaView className="flex-1 bg-transparent" edges={['top']}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-5 pb-8 pt-3"
          showsVerticalScrollIndicator={false}>
          <View className="flex-row items-end justify-between gap-5">
            <View className="flex-1">
              <Text className="text-5xl font-extrabold text-primary">빠른 계산</Text>
              <Text className="mt-1 text-base font-semibold text-muted-foreground">
                자주 쓰는 계산을 바로 해결해요
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Text className="text-3xl text-secondary">★</Text>
            </View>
          </View>

          <View className="gap-4">
            {QUICK_CALC_CARDS.map((card) => (
              <QuickCalcCard
                key={card.type}
                type={card.type}
                title={card.title}
                subtitle={card.subtitle}
                imageSource={card.imageSource}
                fields={card.fields}
                isExpanded={expandedType === card.type}
                onPress={() => setExpandedType(card.type)}
              />
            ))}
          </View>

          <View className="flex-row items-center gap-3 rounded-full bg-card/90 px-4 py-3">
            <Text className="text-xl">🔵</Text>
            <Text className="flex-1 text-sm font-bold text-primary">
              계산이 어렵다면 블루우가 도와줄게요!
            </Text>
            <Text className="text-xl text-secondary">✦</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </DottedBackground>
  );
}
