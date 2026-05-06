import { create } from 'zustand';

import { useCalculationHistoryStore } from '@/stores/calculation-history-store';

export type CalculatorOperator = '+' | '-' | '×' | '÷';

export type CalculatorMascotMood = 'idle' | 'input' | 'thinking' | 'success' | 'error';

type CalculatorState = {
  currentValue: string;
  previousValue: number | null;
  operator: CalculatorOperator | null;
  expression: string;
  errorMessage: string | null;
  isWaitingForOperand: boolean;
  justEvaluated: boolean;
  mascotMood: CalculatorMascotMood;
  inputDigit: (digit: string) => void;
  inputDecimal: () => void;
  chooseOperator: (operator: CalculatorOperator) => void;
  evaluate: () => void;
  clear: () => void;
  deleteLast: () => void;
};

const INITIAL_DISPLAY = '0';

function calculate(left: number, right: number, operator: CalculatorOperator) {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      if (right === 0) {
        return null;
      }
      return left / right;
  }
}

function formatResult(value: number) {
  if (!Number.isFinite(value)) {
    return '오류';
  }

  const rounded = Number.parseFloat(value.toPrecision(12));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

function parseDisplayValue(value: string) {
  return Number(value);
}

function appendOperatorToExpression(
  expression: string,
  operator: CalculatorOperator,
  currentValue: string,
) {
  const baseExpression = expression.trim() || INITIAL_DISPLAY;

  if (baseExpression.endsWith('=')) {
    return `${currentValue} ${operator}`;
  }

  if (/[+\-×÷]$/.test(baseExpression)) {
    return `${baseExpression.slice(0, -1).trim()} ${operator}`;
  }

  return `${baseExpression} ${operator}`;
}

function updateCurrentOperandExpression(
  expression: string,
  current: string,
  isWaitingForOperand: boolean,
) {
  if (!expression || expression.endsWith('=')) {
    return current;
  }

  if (isWaitingForOperand || /[+\-×÷]$/.test(expression.trim())) {
    return `${expression.trim()} ${current}`;
  }

  return expression.replace(/(-?\d+(?:\.\d*)?)$/, current);
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  currentValue: INITIAL_DISPLAY,
  previousValue: null,
  operator: null,
  expression: '',
  errorMessage: null,
  isWaitingForOperand: false,
  justEvaluated: false,
  mascotMood: 'idle',

  inputDigit: (digit) => {
    const state = get();

    if (state.errorMessage || state.justEvaluated) {
      set({
        currentValue: digit,
        previousValue: null,
        operator: null,
        expression: digit,
        errorMessage: null,
        isWaitingForOperand: false,
        justEvaluated: false,
        mascotMood: 'input',
      });
      return;
    }

    const currentValue =
      state.isWaitingForOperand || state.currentValue === INITIAL_DISPLAY
        ? digit
        : `${state.currentValue}${digit}`;

    set({
      currentValue,
      expression: updateCurrentOperandExpression(
        state.expression,
        currentValue,
        state.isWaitingForOperand,
      ),
      isWaitingForOperand: false,
      mascotMood: 'input',
    });
  },

  inputDecimal: () => {
    const state = get();

    if (state.errorMessage || state.justEvaluated) {
      set({
        currentValue: '0.',
        previousValue: null,
        operator: null,
        expression: '0.',
        errorMessage: null,
        isWaitingForOperand: false,
        justEvaluated: false,
        mascotMood: 'input',
      });
      return;
    }

    if (state.isWaitingForOperand) {
      set({
        currentValue: '0.',
        expression: updateCurrentOperandExpression(state.expression, '0.', true),
        isWaitingForOperand: false,
        mascotMood: 'input',
      });
      return;
    }

    if (state.currentValue.includes('.')) {
      return;
    }

    const currentValue = `${state.currentValue}.`;
    set({
      currentValue,
      expression: updateCurrentOperandExpression(state.expression, currentValue, false),
      mascotMood: 'input',
    });
  },

  chooseOperator: (nextOperator) => {
    const state = get();

    if (state.errorMessage) {
      set({
        currentValue: INITIAL_DISPLAY,
        previousValue: null,
        operator: nextOperator,
        expression: `${INITIAL_DISPLAY} ${nextOperator}`,
        errorMessage: null,
        isWaitingForOperand: true,
        justEvaluated: false,
        mascotMood: 'thinking',
      });
      return;
    }

    const inputValue = parseDisplayValue(state.currentValue);

    if (state.previousValue !== null && state.operator && !state.isWaitingForOperand) {
      const result = calculate(state.previousValue, inputValue, state.operator);

      if (result === null) {
        set({
          currentValue: '오류',
          previousValue: null,
          operator: null,
          expression: state.expression,
          errorMessage: '0으로 나눌 수 없습니다',
          isWaitingForOperand: true,
          justEvaluated: false,
          mascotMood: 'error',
        });
        return;
      }

      const currentValue = formatResult(result);
      set({
        currentValue,
        previousValue: result,
        operator: nextOperator,
        expression: appendOperatorToExpression(state.expression, nextOperator, currentValue),
        isWaitingForOperand: true,
        justEvaluated: false,
        mascotMood: 'thinking',
      });
      return;
    }

    set({
      previousValue: inputValue,
      operator: nextOperator,
      expression: appendOperatorToExpression(state.expression, nextOperator, state.currentValue),
      isWaitingForOperand: true,
      justEvaluated: false,
      mascotMood: 'thinking',
    });
  },

  evaluate: () => {
    const state = get();

    if (state.errorMessage || state.previousValue === null || state.operator === null) {
      return;
    }

    const inputValue = parseDisplayValue(state.currentValue);
    const result = calculate(state.previousValue, inputValue, state.operator);

    if (result === null) {
      set({
        currentValue: '오류',
        previousValue: null,
        operator: null,
        expression: `${state.expression} =`,
        errorMessage: '0으로 나눌 수 없습니다',
        isWaitingForOperand: true,
        justEvaluated: false,
        mascotMood: 'error',
      });
      return;
    }

    const currentValue = formatResult(result);
    const expression = `${state.expression} =`;

    useCalculationHistoryStore.getState().addEntry({
      expression,
      result: currentValue,
    });

    set({
      currentValue,
      previousValue: null,
      operator: null,
      expression,
      errorMessage: null,
      isWaitingForOperand: true,
      justEvaluated: true,
      mascotMood: 'success',
    });
  },

  clear: () => {
    set({
      currentValue: INITIAL_DISPLAY,
      previousValue: null,
      operator: null,
      expression: '',
      errorMessage: null,
      isWaitingForOperand: false,
      justEvaluated: false,
      mascotMood: 'idle',
    });
  },

  deleteLast: () => {
    const state = get();

    if (state.errorMessage || state.isWaitingForOperand || state.justEvaluated) {
      get().clear();
      return;
    }

    const currentValue =
      state.currentValue.length > 1 ? state.currentValue.slice(0, -1) : INITIAL_DISPLAY;

    set({
      currentValue,
      expression: updateCurrentOperandExpression(state.expression, currentValue, false),
      mascotMood: currentValue === INITIAL_DISPLAY ? 'idle' : 'input',
    });
  },
}));
