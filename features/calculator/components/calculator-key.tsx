import { Asset } from "expo-asset";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

export type CalculatorKeyTone = "number" | "operator" | "utility" | "equals";

type CalculatorKeyProps = {
  label: string;
  tone?: CalculatorKeyTone;
  wide?: boolean;
  onPress: () => void;
};

const smallBluuImage = {
  uri: Asset.fromModule(require("../../../assets/images/small_bluu.png")).uri,
};

const TONE_CLASS_NAMES: Record<CalculatorKeyTone, string> = {
  number: "bg-card border-black/70 border-2",
  operator: "bg-muted border-white/60 border-2",
  utility: "bg-primary/70 border-white/20 border-2",
  equals: "bg-secondary border-secondary border-2",
};

const TEXT_CLASS_NAMES: Record<CalculatorKeyTone, string> = {
  number: "text-foreground",
  operator: "text-primary",
  utility: "text-primary-foreground",
  equals: "text-secondary-foreground",
};

export function CalculatorKey({
  label,
  tone = "number",
  wide = false,
  onPress,
}: CalculatorKeyProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`${wide ? "flex-[2]" : "flex-1"} relative min-h-16 items-center justify-center rounded-2xl border-2 border-black ${TONE_CLASS_NAMES[tone]} active:scale-95 active:opacity-85`}
      onPress={onPress}
    >
      <Text className={`text-2xl font-bold ${TEXT_CLASS_NAMES[tone]}`}>
        {label}
      </Text>
      {label === "5" && (
        <View className="top-0 -right-[65%] absolute">
          <Image
            source={smallBluuImage}
            contentFit="contain"
            style={{ width: 100, height: 100 }}
          />
        </View>
      )}
    </Pressable>
  );
}
