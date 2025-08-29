// Tree data structure and traversal algorithms

export class TreeNode {
  value: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  visited: boolean = false;
  processing: boolean = false;

  constructor(value: number) {
    this.value = value;
  }
}

export interface TreeStep {
  type: 'visit' | 'process' | 'complete';
  node: TreeNode;
  path: number[];
  message: string;
  traversalOrder: number[];
}

export class BinarySearchTree {
  root: TreeNode | null = null;

  insert(value: number): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: TreeNode | null, value: number): TreeNode {
    if (node === null) {
      return new TreeNode(value);
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    }

    return node;
  }

  async inorderTraversal(onStep?: (step: TreeStep) => Promise<void>): Promise<number[]> {
    const result: number[] = [];
    const path: number[] = [];
    
    // Reset all nodes
    this.resetNodes(this.root);
    
    await this.inorderHelper(this.root, result, path, onStep);
    
    if (onStep) {
      await onStep({
        type: 'complete',
        node: this.root!,
        path,
        message: `Inorder traversal completed: ${result.join(' → ')}`,
        traversalOrder: [...result]
      });
    }
    
    return result;
  }

  private async inorderHelper(
    node: TreeNode | null, 
    result: number[], 
    path: number[],
    onStep?: (step: TreeStep) => Promise<void>
  ): Promise<void> {
    if (node === null) return;

    path.push(node.value);
    node.processing = true;

    if (onStep) {
      await onStep({
        type: 'visit',
        node,
        path: [...path],
        message: `Visiting node ${node.value}`,
        traversalOrder: [...result]
      });
    }

    // Traverse left subtree
    await this.inorderHelper(node.left, result, path, onStep);

    // Process current node
    node.visited = true;
    result.push(node.value);

    if (onStep) {
      await onStep({
        type: 'process',
        node,
        path: [...path],
        message: `Processing node ${node.value} (left subtree done)`,
        traversalOrder: [...result]
      });
    }

    // Traverse right subtree
    await this.inorderHelper(node.right, result, path, onStep);

    path.pop();
    node.processing = false;
  }

  async preorderTraversal(onStep?: (step: TreeStep) => Promise<void>): Promise<number[]> {
    const result: number[] = [];
    const path: number[] = [];
    
    // Reset all nodes
    this.resetNodes(this.root);
    
    await this.preorderHelper(this.root, result, path, onStep);
    
    if (onStep) {
      await onStep({
        type: 'complete',
        node: this.root!,
        path,
        message: `Preorder traversal completed: ${result.join(' → ')}`,
        traversalOrder: [...result]
      });
    }
    
    return result;
  }

  private async preorderHelper(
    node: TreeNode | null, 
    result: number[], 
    path: number[],
    onStep?: (step: TreeStep) => Promise<void>
  ): Promise<void> {
    if (node === null) return;

    path.push(node.value);
    node.processing = true;

    // Process current node first
    node.visited = true;
    result.push(node.value);

    if (onStep) {
      await onStep({
        type: 'process',
        node,
        path: [...path],
        message: `Processing node ${node.value} (root first)`,
        traversalOrder: [...result]
      });
    }

    // Traverse left subtree
    await this.preorderHelper(node.left, result, path, onStep);

    // Traverse right subtree
    await this.preorderHelper(node.right, result, path, onStep);

    path.pop();
    node.processing = false;
  }

  async postorderTraversal(onStep?: (step: TreeStep) => Promise<void>): Promise<number[]> {
    const result: number[] = [];
    const path: number[] = [];
    
    // Reset all nodes
    this.resetNodes(this.root);
    
    await this.postorderHelper(this.root, result, path, onStep);
    
    if (onStep) {
      await onStep({
        type: 'complete',
        node: this.root!,
        path,
        message: `Postorder traversal completed: ${result.join(' → ')}`,
        traversalOrder: [...result]
      });
    }
    
    return result;
  }

  private async postorderHelper(
    node: TreeNode | null, 
    result: number[], 
    path: number[],
    onStep?: (step: TreeStep) => Promise<void>
  ): Promise<void> {
    if (node === null) return;

    path.push(node.value);
    node.processing = true;

    if (onStep) {
      await onStep({
        type: 'visit',
        node,
        path: [...path],
        message: `Visiting node ${node.value}`,
        traversalOrder: [...result]
      });
    }

    // Traverse left subtree
    await this.postorderHelper(node.left, result, path, onStep);

    // Traverse right subtree
    await this.postorderHelper(node.right, result, path, onStep);

    // Process current node last
    node.visited = true;
    result.push(node.value);

    if (onStep) {
      await onStep({
        type: 'process',
        node,
        path: [...path],
        message: `Processing node ${node.value} (both subtrees done)`,
        traversalOrder: [...result]
      });
    }

    path.pop();
    node.processing = false;
  }

  private resetNodes(node: TreeNode | null): void {
    if (node === null) return;
    
    node.visited = false;
    node.processing = false;
    this.resetNodes(node.left);
    this.resetNodes(node.right);
  }

  // Helper method to get all nodes for visualization
  getAllNodes(): TreeNode[] {
    const nodes: TreeNode[] = [];
    this.collectNodes(this.root, nodes);
    return nodes;
  }

  private collectNodes(node: TreeNode | null, nodes: TreeNode[]): void {
    if (node === null) return;
    
    nodes.push(node);
    this.collectNodes(node.left, nodes);
    this.collectNodes(node.right, nodes);
  }

  // Calculate positions for visualization
  calculatePositions(canvasWidth: number, canvasHeight: number): Map<TreeNode, { x: number, y: number }> {
    const positions = new Map<TreeNode, { x: number, y: number }>();
    
    if (this.root) {
      this.assignPositions(this.root, canvasWidth / 2, 50, canvasWidth / 4, positions);
    }
    
    return positions;
  }

  private assignPositions(
    node: TreeNode, 
    x: number, 
    y: number, 
    horizontalSpacing: number,
    positions: Map<TreeNode, { x: number, y: number }>
  ): void {
    positions.set(node, { x, y });

    if (node.left) {
      this.assignPositions(
        node.left, 
        x - horizontalSpacing, 
        y + 80, 
        horizontalSpacing / 2,
        positions
      );
    }

    if (node.right) {
      this.assignPositions(
        node.right, 
        x + horizontalSpacing, 
        y + 80, 
        horizontalSpacing / 2,
        positions
      );
    }
  }
}

