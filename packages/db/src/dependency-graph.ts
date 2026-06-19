/**
 * Story 1.3 — Curriculum Dependency Graph
 *
 * An in-memory directed graph module for curriculum ConceptSpec data.
 * Supports topological sort (Kahn's algorithm), DFS-based cycle detection,
 * reachability queries, and forward/reverse dependency lookups.
 *
 * Edge direction: adjacency.get(X) = [deps of X], meaning X depends on those deps.
 *   - getDependencies(X) = [concepts that X depends on] (prerequisites)
 *   - getDependents(X) = [concepts that list X as a dependency] (follow-ups)
 */

import type { ConceptSpec } from './concept-schema';

/**
 * In-memory directed graph for curriculum concept dependencies.
 */
export class ConceptDependencyGraph {
  /**
   * Forward adjacency: conceptId → list of its dependencies (prerequisites).
   * If B depends on A, then adjacency.get(B) includes A.
   * Edge direction: B → A  ("B points to its prerequisite A")
   */
  private adjacency: Map<string, string[]>;

  /**
   * Reverse adjacency: conceptId → list of concepts that depend on it.
   * If B depends on A, then dependents.get(A) includes B.
   */
  private dependents: Map<string, string[]>;

  private conceptIds: Set<string>;

  /**
   * Build the graph from an array of ConceptSpec objects.
   * Concepts with no dependencies are included as nodes with empty
   * dependency lists.
   */
  constructor(concepts: ConceptSpec[]) {
    this.adjacency = new Map();
    this.dependents = new Map();
    this.conceptIds = new Set();

    // Index all concept IDs
    for (const concept of concepts) {
      this.conceptIds.add(concept.conceptId);
    }

    // Build adjacency and reverse-adjacency
    for (const concept of concepts) {
      const deps = concept.dependencies || [];
      this.adjacency.set(concept.conceptId, [...deps]);
      this.dependents.set(concept.conceptId, []);
    }

    // Populate reverse edges
    for (const [id, deps] of this.adjacency) {
      for (const dep of deps) {
        if (this.conceptIds.has(dep)) {
          const depList = this.dependents.get(dep) ?? [];
          depList.push(id);
          this.dependents.set(dep, depList);
        }
      }
    }
  }

  // ─── Query methods ──────────────────────────────────────────────

  /**
   * Return the direct dependencies of `conceptId` (concepts that
   * `conceptId` depends on — i.e. its prerequisites).
   * Returns empty array if concept not found.
   */
  getDependencies(conceptId: string): string[] {
    return this.adjacency.get(conceptId) ?? [];
  }

  /**
   * Return all concepts that directly depend on `conceptId`
   * (reverse edges — i.e. concepts that list `conceptId` as a
   * prerequisite).
   */
  getDependents(conceptId: string): string[] {
    return this.dependents.get(conceptId) ?? [];
  }

  /**
   * Return all concept IDs present in the graph.
   */
  getAllConceptIds(): string[] {
    return Array.from(this.conceptIds);
  }

  /**
   * Return true if `to` is reachable from `from` by following
   * dependency edges (i.e. `to` is a prerequisite of `from`,
   * transitively).
   *
   * Uses BFS traversal. Returns false if either concept doesn't exist.
   * Returns true if `from === to`.
   *
   * Example: If C depends on B and B depends on A, then
   *   isReachable('c', 'a') === true (A is a prerequisite of C)
   *   isReachable('a', 'c') === false
   */
  isReachable(from: string, to: string): boolean {
    if (!this.conceptIds.has(from) || !this.conceptIds.has(to)) {
      return false;
    }
    if (from === to) return true;

    const visited = new Set<string>();
    const queue: string[] = [from];
    visited.add(from);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const deps = this.adjacency.get(current) ?? [];
      for (const dep of deps) {
        if (dep === to) return true;
        if (!visited.has(dep)) {
          visited.add(dep);
          queue.push(dep);
        }
      }
    }

