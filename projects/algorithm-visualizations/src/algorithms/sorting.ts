// Sorting algorithm implementations with step tracking for visualization

export interface SortStep {
  type: 'compare' | 'swap' | 'set' | 'complete';
  indices: number[];
  values?: number[];
  message: string;
}

export async function bubbleSort(
  arr: number[], 
  onStep?: (step: SortStep, array: number[]) => Promise<void>
): Promise<number[]> {
  const result = [...arr];
  const n = result.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    
    for (let j = 0; j < n - i - 1; j++) {
      // Compare adjacent elements
      if (onStep) {
        await onStep({
          type: 'compare',
          indices: [j, j + 1],
          message: `Comparing elements at positions ${j} and ${j + 1}: ${result[j]} vs ${result[j + 1]}`
        }, [...result]);
      }

      if (result[j] > result[j + 1]) {
        // Swap elements
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;

        if (onStep) {
          await onStep({
            type: 'swap',
            indices: [j, j + 1],
            values: [result[j], result[j + 1]],
            message: `Swapped elements: ${result[j + 1]} and ${result[j]}`
          }, [...result]);
        }
      }
    }

    if (!swapped) break;
  }

  if (onStep) {
    await onStep({
      type: 'complete',
      indices: Array.from({ length: n }, (_, i) => i),
      message: 'Sorting completed!'
    }, [...result]);
  }

  return result;
}

export async function quickSort(
  arr: number[],
  onStep?: (step: SortStep, array: number[]) => Promise<void>,
  low: number = 0,
  high: number = arr.length - 1
): Promise<number[]> {
  const result = [...arr];

  if (low < high) {
    const pivotIndex = await partition(result, low, high, onStep);

    await quickSort(result, onStep, low, pivotIndex - 1);
    await quickSort(result, onStep, pivotIndex + 1, high);
  }

  return result;
}

async function partition(
  arr: number[],
  low: number,
  high: number,
  onStep?: (step: SortStep, array: number[]) => Promise<void>
): Promise<number> {
  const pivot = arr[high];
  let i = low - 1;

  if (onStep) {
    await onStep({
      type: 'set',
      indices: [high],
      message: `Selected pivot: ${pivot} at position ${high}`
    }, [...arr]);
  }

  for (let j = low; j < high; j++) {
    if (onStep) {
      await onStep({
        type: 'compare',
        indices: [j, high],
        message: `Comparing ${arr[j]} with pivot ${pivot}`
      }, [...arr]);
    }

    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];

      if (onStep) {
        await onStep({
          type: 'swap',
          indices: [i, j],
          values: [arr[i], arr[j]],
          message: `Moved ${arr[i]} to correct side of pivot`
        }, [...arr]);
      }
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

  if (onStep) {
    await onStep({
      type: 'swap',
      indices: [i + 1, high],
      values: [arr[i + 1], arr[high]],
      message: `Placed pivot ${arr[i + 1]} in correct position`
    }, [...arr]);
  }

  return i + 1;
}

export async function mergeSort(
  arr: number[],
  onStep?: (step: SortStep, array: number[]) => Promise<void>
): Promise<number[]> {
  const result = [...arr];
  await mergeSortHelper(result, 0, result.length - 1, onStep);
  return result;
}

async function mergeSortHelper(
  arr: number[],
  left: number,
  right: number,
  onStep?: (step: SortStep, array: number[]) => Promise<void>
): Promise<void> {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);

    await mergeSortHelper(arr, left, mid, onStep);
    await mergeSortHelper(arr, mid + 1, right, onStep);
    await merge(arr, left, mid, right, onStep);
  }
}

async function merge(
  arr: number[],
  left: number,
  mid: number,
  right: number,
  onStep?: (step: SortStep, array: number[]) => Promise<void>
): Promise<void> {
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);

  let i = 0, j = 0, k = left;

  while (i < leftArr.length && j < rightArr.length) {
    if (onStep) {
      await onStep({
        type: 'compare',
        indices: [left + i, mid + 1 + j],
        message: `Comparing ${leftArr[i]} and ${rightArr[j]} during merge`
      }, [...arr]);
    }

    if (leftArr[i] <= rightArr[j]) {
      arr[k] = leftArr[i];
      i++;
    } else {
      arr[k] = rightArr[j];
      j++;
    }

    if (onStep) {
      await onStep({
        type: 'set',
        indices: [k],
        values: [arr[k]],
        message: `Placed ${arr[k]} in merged position ${k}`
      }, [...arr]);
    }

    k++;
  }

  while (i < leftArr.length) {
    arr[k] = leftArr[i];
    if (onStep) {
      await onStep({
        type: 'set',
        indices: [k],
        values: [arr[k]],
        message: `Placed remaining element ${arr[k]}`
      }, [...arr]);
    }
    i++;
    k++;
  }

  while (j < rightArr.length) {
    arr[k] = rightArr[j];
    if (onStep) {
      await onStep({
        type: 'set',
        indices: [k],
        values: [arr[k]],
        message: `Placed remaining element ${arr[k]}`
      }, [...arr]);
    }
    j++;
    k++;
  }
}

export async function heapSort(
  arr: number[],
  onStep?: (step: SortStep, array: number[]) => Promise<void>
): Promise<number[]> {
  const result = [...arr];
  const n = result.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(result, n, i, onStep);
  }

  // Extract elements from heap one by one
  for (let i = n - 1; i >= 0; i--) {
    [result[0], result[i]] = [result[i], result[0]];

    if (onStep) {
      await onStep({
        type: 'swap',
        indices: [0, i],
        values: [result[0], result[i]],
        message: `Moved largest element ${result[i]} to sorted position`
      }, [...result]);
    }

    await heapify(result, i, 0, onStep);
  }

  if (onStep) {
    await onStep({
      type: 'complete',
      indices: Array.from({ length: n }, (_, i) => i),
      message: 'Heap sort completed!'
    }, [...result]);
  }

  return result;
}

async function heapify(
  arr: number[],
  n: number,
  i: number,
  onStep?: (step: SortStep, array: number[]) => Promise<void>
): Promise<void> {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }

  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];

    if (onStep) {
      await onStep({
        type: 'swap',
        indices: [i, largest],
        values: [arr[i], arr[largest]],
        message: `Heapifying: swapped ${arr[largest]} and ${arr[i]}`
      }, [...arr]);
    }

    await heapify(arr, n, largest, onStep);
  }
}

export function generateRandomArray(size: number, min: number = 1, max: number = 100): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}