// Generate sample tree for visualization
export function createSampleTree(): BinarySearchTree {
  const tree = new BinarySearchTree();
  const values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45];
  
  values.forEach(value => tree.insert(value));
  
  return tree;
}

// Level order traversal (breadth-first)
export async function levelOrderTraversal(
  tree: BinarySearchTree,
  onStep?: (step: TreeStep) => Promise<void>
): Promise<number[]> {
  const result: number[] = [];
  
  if (!tree.root) return result;

  // Reset all nodes
  tree.getAllNodes().forEach(node => {
    node.visited = false;
    node.processing = false;
  });

  const queue: TreeNode[] = [tree.root];

  while (queue.length > 0) {
    const current = queue.shift()!;
    current.visited = true;
    result.push(current.value);

    if (onStep) {
      await onStep({
        type: 'process',
        node: current,
        path: [],
        message: `Processing node ${current.value} (level order)`,
        traversalOrder: [...result]
      });
    }

    // Add children to queue
    if (current.left) {
      queue.push(current.left);
      current.left.processing = true;
    }

    if (current.right) {
      queue.push(current.right);
      current.right.processing = true;
    }
  }

  if (onStep) {
    await onStep({
      type: 'complete',
      node: tree.root,
      path: [],
      message: `Level order traversal completed: ${result.join(' → ')}`,
      traversalOrder: [...result]
    });
  }

  return result;
}