    return false;
  }

  // ─── Topological sort (Kahn's algorithm) ─────────────────────────

  /**
   * Return all concepts in topological order (dependencies first).
   * Uses Kahn's algorithm (BFS-based).
   *
   * If the graph contains cycles, returns a partial order of nodes
   * whose in-degree reached zero. Use detectCycles() first if you
   * need to guarantee a complete topological ordering.
   */
  topologicalSort(): string[] {
    // in-degree = number of dependencies (prerequisites) for each node
    const inDegree = new Map<string, number>();
    for (const id of this.conceptIds) {
      const deps = this.adjacency.get(id) ?? [];
      const validDeps = deps.filter((d) => this.conceptIds.has(d));
      inDegree.set(id, validDeps.length);
    }

    // Start with nodes that have no dependencies
    const queue: string[] = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) {
        queue.push(id);
      }
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      sorted.push(node);

      // When we satisfy node, decrement in-degree of all concepts
      // that depend on it (its dependents)
      const depsList = this.dependents.get(node) ?? [];
      for (const dependent of depsList) {
        const newDegree = (inDegree.get(dependent) ?? 1) - 1;
        inDegree.set(dependent, newDegree);
        if (newDegree === 0) {
          queue.push(dependent);
        }
      }
    }

    return sorted;
  }

  /**
   * Return a learning path starting from the given concepts, in
   * topological order. Includes the start concepts and all concepts
   * reachable from them by following dependent edges (forward).
   *
   * Example: If B depends on A and C depends on B, then
   *   getLearningPath(['a']) → ['a', 'b', 'c']
   *   getLearningPath(['b']) → ['b', 'c']
   */
  getLearningPath(startConceptIds: string[]): string[] {
    // BFS forward from start concepts following dependent edges
    const reachable = new Set<string>();
    const queue = [...startConceptIds];

    for (const id of queue) {
      if (reachable.has(id)) continue;
      reachable.add(id);
      const depsList = this.dependents.get(id) ?? [];
      for (const dependent of depsList) {
        if (!reachable.has(dependent)) {
          queue.push(dependent);
        }
      }
    }

    // Return topological sort restricted to reachable nodes
    const fullTopo = this.topologicalSort();
    return fullTopo.filter((id) => reachable.has(id));
  }

  // ─── Cycle detection ────────────────────────────────────────────

  /**
   * Detect all cycles in the graph using DFS with recursion tracking.
   *
   * Returns an array of cycles, where each cycle is an array of
   * conceptId strings forming the cycle (e.g. ["A", "B", "C"] for
   * A → B → C → A). Returns empty array if no cycles exist.
   */
  detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const parent = new Map<string, string | null>();

    for (const id of this.conceptIds) {
      if (!visited.has(id)) {
        this.dfsCycleDetect(id, visited, recStack, parent, cycles);
      }
    }

    // De-duplicate cycles: cycles can be detected from multiple
    // entry points. Keep only canonical rotations (smallest element first).
    return this.deduplicateCycles(cycles);
  }

  private dfsCycleDetect(
    node: string,
    visited: Set<string>,
    recStack: Set<string>,
    parent: Map<string, string | null>,
    cycles: string[][],
  ): void {
    visited.add(node);
    recStack.add(node);

    const deps = this.adjacency.get(node) ?? [];
    for (const dep of deps) {
      if (!this.conceptIds.has(dep)) continue;

      if (!visited.has(dep)) {
        parent.set(dep, node);
        this.dfsCycleDetect(dep, visited, recStack, parent, cycles);
      } else if (recStack.has(dep)) {
        // Found a cycle
        if (dep === node) {
          // Self-loop: node depends on itself
          cycles.push([dep]);
        } else {
          // Trace back from node to dep
          const cycle: string[] = [];
          let current: string | null = node;
          while (current !== null && current !== dep) {
            cycle.unshift(current);
            current = parent.get(current) ?? null;
          }
          cycle.unshift(dep);
          if (cycle.length >= 2) {
            cycles.push(cycle);
          }
        }
      }
    }

    recStack.delete(node);
  }

  /**
   * Deduplicate cycles. A cycle [A, B, C] could be detected as
   * [B, C, A] from a different entry. Keep only the canonical form
   * where the smallest element is first.
   */
  private deduplicateCycles(cycles: string[][]): string[][] {
    const seen = new Set<string>();
    const unique: string[][] = [];

    for (const cycle of cycles) {
      // Find minimal element index
      let minIdx = 0;
      for (let i = 1; i < cycle.length; i++) {
        if (cycle[i] < cycle[minIdx]) {
          minIdx = i;
        }
      }

      // Rotate so smallest element is first
      const canonical = [...cycle.slice(minIdx), ...cycle.slice(0, minIdx)];
      const key = canonical.join('->');

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(canonical);
      }
    }

    return unique;
  }
}
