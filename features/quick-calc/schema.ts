import { z } from 'zod';

export type QuickCalcType = 'split-bill' | 'discount' | 'tip' | 'percent';

const numericText = (label: string) =>
  z
    .string({ error: `${label}을 입력하세요` })
    .check(
      z.minLength(1, `${label}을 입력하세요`),
      z.refine((value) => {
        const normalized = value.replaceAll(',', '').trim();
        return Number.isFinite(Number(normalized)) && Number(normalized) > 0;
      }, `${label}은 0보다 큰 숫자로 입력하세요`),
    )
    .transform((value) => Number(value.replaceAll(',', '').trim()));

const integerText = (label: string) =>
  z
    .string({ error: `${label}을 입력하세요` })
    .check(
      z.minLength(1, `${label}을 입력하세요`),
      z.refine((value) => {
        const normalized = value.replaceAll(',', '').trim();
        const numberValue = Number(normalized);
        return Number.isInteger(numberValue) && numberValue > 0;
      }, `${label}은 1 이상의 정수로 입력하세요`),
    )
    .transform((value) => Number(value.replaceAll(',', '').trim()));

export const splitBillSchema = z.object({
  amount: numericText('총 금액'),
  count: integerText('인원수'),
});

export const discountSchema = z.object({
  amount: numericText('할인 전 금액'),
  rate: numericText('할인율'),
});

export const tipSchema = z.object({
  amount: numericText('총 금액'),
  rate: numericText('팁 비율'),
});

export const percentSchema = z.object({
  amount: numericText('기준 값'),
  rate: numericText('비율'),
});

export type QuickCalcFormValues = {
  amount: string;
  count?: string;
  rate?: string;
};
