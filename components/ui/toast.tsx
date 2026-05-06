import { Asset } from "expo-asset";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import {
  type ToastConfig,
  type ToastConfigParams,
} from "react-native-toast-message";

type ToastTone = "success" | "error" | "info";

const smallBluuImage = {
  uri: Asset.fromModule(require("../../assets/images/small3_bluu.png")).uri,
};

const TOAST_CONTAINER_CLASS_NAMES: Record<ToastTone, string> = {
  success: "border-[#a7dfff] bg-[#eaf7ff]",
  error: "border-destructive/25 bg-[#fff0f1]",
  info: "border-[#c9e9fb] bg-[#eef9ff]",
};

const TOAST_TEXT_CLASS_NAMES: Record<ToastTone, string> = {
  success: "text-[#2d6fb5]",
  error: "text-destructive",
  info: "text-[#2d6fb5]",
};

function ToastContent({
  text1,
  text2,
  tone,
}: {
  text1?: string;
  text2?: string;
  tone: ToastTone;
}) {
  return (
    <View
      className={`w-[88%] max-w-[380px] flex-row items-center gap-2.5 rounded-full border px-3 py-2 ${TOAST_CONTAINER_CLASS_NAMES[tone]}`}
    >
      <Image
        source={smallBluuImage}
        contentFit="contain"
        style={{ width: 28, height: 28 }}
      />
      <View className="min-w-0 flex-1">
        {text1 ? (
          <Text
            numberOfLines={1}
            className={`text-sm font-extrabold leading-5 ${TOAST_TEXT_CLASS_NAMES[tone]}`}
          >
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text
            numberOfLines={1}
            className={`text-xs font-bold leading-4 ${TOAST_TEXT_CLASS_NAMES[tone]}`}
          >
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }: ToastConfigParams<unknown>) => (
    <ToastContent tone="success" text1={text1} text2={text2} />
  ),
  error: ({ text1, text2 }: ToastConfigParams<unknown>) => (
    <ToastContent tone="error" text1={text1} text2={text2} />
  ),
  info: ({ text1, text2 }: ToastConfigParams<unknown>) => (
    <ToastContent tone="info" text1={text1} text2={text2} />
  ),
};
