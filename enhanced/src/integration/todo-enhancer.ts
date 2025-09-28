import { promises as fs } from 'fs';
import { join } from 'path';

export interface TodoItem {
  content: string;
  activeForm: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface EnhancedTodoOptions {
  enforceGitCommit?: boolean;
  detectDocumentCreation?: boolean;
  autoLearningCapture?: boolean;
}

export class TodoEnhancer {
  private options: EnhancedTodoOptions;

  constructor(options: EnhancedTodoOptions = {}) {
    this.options = {
      enforceGitCommit: true,
      detectDocumentCreation: true,
      autoLearningCapture: true,
      ...options
    };
  }

  /**
   * Enhance todo list with git commit rule and other improvements
   */
  enhanceTodos(todos: TodoItem[]): TodoItem[] {
    let enhancedTodos = [...todos];

    // 1. 指示書・報告書作成時のgit commit強制ルール
    if (this.options.enforceGitCommit && this.options.detectDocumentCreation) {
      enhancedTodos = this.addGitCommitRule(enhancedTodos);
    }

    // 2. 学習記録の自動キャプチャ
    if (this.options.autoLearningCapture) {
      enhancedTodos = this.addLearningCapture(enhancedTodos);
    }

    return enhancedTodos;
  }

  /**
   * Add git commit rule for document creation tasks
   */
  private addGitCommitRule(todos: TodoItem[]): TodoItem[] {
    const documentKeywords = [
      '指示書', 'instruction', 'report', '報告書',
      '学習記録', 'learning', 'handoff', '引き継ぎ',
      'pattern', 'パターン', 'decision', '設計判断'
    ];

    const hasDocumentCreation = todos.some(todo =>
      documentKeywords.some(keyword =>
        todo.content.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (hasDocumentCreation) {
      // 既存のgit commitタスクがあるかチェック
      const hasGitCommit = todos.some(todo =>
        todo.content.toLowerCase().includes('git commit') ||
        todo.content.toLowerCase().includes('commit')
      );

      if (!hasGitCommit) {
        // 最後にgit commitタスクを追加
        todos.push({
          content: "Git commit documentation changes",
          activeForm: "Committing documentation changes",
          status: "pending"
        });
      }
    }

    return todos;
  }

  /**
   * Add learning capture tasks for significant work
   */
  private addLearningCapture(todos: TodoItem[]): TodoItem[] {
    const learningTriggers = [
      'implement', '実装', 'fix', '修正', 'optimize', '最適化',
      'refactor', 'リファクタ', 'design', '設計'
    ];

    const hasLearningOpportunity = todos.some(todo =>
      learningTriggers.some(trigger =>
        todo.content.toLowerCase().includes(trigger.toLowerCase())
      )
    );

    if (hasLearningOpportunity) {
      // 学習記録タスクがあるかチェック
      const hasLearningTask = todos.some(todo =>
        todo.content.toLowerCase().includes('learning') ||
        todo.content.toLowerCase().includes('学習')
      );

      if (!hasLearningTask) {
        // 学習記録タスクを追加（git commitの前に）
        const insertIndex = todos.findIndex(todo =>
          todo.content.toLowerCase().includes('git commit')
        );

        const learningTask: TodoItem = {
          content: "Capture learning insights and patterns",
          activeForm: "Capturing learning insights and patterns",
          status: "pending"
        };

        if (insertIndex > -1) {
          todos.splice(insertIndex, 0, learningTask);
        } else {
          todos.push(learningTask);
        }
      }
    }

    return todos;
  }

  /**
   * Validate todo list against enhanced rules
   */
  validateTodos(todos: TodoItem[]): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Rule 1: Document creation must have git commit
    if (this.options.enforceGitCommit) {
      const hasDocCreation = todos.some(todo =>
        ['指示書', 'instruction', 'report', '報告書'].some(keyword =>
          todo.content.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      const hasGitCommit = todos.some(todo =>
        todo.content.toLowerCase().includes('git commit')
      );

      if (hasDocCreation && !hasGitCommit) {
        violations.push('Document creation tasks must include git commit task');
      }
    }

    // Rule 2: Learning capture for significant work
    if (this.options.autoLearningCapture) {
      const hasSignificantWork = todos.some(todo =>
        ['implement', 'fix', 'design', '実装', '修正', '設計'].some(keyword =>
          todo.content.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      const hasLearningCapture = todos.some(todo =>
        todo.content.toLowerCase().includes('learning') ||
        todo.content.toLowerCase().includes('学習')
      );

      if (hasSignificantWork && !hasLearningCapture) {
        violations.push('Significant work should include learning capture task');
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Auto-fix todo list based on validation results
   */
  autoFixTodos(todos: TodoItem[]): TodoItem[] {
    const validation = this.validateTodos(todos);

    if (!validation.valid) {
      console.warn('⚠️ Todo list validation failed. Auto-fixing...');
      validation.violations.forEach(violation => {
        console.warn(`   - ${violation}`);
      });

      return this.enhanceTodos(todos);
    }

    return todos;
  }

  /**
   * Update configuration
   */
  updateConfig(newOptions: Partial<EnhancedTodoOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Generate todo summary with enhanced insights
   */
  generateTodoSummary(todos: TodoItem[]): string {
    const pending = todos.filter(t => t.status === 'pending');
    const inProgress = todos.filter(t => t.status === 'in_progress');
    const completed = todos.filter(t => t.status === 'completed');

    const hasDocTasks = todos.some(t =>
      ['instruction', 'report', 'learning', '指示書', '報告書', '学習'].some(keyword =>
        t.content.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    const hasGitCommit = todos.some(t =>
      t.content.toLowerCase().includes('git commit')
    );

    return `📋 Todo Summary
├── Completed: ${completed.length}
├── In Progress: ${inProgress.length}
├── Pending: ${pending.length}
├── Has Documentation: ${hasDocTasks ? '✅' : '❌'}
├── Has Git Commit: ${hasGitCommit ? '✅' : '❌'}
└── Enhanced Rules: ${this.options.enforceGitCommit ? 'Active' : 'Disabled'}`;
  }
}