// Dynamic Programming algorithm implementations

export interface DPStep {
  type: 'calculate' | 'memoize' | 'lookup' | 'complete';
  indices?: number[];
  value?: number;
  subproblem?: string;
  message: string;
  memoTable?: Map<string, number> | number[];
}

// Fibonacci with memoization
export async function fibonacciDP(
  n: number,
  onStep?: (step: DPStep) => Promise<void>
): Promise<{ result: number; steps: DPStep[] }> {
  const memo = new Map<number, number>();
  const steps: DPStep[] = [];

  const fib = async (num: number): Promise<number> => {
    if (memo.has(num)) {
      const step: DPStep = {
        type: 'lookup',
        indices: [num],
        value: memo.get(num),
        message: `Looking up F(${num}) = ${memo.get(num)} from memo`,
        memoTable: new Map(memo)
      };
      steps.push(step);
      if (onStep) await onStep(step);
      return memo.get(num)!;
    }

    if (num <= 1) {
      memo.set(num, num);
      const step: DPStep = {
        type: 'calculate',
        indices: [num],
        value: num,
        message: `Base case: F(${num}) = ${num}`,
        memoTable: new Map(memo)
      };
      steps.push(step);
      if (onStep) await onStep(step);
      return num;
    }

    const step1: DPStep = {
      type: 'calculate',
      subproblem: `F(${num})`,
      message: `Calculating F(${num}) = F(${num-1}) + F(${num-2})`
    };
    steps.push(step1);
    if (onStep) await onStep(step1);

    const left = await fib(num - 1);
    const right = await fib(num - 2);
    const result = left + right;

    memo.set(num, result);

    const step2: DPStep = {
      type: 'memoize',
      indices: [num],
      value: result,
      message: `Memoizing F(${num}) = ${result}`,
      memoTable: new Map(memo)
    };
    steps.push(step2);
    if (onStep) await onStep(step2);

    return result;
  };

  const result = await fib(n);

  const completeStep: DPStep = {
    type: 'complete',
    value: result,
    message: `Fibonacci(${n}) = ${result}`,
    memoTable: new Map(memo)
  };
  steps.push(completeStep);
  if (onStep) await onStep(completeStep);

  return { result, steps };
}

// 0/1 Knapsack Problem
export interface KnapsackItem {
  weight: number;
  value: number;
  name: string;
}

export async function knapsackDP(
  items: KnapsackItem[],
  capacity: number,
  onStep?: (step: DPStep) => Promise<void>
): Promise<{ maxValue: number; selectedItems: KnapsackItem[]; table: number[][] }> {
  const n = items.length;
  const dp: number[][] = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));

  // Fill the DP table
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      const item = items[i - 1];

      if (item.weight <= w) {
        // We can include this item
        const includeValue = item.value + dp[i - 1][w - item.weight];
        const excludeValue = dp[i - 1][w];

        if (onStep) {
          await onStep({
            type: 'calculate',
            indices: [i, w],
            message: `Item ${item.name}: Include (${includeValue}) vs Exclude (${excludeValue})`,
            memoTable: dp.map(row => [...row])
          });
        }

        dp[i][w] = Math.max(includeValue, excludeValue);

        if (onStep) {
          await onStep({
            type: 'memoize',
            indices: [i, w],
            value: dp[i][w],
            message: `dp[${i}][${w}] = ${dp[i][w]} (${dp[i][w] === includeValue ? 'include' : 'exclude'} ${item.name})`,
            memoTable: dp.map(row => [...row])
          });
        }
      } else {
        // Item is too heavy, can't include it
        dp[i][w] = dp[i - 1][w];

        if (onStep) {
          await onStep({
            type: 'calculate',
            indices: [i, w],
            value: dp[i][w],
            message: `Item ${item.name} too heavy (${item.weight} > ${w}), carry forward: ${dp[i][w]}`,
            memoTable: dp.map(row => [...row])
          });
        }
      }
    }
  }

  // Backtrack to find selected items
  const selectedItems: KnapsackItem[] = [];
  let w = capacity;

  for (let i = n; i > 0 && w > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      const item = items[i - 1];
      selectedItems.unshift(item);
      w -= item.weight;

      if (onStep) {
        await onStep({
          type: 'lookup',
          indices: [i, w + item.weight],
          message: `Backtracking: Selected ${item.name} (weight: ${item.weight}, value: ${item.value})`,
          memoTable: dp.map(row => [...row])
        });
      }
    }
  }

  const maxValue = dp[n][capacity];

  if (onStep) {
    await onStep({
      type: 'complete',
      value: maxValue,
      message: `Knapsack completed! Max value: ${maxValue}, Selected: ${selectedItems.map(item => item.name).join(', ')}`,
      memoTable: dp.map(row => [...row])
    });
  }

  return { maxValue, selectedItems, table: dp };
}

