// Searching algorithm implementations with step tracking

export interface SearchStep {
  type: 'compare' | 'found' | 'notFound' | 'narrowRange';
  indices: number[];
  target: number;
  message: string;
  range?: [number, number];
}

export async function linearSearch(
  arr: number[],
  target: number,
  onStep?: (step: SearchStep, array: number[]) => Promise<void>
): Promise<number> {
  for (let i = 0; i < arr.length; i++) {
    if (onStep) {
      await onStep({
        type: 'compare',
        indices: [i],
        target,
        message: `Checking position ${i}: ${arr[i]} === ${target}?`
      }, [...arr]);
    }

    if (arr[i] === target) {
      if (onStep) {
        await onStep({
          type: 'found',
          indices: [i],
          target,
          message: `Found ${target} at position ${i}!`
        }, [...arr]);
      }
      return i;
    }
  }

  if (onStep) {
    await onStep({
      type: 'notFound',
      indices: [],
      target,
      message: `Target ${target} not found in array`
    }, [...arr]);
  }

  return -1;
}

export async function binarySearch(
  arr: number[],
  target: number,
  onStep?: (step: SearchStep, array: number[]) => Promise<void>
): Promise<number> {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (onStep) {
      await onStep({
        type: 'compare',
        indices: [mid],
        target,
        range: [left, right],
        message: `Checking middle position ${mid}: ${arr[mid]} === ${target}?`
      }, [...arr]);
    }

    if (arr[mid] === target) {
      if (onStep) {
        await onStep({
          type: 'found',
          indices: [mid],
          target,
          message: `Found ${target} at position ${mid}!`
        }, [...arr]);
      }
      return mid;
    }

    if (arr[mid] < target) {
      left = mid + 1;
      if (onStep) {
        await onStep({
          type: 'narrowRange',
          indices: [mid],
          target,
          range: [left, right],
          message: `${arr[mid]} < ${target}, searching right half [${left}, ${right}]`
        }, [...arr]);
      }
    } else {
      right = mid - 1;
      if (onStep) {
        await onStep({
          type: 'narrowRange',
          indices: [mid],
          target,
          range: [left, right],
          message: `${arr[mid]} > ${target}, searching left half [${left}, ${right}]`
        }, [...arr]);
      }
    }
  }

  if (onStep) {
    await onStep({
      type: 'notFound',
      indices: [],
      target,
      message: `Target ${target} not found in array`
    }, [...arr]);
  }

  return -1;
}

export async function jumpSearch(
  arr: number[],
  target: number,
  onStep?: (step: SearchStep, array: number[]) => Promise<void>
): Promise<number> {
  const n = arr.length;
  const jumpSize = Math.floor(Math.sqrt(n));
  let prev = 0;

  // Find the block where element is present
  while (arr[Math.min(jumpSize, n) - 1] < target) {
    if (onStep) {
      await onStep({
        type: 'compare',
        indices: [Math.min(jumpSize, n) - 1],
        target,
        range: [prev, Math.min(jumpSize, n) - 1],
        message: `Jumping to position ${Math.min(jumpSize, n) - 1}: ${arr[Math.min(jumpSize, n) - 1]} < ${target}?`
      }, [...arr]);
    }

    prev = jumpSize;
    jumpSize += Math.floor(Math.sqrt(n));

    if (prev >= n) {
      if (onStep) {
        await onStep({
          type: 'notFound',
          indices: [],
          target,
          message: `Jumped past array bounds, ${target} not found`
        }, [...arr]);
      }
      return -1;
    }
  }

  // Linear search in the identified block
  if (onStep) {
    await onStep({
      type: 'narrowRange',
      indices: [],
      target,
      range: [prev, Math.min(jumpSize, n) - 1],
      message: `Found potential block [${prev}, ${Math.min(jumpSize, n) - 1}], doing linear search`
    }, [...arr]);
  }

  while (arr[prev] < target) {
    if (onStep) {
      await onStep({
        type: 'compare',
        indices: [prev],
        target,
        message: `Linear search: checking position ${prev}: ${arr[prev]} === ${target}?`
      }, [...arr]);
    }

    prev++;

    if (prev === Math.min(jumpSize, n)) {
      if (onStep) {
        await onStep({
          type: 'notFound',
          indices: [],
          target,
          message: `Reached end of block, ${target} not found`
        }, [...arr]);
      }
      return -1;
    }
  }

  if (arr[prev] === target) {
    if (onStep) {
      await onStep({
        type: 'found',
        indices: [prev],
        target,
        message: `Found ${target} at position ${prev}!`
      }, [...arr]);
    }
    return prev;
  }

  if (onStep) {
    await onStep({
      type: 'notFound',
      indices: [],
      target,
      message: `Target ${target} not found in array`
    }, [...arr]);
  }

  return -1;
}

export async function interpolationSearch(
  arr: number[],
  target: number,
  onStep?: (step: SearchStep, array: number[]) => Promise<void>
): Promise<number> {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right && target >= arr[left] && target <= arr[right]) {
    if (left === right) {
      if (onStep) {
        await onStep({
          type: 'compare',
          indices: [left],
          target,
          message: `Single element left at position ${left}: ${arr[left]} === ${target}?`
        }, [...arr]);
      }

      if (arr[left] === target) {
        if (onStep) {
          await onStep({
            type: 'found',
            indices: [left],
            target,
            message: `Found ${target} at position ${left}!`
          }, [...arr]);
        }
        return left;
      }
      break;
    }

    // Calculate probe position using interpolation
    const pos = left + Math.floor(
      ((target - arr[left]) / (arr[right] - arr[left])) * (right - left)
    );

    if (onStep) {
      await onStep({
        type: 'compare',
        indices: [pos],
        target,
        range: [left, right],
        message: `Interpolated position ${pos}: ${arr[pos]} === ${target}?`
      }, [...arr]);
    }

    if (arr[pos] === target) {
      if (onStep) {
        await onStep({
          type: 'found',
          indices: [pos],
          target,
          message: `Found ${target} at position ${pos}!`
        }, [...arr]);
      }
      return pos;
    }

    if (arr[pos] < target) {
      left = pos + 1;
      if (onStep) {
        await onStep({
          type: 'narrowRange',
          indices: [pos],
          target,
          range: [left, right],
          message: `${arr[pos]} < ${target}, searching right half [${left}, ${right}]`
        }, [...arr]);
      }
    } else {
      right = pos - 1;
      if (onStep) {
        await onStep({
          type: 'narrowRange',
          indices: [pos],
          target,
          range: [left, right],
          message: `${arr[pos]} > ${target}, searching left half [${left}, ${right}]`
        }, [...arr]);
      }
    }
  }

  if (onStep) {
    await onStep({
      type: 'notFound',
      indices: [],
      target,
      message: `Target ${target} not found in array`
    }, [...arr]);
  }

  return -1;
}

export function generateSortedArray(size: number, min: number = 1, max: number = 100): number[] {
  const arr = Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  return arr.sort((a, b) => a - b);
}