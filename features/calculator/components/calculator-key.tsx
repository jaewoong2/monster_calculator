import { ImageBackground, ImageStyle, Pressable, Text } from "react-native";

export type CalculatorKeyTone = "number" | "operator" | "utility" | "equals";

type CalculatorKeyProps = {
  label: string;
  tone?: CalculatorKeyTone;
  wide?: boolean;
  onPress: () => void;
};

const smallBluuImage = require("../../../assets/images/small_bluu.png");
const smallHappyBluuImage = require("../../../assets/images/small_happy_bluu.png");

type KeyBgConfig = {
  source: number;
  imageStyle: ImageStyle;
};

const KEY_BG_CONFIG: Record<string, KeyBgConfig> = {
  "5": {
    source: smallBluuImage,
    imageStyle: {
      width: 80,
      height: 80,
      top: "-20%",
      left: "-40%",
      resizeMode: "contain",
      opacity: 0.9,
    },
  },
  "+": {
    source: smallHappyBluuImage,
    imageStyle: {
      width: 45,
      height: 45,
      top: "50%",
      left: "45%",
      resizeMode: "contain",
      opacity: 0.9,
    },
  },
};

const TONE_CLASS_NAMES: Record<CalculatorKeyTone, string> = {
  number: "bg-card border-black/70 border-2",
  operator: "bg-muted border-white/60 border-2",
  utility: "bg-primary/70 border-white/20 border-2",
  equals: "bg-secondary border-black/70 border-2",
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
  const bgConfig = KEY_BG_CONFIG[label];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`${wide ? "flex-[2]" : "flex-1"} relative min-h-16 rounded-2xl border-2 border-black ${TONE_CLASS_NAMES[tone]} active:scale-95 active:opacity-85`}
      onPress={onPress}
    >
      <ImageBackground
        source={bgConfig?.source}
        imageStyle={bgConfig?.imageStyle}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text className={`text-2xl font-bold ${TEXT_CLASS_NAMES[tone]}`}>
          {label}
        </Text>
      </ImageBackground>
    </Pressable>
  );
}
