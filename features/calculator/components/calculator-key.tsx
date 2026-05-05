import { Pressable, Text } from 'react-native';

export type CalculatorKeyTone = 'number' | 'operator' | 'utility' | 'equals';

type CalculatorKeyProps = {
  label: string;
  tone?: CalculatorKeyTone;
  wide?: boolean;
  onPress: () => void;
};

const TONE_CLASS_NAMES: Record<CalculatorKeyTone, string> = {
  number: 'bg-card border-white/70',
  operator: 'bg-muted border-white/60',
  utility: 'bg-primary/70 border-white/20',
  equals: 'bg-secondary border-secondary',
};

const TEXT_CLASS_NAMES: Record<CalculatorKeyTone, string> = {
  number: 'text-foreground',
  operator: 'text-primary',
  utility: 'text-primary-foreground',
  equals: 'text-secondary-foreground',
};

export function CalculatorKey({
  label,
  tone = 'number',
  wide = false,
  onPress,
}: CalculatorKeyProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`${wide ? 'flex-[2]' : 'flex-1'} h-16 items-center justify-center rounded-2xl border shadow-sm ${TONE_CLASS_NAMES[tone]} active:scale-95 active:opacity-85`}
      onPress={onPress}>
      <Text className={`text-2xl font-bold ${TEXT_CLASS_NAMES[tone]}`}>{label}</Text>
    </Pressable>
  );
}
