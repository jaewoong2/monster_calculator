import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { type CalculatorMascotMood } from '../store';

type BluuMascotProps = {
  mood: CalculatorMascotMood;
};

const timerBluuImage = {
  uri: Asset.fromModule(require('../../../assets/images/timer_bluu.png')).uri,
};
const welcomeBluuImage = {
  uri: Asset.fromModule(require('../../../assets/images/welcome_bluu.png')).uri,
};
const winkBluuImage = {
  uri: Asset.fromModule(require('../../../assets/images/wink_bluu.png')).uri,
};

const MASCOT_SOURCE_BY_MOOD = {
  idle: welcomeBluuImage,
  input: welcomeBluuImage,
  thinking: timerBluuImage,
  success: winkBluuImage,
  error: welcomeBluuImage,
} as const;

export function BluuMascot({ mood }: BluuMascotProps) {
  const float = useSharedValue(0);
  const bounce = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(withSequence(withTiming(-6, { duration: 900 }), withTiming(0, { duration: 900 })), -1, true);
  }, [float]);

  useEffect(() => {
    if (mood === 'success') {
      bounce.value = withSequence(withSpring(1.14, { damping: 7, stiffness: 220 }), withSpring(1));
    }

    if (mood === 'input') {
      bounce.value = withSequence(withSpring(1.05, { damping: 9, stiffness: 240 }), withSpring(1));
    }

    if (mood === 'error') {
      shake.value = withSequence(
        withTiming(-8, { duration: 45 }),
        withTiming(8, { duration: 45 }),
        withTiming(-5, { duration: 45 }),
        withTiming(0, { duration: 45 }),
      );
    }
  }, [bounce, mood, shake]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: mood === 'thinking' ? 0.96 : 1,
    transform: [{ translateY: float.value }, { translateX: shake.value }, { scale: bounce.value }],
  }));

  return (
    <Animated.View
      className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-primary/10"
      style={animatedStyle}>
      <Image
        source={MASCOT_SOURCE_BY_MOOD[mood]}
        contentFit="contain"
        style={{ width: 116, height: 116 }}
      />
      {mood === 'error' ? (
        <View className="absolute right-5 top-4 h-3 w-3 rounded-full bg-secondary" />
      ) : null}
    </Animated.View>
  );
}
