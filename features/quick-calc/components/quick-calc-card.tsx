import { Image, type ImageSource } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { type QuickCalcFormValues, type QuickCalcType } from "../schema";

export type QuickCalcField = {
  name: keyof QuickCalcFormValues;
  label: string;
  placeholder: string;
  keyboardType?: "decimal-pad" | "number-pad";
  inputMode?: "decimal" | "integer";
};

type QuickCalcCardProps = {
  type: QuickCalcType;
  title: string;
  subtitle: string;
  imageSource: ImageSource;
  fields: readonly QuickCalcField[];
  onPress: () => void;
};

export function QuickCalcCard({
  title,
  subtitle,
  imageSource,
  onPress,
}: QuickCalcCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} 열기`}
      className="flex-row items-center gap-4 rounded-[28px] border border-primary/50 bg-card px-5 py-4 active:scale-[0.99]"
      onPress={onPress}
    >
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
          className="text-xl font-extrabold text-foreground"
        >
          {title}
        </Text>
        <Text
          numberOfLines={2}
          className="mt-1 text-sm font-semibold leading-5 text-muted-foreground"
        >
          {subtitle}
        </Text>
      </View>
      <View className="h-11 w-11 items-center justify-center rounded-full bg-muted">
        <Text className="text-2xl font-extrabold text-primary">›</Text>
      </View>
    </Pressable>
  );
}