// Longest Common Subsequence
export async function longestCommonSubsequence(
  str1: string,
  str2: string,
  onStep?: (step: DPStep) => Promise<void>
): Promise<{ length: number; lcs: string; table: number[][] }> {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  // Fill the DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const char1 = str1[i - 1];
      const char2 = str2[j - 1];

      if (char1 === char2) {
        dp[i][j] = dp[i - 1][j - 1] + 1;

        if (onStep) {
          await onStep({
            type: 'memoize',
            indices: [i, j],
            value: dp[i][j],
            message: `Match found: '${char1}' === '${char2}', dp[${i}][${j}] = ${dp[i][j]}`,
            memoTable: dp.map(row => [...row])
          });
        }
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);

        if (onStep) {
          await onStep({
            type: 'calculate',
            indices: [i, j],
            value: dp[i][j],
            message: `No match: '${char1}' !== '${char2}', dp[${i}][${j}] = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`,
            memoTable: dp.map(row => [...row])
          });
        }
      }
    }
  }

  // Backtrack to find the LCS
  let lcs = '';
  let i = m, j = n;

  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      lcs = str1[i - 1] + lcs;
      i--;
      j--;

      if (onStep) {
        await onStep({
          type: 'lookup',
          indices: [i + 1, j + 1],
          message: `Backtracking: Added '${str1[i]}' to LCS`,
          memoTable: dp.map(row => [...row])
        });
      }
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  const length = dp[m][n];

  if (onStep) {
    await onStep({
      type: 'complete',
      value: length,
      message: `LCS completed! Length: ${length}, Sequence: "${lcs}"`,
      memoTable: dp.map(row => [...row])
    });
  }

  return { length, lcs, table: dp };
}

// Coin Change Problem (minimum coins)
export async function coinChangeDP(
  coins: number[],
  amount: number,
  onStep?: (step: DPStep) => Promise<void>
): Promise<{ minCoins: number; coinSequence: number[]; table: number[] }> {
  const dp: number[] = Array(amount + 1).fill(Infinity);
  const coinUsed: number[] = Array(amount + 1).fill(-1);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    if (onStep) {
      await onStep({
        type: 'calculate',
        indices: [i],
        message: `Calculating minimum coins for amount ${i}`,
        memoTable: [...dp]
      });
    }

    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
        coinUsed[i] = coin;

        if (onStep) {
          await onStep({
            type: 'memoize',
            indices: [i],
            value: dp[i],
            message: `Using coin ${coin}: dp[${i}] = ${dp[i]} (from dp[${i - coin}] + 1)`,
            memoTable: [...dp]
          });
        }
      }
    }

    if (dp[i] === Infinity) {
      if (onStep) {
        await onStep({
          type: 'calculate',
          indices: [i],
          message: `No solution possible for amount ${i}`,
          memoTable: [...dp]
        });
      }
    }
  }

  // Backtrack to find coin sequence
  const coinSequence: number[] = [];
  let currentAmount = amount;

  while (currentAmount > 0 && coinUsed[currentAmount] !== -1) {
    const coin = coinUsed[currentAmount];
    coinSequence.push(coin);
    currentAmount -= coin;

    if (onStep) {
      await onStep({
        type: 'lookup',
        indices: [currentAmount + coin],
        message: `Backtracking: Used coin ${coin}, remaining amount: ${currentAmount}`,
        memoTable: [...dp]
      });
    }
  }

  const minCoins = dp[amount] === Infinity ? -1 : dp[amount];

  if (onStep) {
    await onStep({
      type: 'complete',
      value: minCoins,
      message: minCoins === -1 ? 
        'No solution possible' : 
        `Minimum coins: ${minCoins}, Coins used: [${coinSequence.join(', ')}]`,
      memoTable: [...dp]
    });
  }

  return { minCoins, coinSequence, table: dp };
}

// Sample data generators
export function generateKnapsackItems(): KnapsackItem[] {
  return [
    { name: 'Gold', weight: 10, value: 60 },
    { name: 'Silver', weight: 20, value: 100 },
    { name: 'Diamond', weight: 30, value: 120 },
    { name: 'Ruby', weight: 15, value: 80 },
    { name: 'Emerald', weight: 25, value: 90 }
  ];
}