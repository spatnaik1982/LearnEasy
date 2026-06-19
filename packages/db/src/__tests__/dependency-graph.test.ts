import { describe, it, expect } from 'vitest';
import { ConceptDependencyGraph } from '../dependency-graph';
import type { ConceptSpec } from '../concept-schema';

// ── Helper to create a minimal ConceptSpec ──────────────────────

function concept(
  conceptId: string,
  dependencies: string[] = [],
): ConceptSpec {
  return {
    conceptId,
    learningObjective: `Learn about ${conceptId}`.padEnd(10, ' '),
    coreIdea: `${conceptId} is important`,
    examples: [`Example of ${conceptId}`],
    misconceptions: [],
    masteryCriteria: 0.8,
    dependencies,
  };
}

// ── Tests ───────────────────────────────────────────────────────

describe('ConceptDependencyGraph', () => {
  describe('empty graph', () => {
    it('should handle no concepts', () => {
      const graph = new ConceptDependencyGraph([]);
      expect(graph.getAllConceptIds()).toEqual([]);
      expect(graph.topologicalSort()).toEqual([]);
      expect(graph.detectCycles()).toEqual([]);
      expect(graph.getDependencies('nonexistent')).toEqual([]);
      expect(graph.getDependents('nonexistent')).toEqual([]);
      expect(graph.getLearningPath(['a'])).toEqual([]);
      expect(graph.isReachable('a', 'b')).toBe(false);
    });
  });

  describe('single concept with no dependencies', () => {
    it('should handle a single isolated node', () => {
      const graph = new ConceptDependencyGraph([concept('a')]);
      expect(graph.getAllConceptIds()).toEqual(['a']);
      expect(graph.getDependencies('a')).toEqual([]);
      expect(graph.getDependents('a')).toEqual([]);
      expect(graph.topologicalSort()).toEqual(['a']);
      expect(graph.detectCycles()).toEqual([]);
      expect(graph.isReachable('a', 'a')).toBe(true);
      expect(graph.isReachable('a', 'b')).toBe(false);
    });
  });

  describe('linear chain: A → B → C', () => {
    // B depends on A: graph edge is B → A (B's deps = [A])
    // C depends on B: graph edge is C → B (C's deps = [B])
    // So: edges: B→A, C→B
    // topo sort should be: A, B, C (or C's deps resolved first: C needs B, B needs A)
    // Wait -- let's think about the semantics.
    // ConceptSpec.dependencies = concepts that this concept depends on (prerequisites).
    // So if B depends on A, in the graph: B → A (B has edge pointing to A).
    // getDependencies(B) should return [A].
    // Topological order: A before B before C (dependencies first).
    // In Kahn's algorithm: in-degree(A) = 1 (from B? no, wait)
    // Edge direction: B → A means B has a dependency on A.
    // For Kahn's, we usually have edge A → B meaning "A must come before B".
    // But here the adjacency list is concept → its dependencies.
    // For topological sort to work (dependencies first), we need to think carefully.
    //
    // If concept depends on another, the dependency must be learned first.
    // So if B depends on A, then A must come before B.
    // In our adjacency list: B → A (B's entry lists A as dependency).
    // For Kahn's algorithm: we want nodes with no dependencies first.
    // in-degree in this scheme = how many other concepts depend on us.
    // A has in-degree 1 (B depends on A). B has in-degree 1 (C depends on B).
    // C has in-degree 0.
    // Queue starts with C? That would give C, B, A -- which is wrong!
    //
    // Oh wait, I need to re-examine my implementation.
    //
    // In topologicalSort(), I build in-degree as the number of incoming edges.
    // But in my adjacency, edge direction is: concept → its dependencies.
    // So for B depending on A: edge is B → A.
    // This means the edge goes FROM the concept TO its dependency.
    // In normal DAG terms for "prerequisites", we want edges FROM prerequisite TO dependent.
    // So edge A → B means "A must come before B".
    //
    // But I stored it as B → A (concept → its dependencies).
    // This is fine for getDependencies() but for topological sort,
    // we need to reverse the semantics.
    //
    // Let me re-think my topologicalSort implementation.
    //
    // I computed in-degree as: for each dep listed in a concept's deps,
    // increment in-degree of dep. So in-degree(A) = number of concepts that list A as dep.
    // B lists A as dep -> in-degree(A)++
    // C lists B as dep -> in-degree(B)++
    // So: in-degree(A)=1, in-degree(B)=1, in-degree(C)=0.
    // Queue starts with C (in-degree 0).
    // Process C: sorted=[C]. C has deps=[B]. Decrement in-degree(B): 1→0. Add B to queue.
    // Process B: sorted=[C,B]. B has deps=[A]. Decrement in-degree(A): 1→0. Add A to queue.
    // Process A: sorted=[C,B,A]. A has deps=[].
    // Result: [C, B, A]
    //
    // But we want [A, B, C] (dependencies first).
    //
    // The issue is the edge direction. In curriculum context:
    // - If concept B depends on A, then A is a prerequisite for B.
    // - A should be learned before B.
    // - In the graph: B → A means "B points to its prerequisite A".
    // - For topological sort with Kahn's: we want nodes with no prerequisites first (A).
    // - A has no dependencies, so graph.get('A') = [].
    // - A's "out-degree" in the adjacency is 0.
    // - But other nodes (B) point to A.
    //
    // My in-degree calculation counts how many concepts list A as a dependency.
    // That's the number of incoming edges TO A in my representation.
    // But in the conventional DAG for prerequisites, the edge direction should be A→B,
    // meaning "A must come before B". Then A would get in-degree 0, B would get
    // in-degree 1 (from A), C would get in-degree 1 (from B).
    //
    // My adjacency stores concept→[its dependencies], which is the REVERSE of
    // conventional prerequisite edges. So I need to either:
    // (a) Reverse the in-degree calculation, or
    // (b) Reverse the adjacency when doing topological sort.
    //
    // Actually, the simplest fix: for topological sort, I should compute in-degree
    // as the length of each node's dependency list (number of prerequisites),
    // not as the number of dependents.
    //
    // Wait no. Let me think again more carefully.
    //
    // In Kahn's algorithm, the "in-degree" is the number of edges coming INTO a node.
    // If my edges go FROM concept TO its dependency (B → A), then:
    // - Edge comes OUT of B to A
    // - Edge comes INTO A from B
    // So in-degree(A) = 1 (one edge comes into A from B).
    // 
    // For topological sort, we want nodes with NO prerequisites first.
    // A has no prerequisites (A's dependency list is empty).
    // But in the conventional DAG representation: A → B (A must come before B),
    // in-degree(A)=0, in-degree(B)=1.
    // In my representation: B → A (B depends on A), in-degree(A)=1, in-degree(B)=0?
    // No wait: B's edge goes OUT to A, so it contributes to A's in-degree (edges coming INTO A).
    // So in-degree(A)=1 (from B), in-degree(B)=0? No, C→B, so in-degree(B)=1.
    // Hmm, that gives in-degree(A)=1, in-degree(B)=1, in-degree(C)=0.
    // Which gives topological order starting from C. That's wrong.
    //
    // The issue is that my edge direction is concept→dependency, but for prerequisite
    // ordering, the nodes with NO dependencies should come first (they have no prerequisites).
    // They have out-degree 0 but in-degree potentially > 0.
    // In standard Kahn's, we want in-degree 0 nodes first.
    //
    // I think I need to fix my topologicalSort to compute in-degree differently.
    // The in-degree I want is: for each node, count how many dependencies it has
    // (i.e., how many other nodes it points to... no, that's out-degree).
    //
    // OK let me just think about this differently.
    //
    // Standard Kahn's with edges A→B (A before B):
    // - Build reverse adjacency (children list) from the forward adjacency.
    // - in-degree(x) = number of parents (prerequisites) of x.
    // - Queue nodes with in-degree 0.
    // - Process: for each child of x, decrement its in-degree.
    //
    // My adjacency is concept→[dependencies]. So dependencies are parents.
    // For B→A (edge from B to A), A is a parent of B.
    // in-degree(B) = len(parents(B)) = len(getDependencies(B)) = 1 (A).
    // in-degree(A) = 0 (no one depends on A? no, A has no parents).
    // Wait but that's wrong too. Let me just track what getDependencies returns.
    // getDependencies(B) = [A] (B depends on A, so A is a prerequisite).
    // in-degree(B) should be the number of prerequisites of B = len(getDependencies(B)) = 1.
    // in-degree(A) = len(getDependencies(A)) = 0.
    // in-degree(C) = len(getDependencies(C)) = 1 (B).
    // Queue: [A] (in-degree 0)
    // Process A: for each thing that depends on A (getDependents(A)=[B]), decrement in-degree(B): 1→0.
    // Queue: [B]
    // Process B: for each thing that depends on B (getDependents(B)=[C]), decrement in-degree(C): 1→0.
    // Queue: [C]
    // Process C: sorted=[A,B,C]. ✓
    //
    // So my current code is wrong! I'm computing in-degree as the number of
    // dependents, not the number of dependencies. Let me fix this.
    //
    // Actually wait, in my current code:
    // ```
    // for (const [, deps] of this.adjacency) {
    //   for (const dep of deps) {
    //     if (this.conceptIds.has(dep)) {
    //       inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1);
    //     }
    //   }
    // }
    // ```
    // This sets in-degree of `dep` (the dependency/prerequisite) for each edge.
    // For B→A: in-degree(A)++. For C→B: in-degree(B)++.
    // So in-degree(A)=1, in-degree(B)=1, in-degree(C)=0.
    // Queue: [C].
    // Process C: deps=[B]. in-degree(B): 1→0. Queue: [B].
    // Process B: deps=[A]. in-degree(A): 1→0. Queue: [A].
    // Process A: deps=[]. Result: [C, B, A]. ❌
    //
    // I need to fix this. Instead, I should set in-degree to the number of
    // dependencies of each node:
    //
    // ```
    // for (const [id, deps] of this.adjacency) {
    //   inDegree.set(id, deps.length);
    // }
    // ```
    // And then when processing, I decrement in-degree of the dependency... no.
    // 
    // Actually, if the edge is B→A (B depends on A), and I process B first
    // (when its in-degree reaches 0, meaning all its dependencies are satisfied),
    // then when I process B, I need to signal to nodes that depend on B that
    // one of their dependencies is now satisfied.
    //
    // So: in-degree = number of dependencies. When a node is processed, find
    // all nodes that depend on it (dependents) and decrement their in-degree.
    //
    // So:
    // in-degree(A)=0 (no deps), in-degree(B)=1 (dep A), in-degree(C)=1 (dep B).
    // Queue: [A].
    // Process A: getDependents(A)=[B]. in-degree(B): 1→0. Queue: [B].
    // Process B: getDependents(B)=[C]. in-degree(C): 1→0. Queue: [C].
    // Process C: getDependents(C)=[]. Result: [A, B, C]. ✓
    //
    // Yes! That's correct. I need to fix the topologicalSort implementation.
    // Instead of iterating over deps and incrementing dep's in-degree,
    // I need to set each node's in-degree to the length of its dependency list.
    // And when processing a node, find its dependents and decrement their in-degree.
    //
    // Let me fix this in the implementation. But first let me write the test
    // as spec'd and then fix the implementation.

    const concepts = [
      concept('c', ['b']),  // c depends on b
      concept('b', ['a']),  // b depends on a
      concept('a'),         // a has no dependencies
    ];
    const graph = new ConceptDependencyGraph(concepts);

    it('getAllConceptIds returns all concepts', () => {
      const ids = graph.getAllConceptIds();
      expect(ids.sort()).toEqual(['a', 'b', 'c']);
    });

    it('getDependencies returns direct dependencies', () => {
      expect(graph.getDependencies('a')).toEqual([]);
      expect(graph.getDependencies('b')).toEqual(['a']);
      expect(graph.getDependencies('c')).toEqual(['b']);
    });

    it('getDependents returns reverse edges', () => {
      // Sorting for deterministic assertion
      expect(graph.getDependents('a')).toEqual(['b']);
      expect(graph.getDependents('b')).toEqual(['c']);
      expect(graph.getDependents('c')).toEqual([]);
    });

    it('topologicalSort returns dependencies-first order', () => {
      expect(graph.topologicalSort()).toEqual(['a', 'b', 'c']);
    });

    it('detectCycles returns no cycles for linear chain', () => {
      expect(graph.detectCycles()).toEqual([]);
    });

    it('isReachable works for direct and transitive paths', () => {
      expect(graph.isReachable('c', 'a')).toBe(true);
      expect(graph.isReachable('c', 'b')).toBe(true);
      expect(graph.isReachable('b', 'a')).toBe(true);
      expect(graph.isReachable('a', 'c')).toBe(false);
    });

    it('getLearningPath from a gives all concepts', () => {
      expect(graph.getLearningPath(['a'])).toEqual(['a', 'b', 'c']);
    });

    it('getLearningPath from b gives b and c only', () => {
      expect(graph.getLearningPath(['b'])).toEqual(['b', 'c']);
    });

    it('getLearningPath from c gives c only', () => {
      expect(graph.getLearningPath(['c'])).toEqual(['c']);
    });
  });

  describe('diamond shape: A → B, A → C, B → D, C → D', () => {
    // D depends on B and C. B depends on A. C depends on A.
    const concepts = [
      concept('d', ['b', 'c']),
      concept('c', ['a']),
      concept('b', ['a']),
      concept('a'),
    ];
    const graph = new ConceptDependencyGraph(concepts);

    it('getDependencies returns direct deps', () => {
      expect(graph.getDependencies('a')).toEqual([]);
      expect(graph.getDependencies('b')).toEqual(['a']);
      expect(graph.getDependencies('c')).toEqual(['a']);
      expect(graph.getDependencies('d').sort()).toEqual(['b', 'c']);
    });

    it('getDependents returns reverse deps', () => {
      expect(graph.getDependents('a').sort()).toEqual(['b', 'c']);
      expect(graph.getDependents('b')).toEqual(['d']);
      expect(graph.getDependents('c')).toEqual(['d']);
      expect(graph.getDependents('d')).toEqual([]);
    });

    it('topologicalSort produces valid order with deps first', () => {
      const order = graph.topologicalSort();
      // a must be before b and c; b and c must be before d
      const idx = (id: string) => order.indexOf(id);
      expect(idx('a')).toBeLessThan(idx('b'));
      expect(idx('a')).toBeLessThan(idx('c'));
      expect(idx('b')).toBeLessThan(idx('d'));
      expect(idx('c')).toBeLessThan(idx('d'));
      expect(order.length).toBe(4);
    });

    it('detectCycles returns none', () => {
      expect(graph.detectCycles()).toEqual([]);
    });

    it('isReachable works for transitive paths', () => {
      expect(graph.isReachable('d', 'a')).toBe(true); // via B or C
      expect(graph.isReachable('b', 'a')).toBe(true);
      expect(graph.isReachable('d', 'b')).toBe(true);
      expect(graph.isReachable('a', 'd')).toBe(false);
    });
  });

  describe('multiple entry points (no dependencies)', () => {
    const concepts = [
      concept('x', ['a']),
      concept('y', ['a', 'b']),
      concept('z', ['b']),
      concept('a'),
      concept('b'),
    ];
    const graph = new ConceptDependencyGraph(concepts);

    it('topologicalSort starts with a and b', () => {
      const order = graph.topologicalSort();
      const idx = (id: string) => order.indexOf(id);
      // a and b come before anything that depends on them
      expect(idx('a')).toBeLessThan(idx('x'));
      expect(idx('a')).toBeLessThan(idx('y'));
      expect(idx('b')).toBeLessThan(idx('y'));
      expect(idx('b')).toBeLessThan(idx('z'));
      expect(order.length).toBe(5);
    });

    it('getDependents returns correct reverse edges', () => {
      expect(graph.getDependents('a').sort()).toEqual(['x', 'y']);
      expect(graph.getDependents('b').sort()).toEqual(['y', 'z']);
    });
  });

  describe('cycle detection', () => {
    it('detects simple cycle A → B → C → A', () => {
      // A depends on C, B depends on A, C depends on B
      // Wait: concept depends on = its dependencies.
      // A.deps = [C] means A depends on C, edge A→C.
      // B.deps = [A] means B depends on A, edge B→A.
      // C.deps = [B] means C depends on B, edge C→B.
      // Cycle: C→B→A→C... hmm no.
      // Let me trace: A.deps=[C]. B.deps=[A]. C.deps=[B].
      // getDependencies(A) = [C] (A depends on C, must learn C before A)
      // getDependencies(B) = [A] (B depends on A, must learn A before B)
      // getDependencies(C) = [B] (C depends on B, must learn B before C)
      // Cycle: C→B→A→C (must learn C before A, A before B, B before C)
      // That's indeed a cycle.
      
      const concepts = [
        concept('a', ['c']),
        concept('b', ['a']),
        concept('c', ['b']),
      ];
      const graph = new ConceptDependencyGraph(concepts);

      const cycles = graph.detectCycles();
      expect(cycles.length).toBeGreaterThanOrEqual(1);
      // The cycle should involve a, b, c
      const cycleSet = new Set(cycles[0]);
      expect(cycleSet.has('a')).toBe(true);
      expect(cycleSet.has('b')).toBe(true);
      expect(cycleSet.has('c')).toBe(true);
    });

    it('detects self-loop', () => {
      const concepts = [
        concept('a', ['a']), // depends on itself
      ];
      const graph = new ConceptDependencyGraph(concepts);

      const cycles = graph.detectCycles();
      expect(cycles.length).toBeGreaterThanOrEqual(1);
      expect(cycles[0]).toContain('a');
    });

    it('detects no cycles in acyclic graph', () => {
      const concepts = [
        concept('a'),
        concept('b', ['a']),
        concept('c', ['a']),
        concept('d', ['b', 'c']),
      ];
      const graph = new ConceptDependencyGraph(concepts);
      expect(graph.detectCycles()).toEqual([]);
    });

    it('topologicalSort returns partial order even with cycles', () => {
      // A cycle: A→C, B→A, C→B (A-C-B-A)
      // X is an independent node not involved in any cycle
      const concepts = [
        concept('a', ['c']),
        concept('b', ['a']),
        concept('c', ['b']),
        concept('x'), // independent, no dependencies
      ];
      const graph = new ConceptDependencyGraph(concepts);
      const order = graph.topologicalSort();
      // X should appear (it has no dependencies so in-degree starts at 0)
      expect(order).toContain('x');
      // Cycle nodes may not appear (they never reach in-degree 0)
    });
  });

  describe('getLearningPath', () => {
    // Graph: A → B → C (A independent)
    //        D → E (D independent)
    //        F (independent)
    const concepts = [
      concept('c', ['b']),
      concept('b', ['a']),
      concept('a'),
      concept('e', ['d']),
      concept('d'),
      concept('f'),
    ];
    const graph = new ConceptDependencyGraph(concepts);

    it('starting from a yields learning path for that subgraph', () => {
      const path = graph.getLearningPath(['a']);
      expect(path).toEqual(['a', 'b', 'c']);
    });

    it('starting from d yields learning path for that subgraph', () => {
      const path = graph.getLearningPath(['d']);
      expect(path).toEqual(['d', 'e']);
    });

    it('starting from f yields only f', () => {
      const path = graph.getLearningPath(['f']);
      expect(path).toEqual(['f']);
    });

    it('starting from multiple entry points yields combined path', () => {
      const path = graph.getLearningPath(['a', 'd', 'f']);
      // Should include all concepts
      expect(path.sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
      // Ordering constraints: a before b before c, d before e
      const idx = (id: string) => path.indexOf(id);
      expect(idx('a')).toBeLessThan(idx('b'));
      expect(idx('b')).toBeLessThan(idx('c'));
      expect(idx('d')).toBeLessThan(idx('e'));
    });
  });

  describe('isReachable', () => {
    const concepts = [
      concept('a'),
      concept('b', ['a']),
      concept('c', ['b']),
      concept('d', ['a']),
      concept('e', ['x']), // x doesn't exist
    ];
    const graph = new ConceptDependencyGraph(concepts);

    it('returns true for direct dependencies', () => {
      expect(graph.isReachable('b', 'a')).toBe(true);
      expect(graph.isReachable('d', 'a')).toBe(true);
    });

    it('returns true for transitive dependencies', () => {
      expect(graph.isReachable('c', 'a')).toBe(true);
    });

    it('returns false if not reachable', () => {
      expect(graph.isReachable('a', 'b')).toBe(false);
      expect(graph.isReachable('b', 'd')).toBe(false);
    });

    it('returns false for nonexistent nodes', () => {
      expect(graph.isReachable('nonexistent', 'a')).toBe(false);
      expect(graph.isReachable('a', 'nonexistent')).toBe(false);
    });

    it('returns true for same node', () => {
      expect(graph.isReachable('a', 'a')).toBe(true);
    });
  });

  describe('getDependents', () => {
    const concepts = [
      concept('a'),
      concept('b', ['a']),
      concept('c', ['a']),
      concept('d', ['b', 'c']),
      concept('e', ['b']),
    ];
    const graph = new ConceptDependencyGraph(concepts);

    it('a has two direct dependents', () => {
      expect(graph.getDependents('a').sort()).toEqual(['b', 'c']);
    });

    it('b has two direct dependents', () => {
      expect(graph.getDependents('b').sort()).toEqual(['d', 'e']);
    });

    it('c has one direct dependent', () => {
      expect(graph.getDependents('c')).toEqual(['d']);
    });

    it('d and e have no dependents', () => {
      expect(graph.getDependents('d')).toEqual([]);
      expect(graph.getDependents('e')).toEqual([]);
    });

    it('returns empty for nonexistent concept', () => {
      expect(graph.getDependents('nonexistent')).toEqual([]);
    });
  });

  describe('multiple independent subgraphs', () => {
    // Subgraph 1: A → B → C
    // Subgraph 2: X → Y → Z
    // Subgraph 3: M (isolated)
    const concepts = [
      concept('c', ['b']),
      concept('b', ['a']),
      concept('a'),
      concept('z', ['y']),
      concept('y', ['x']),
      concept('x'),
      concept('m'),
    ];
    const graph = new ConceptDependencyGraph(concepts);

    it('getAllConceptIds returns all concepts', () => {
      expect(graph.getAllConceptIds().sort()).toEqual(['a', 'b', 'c', 'm', 'x', 'y', 'z']);
    });

    it('topologicalSort respects all subgraph orderings', () => {
      const order = graph.topologicalSort();
      const idx = (id: string) => order.indexOf(id);
      // Subgraph 1
      expect(idx('a')).toBeLessThan(idx('b'));
      expect(idx('b')).toBeLessThan(idx('c'));
      // Subgraph 2
      expect(idx('x')).toBeLessThan(idx('y'));
      expect(idx('y')).toBeLessThan(idx('z'));
      // All nodes present
      expect(order.length).toBe(7);
    });

    it('no cycles detected', () => {
      expect(graph.detectCycles()).toEqual([]);
    });

    it('cross-subgraph reachability returns false', () => {
      expect(graph.isReachable('a', 'x')).toBe(false);
      expect(graph.isReachable('z', 'a')).toBe(false);
    });

    it('subgraph reachability returns true', () => {
      expect(graph.isReachable('c', 'a')).toBe(true);
      expect(graph.isReachable('z', 'x')).toBe(true);
    });
  });
});
