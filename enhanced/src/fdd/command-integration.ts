import { FDDWorkflowManager, FDDConfig, FDDPhase } from './workflow-manager.js';
import { TodoEnhancer, TodoItem } from '../integration/todo-enhancer.js';
import { GitCommitEnforcer } from '../integration/git-commit-enforcer.js';

export interface FDDCommandOptions {
  featureName: string;
  uiFramework?: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla';
  enableUserTesting?: boolean;
  skipPrototype?: boolean;
}

/**
 * FDD command integration with enhanced cc-sdd workflow
 */
export class FDDCommandIntegration {
  private fddManager: FDDWorkflowManager;
  private todoEnhancer: TodoEnhancer;
  private gitEnforcer: GitCommitEnforcer;

  constructor(projectRoot: string = process.cwd(), fddConfig: FDDConfig = {}) {
    this.fddManager = new FDDWorkflowManager(projectRoot, fddConfig);
    this.todoEnhancer = new TodoEnhancer();
    this.gitEnforcer = new GitCommitEnforcer(projectRoot);
  }

  /**
   * Process FDD-related slash commands
   */
  async processFDDCommand(
    command: string,
    args: string[],
    options: FDDCommandOptions
  ): Promise<{ todos: TodoItem[]; success: boolean }> {
    console.log(`🎨 Processing FDD command: ${command} for ${options.featureName}`);

    try {
      let todos: TodoItem[] = [];

      switch (command) {
        case 'kiro:fdd-init':
          todos = await this.initializeFDDWorkflow(options);
          break;

        case 'kiro:fdd-mockup':
          todos = await this.createUIMockupTodos(options);
          break;

        case 'kiro:fdd-prototype':
          todos = await this.createPrototypeTodos(options);
          break;

        case 'kiro:fdd-test':
          todos = await this.createUserTestingTodos(options);
          break;

        case 'kiro:fdd-implement':
          todos = await this.createImplementationTodos(options);
          break;

        case 'kiro:fdd-integrate':
          todos = await this.createIntegrationTodos(options);
          break;

        case 'kiro:fdd-full':
          todos = await this.createFullFDDWorkflow(options);
          break;

        default:
          throw new Error(`Unknown FDD command: ${command}`);
      }

      // Apply enhanced todo rules (including git commit)
      const enhancedTodos = this.todoEnhancer.enhanceTodos(todos);

      // Add FDD-specific git commit rule
      const finalTodos = this.gitEnforcer.addGitCommitTodoIfNeeded(enhancedTodos);

      return { todos: finalTodos, success: true };

    } catch (error) {
      console.error(`❌ FDD command failed: ${error instanceof Error ? error.message : error}`);
      return { todos: [], success: false };
    }
  }

  /**
   * Initialize complete FDD workflow
   */
  private async initializeFDDWorkflow(options: FDDCommandOptions): Promise<TodoItem[]> {
    // Initialize FDD workspace
    await this.fddManager.initializeFDDWorkspace(options.featureName);

    const todos: TodoItem[] = [
      {
        content: `Initialize FDD workspace for ${options.featureName}`,
        activeForm: `Initializing FDD workspace for ${options.featureName}`,
        status: 'completed'
      },
      {
        content: `Set up ${options.uiFramework || 'react'} development environment`,
        activeForm: `Setting up ${options.uiFramework || 'react'} development environment`,
        status: 'pending'
      },
      {
        content: `Create design system foundation`,
        activeForm: `Creating design system foundation`,
        status: 'pending'
      },
      {
        content: `Document FDD workflow process`,
        activeForm: `Documenting FDD workflow process`,
        status: 'pending'
      }
    ];

    return todos;
  }

  /**
   * Create UI mockup phase todos
   */
  private async createUIMockupTodos(options: FDDCommandOptions): Promise<TodoItem[]> {
    const phase: FDDPhase = {
      name: 'ui-mockup',
      description: 'Create UI mockups and wireframes',
      deliverables: ['Wireframe designs', 'UI component breakdown', 'User interaction flows']
    };

    await this.fddManager.executeFDDPhase(phase, options.featureName, []);

    const todos: TodoItem[] = [
      {
        content: `Create wireframe designs for ${options.featureName}`,
        activeForm: `Creating wireframe designs for ${options.featureName}`,
        status: 'pending'
      },
      {
        content: `Design UI component breakdown`,
        activeForm: `Designing UI component breakdown`,
        status: 'pending'
      },
      {
        content: `Map user interaction flows`,
        activeForm: `Mapping user interaction flows`,
        status: 'pending'
      },
      {
        content: `Create ${options.uiFramework} component specifications`,
        activeForm: `Creating ${options.uiFramework} component specifications`,
        status: 'pending'
      },
      {
        content: `Review and validate UI mockups`,
        activeForm: `Reviewing and validating UI mockups`,
        status: 'pending'
      }
    ];

    return todos;
  }

  /**
   * Create prototype phase todos
   */
  private async createPrototypeTodos(options: FDDCommandOptions): Promise<TodoItem[]> {
    if (options.skipPrototype) {
      return [{
        content: `Prototype phase skipped for ${options.featureName}`,
        activeForm: `Skipping prototype phase for ${options.featureName}`,
        status: 'completed'
      }];
    }

    const phase: FDDPhase = {
      name: 'prototype',
      description: 'Build interactive prototype',
      deliverables: ['Interactive prototype', 'Component library', 'User interaction demos']
    };

    await this.fddManager.executeFDDPhase(phase, options.featureName, []);

    const todos: TodoItem[] = [
      {
        content: `Build interactive prototype using ${options.uiFramework}`,
        activeForm: `Building interactive prototype using ${options.uiFramework}`,
        status: 'pending'
      },
      {
        content: `Implement core UI components`,
        activeForm: `Implementing core UI components`,
        status: 'pending'
      },
      {
        content: `Create user interaction demonstrations`,
        activeForm: `Creating user interaction demonstrations`,
        status: 'pending'
      },
      {
        content: `Test prototype functionality`,
        activeForm: `Testing prototype functionality`,
        status: 'pending'
      },
      {
        content: `Document prototype features and limitations`,
        activeForm: `Documenting prototype features and limitations`,
        status: 'pending'
      }
    ];

    return todos;
  }

  /**
   * Create user testing phase todos
   */
  private async createUserTestingTodos(options: FDDCommandOptions): Promise<TodoItem[]> {
    if (!options.enableUserTesting) {
      return [{
        content: `User testing disabled for ${options.featureName}`,
        activeForm: `User testing disabled for ${options.featureName}`,
        status: 'completed'
      }];
    }

    const phase: FDDPhase = {
      name: 'user-test',
      description: 'Conduct user testing',
      deliverables: ['User testing results', 'Feedback analysis', 'UI improvements']
    };

    await this.fddManager.executeFDDPhase(phase, options.featureName, []);

    const todos: TodoItem[] = [
      {
        content: `Prepare user testing scenarios for ${options.featureName}`,
        activeForm: `Preparing user testing scenarios for ${options.featureName}`,
        status: 'pending'
      },
      {
        content: `Conduct user testing sessions`,
        activeForm: `Conducting user testing sessions`,
        status: 'pending'
      },
      {
        content: `Analyze user feedback and identify issues`,
        activeForm: `Analyzing user feedback and identifying issues`,
        status: 'pending'
      },
      {
        content: `Implement UI improvements based on feedback`,
        activeForm: `Implementing UI improvements based on feedback`,
        status: 'pending'
      },
      {
        content: `Validate improvements with follow-up testing`,
        activeForm: `Validating improvements with follow-up testing`,
        status: 'pending'
      }
    ];

    return todos;
  }

  /**
   * Create implementation phase todos
   */
  private async createImplementationTodos(options: FDDCommandOptions): Promise<TodoItem[]> {
    const phase: FDDPhase = {
      name: 'implementation',
      description: 'Implement production components',
      deliverables: ['Production components', 'Unit tests', 'Integration tests']
    };

    await this.fddManager.executeFDDPhase(phase, options.featureName, []);

    const todos: TodoItem[] = [
      {
        content: `Implement production-ready ${options.uiFramework} components`,
        activeForm: `Implementing production-ready ${options.uiFramework} components`,
        status: 'pending'
      },
      {
        content: `Write comprehensive unit tests for components`,
        activeForm: `Writing comprehensive unit tests for components`,
        status: 'pending'
      },
      {
        content: `Create integration tests for user flows`,
        activeForm: `Creating integration tests for user flows`,
        status: 'pending'
      },
      {
        content: `Implement accessibility features (WCAG compliance)`,
        activeForm: `Implementing accessibility features (WCAG compliance)`,
        status: 'pending'
      },
      {
        content: `Optimize performance and bundle size`,
        activeForm: `Optimizing performance and bundle size`,
        status: 'pending'
      },
      {
        content: `Document component APIs and usage examples`,
        activeForm: `Documenting component APIs and usage examples`,
        status: 'pending'
      }
    ];

    return todos;
  }

  /**
   * Create integration phase todos
   */
  private async createIntegrationTodos(options: FDDCommandOptions): Promise<TodoItem[]> {
    const phase: FDDPhase = {
      name: 'integration',
      description: 'Integrate into main application',
      deliverables: ['Integrated feature', 'E2E tests', 'Deployment docs']
    };

    await this.fddManager.executeFDDPhase(phase, options.featureName, []);

    const todos: TodoItem[] = [
      {
        content: `Integrate ${options.featureName} components into main application`,
        activeForm: `Integrating ${options.featureName} components into main application`,
        status: 'pending'
      },
      {
        content: `Configure routing and navigation for new feature`,
        activeForm: `Configuring routing and navigation for new feature`,
        status: 'pending'
      },
      {
        content: `Implement state management integration`,
        activeForm: `Implementing state management integration`,
        status: 'pending'
      },
      {
        content: `Create end-to-end tests for complete user journeys`,
        activeForm: `Creating end-to-end tests for complete user journeys`,
        status: 'pending'
      },
      {
        content: `Verify cross-browser compatibility`,
        activeForm: `Verifying cross-browser compatibility`,
        status: 'pending'
      },
      {
        content: `Prepare deployment documentation and procedures`,
        activeForm: `Preparing deployment documentation and procedures`,
        status: 'pending'
      }
    ];

    return todos;
  }

  /**
   * Create complete FDD workflow todos
   */
  private async createFullFDDWorkflow(options: FDDCommandOptions): Promise<TodoItem[]> {
    const allTodos: TodoItem[] = [];

    // Initialize
    const initTodos = await this.initializeFDDWorkflow(options);
    allTodos.push(...initTodos);

    // UI Mockup
    const mockupTodos = await this.createUIMockupTodos(options);
    allTodos.push(...mockupTodos);

    // Prototype (if enabled)
    if (!options.skipPrototype) {
      const prototypeTodos = await this.createPrototypeTodos(options);
      allTodos.push(...prototypeTodos);
    }

    // User Testing (if enabled)
    if (options.enableUserTesting) {
      const testingTodos = await this.createUserTestingTodos(options);
      allTodos.push(...testingTodos);
    }

    // Implementation
    const implementationTodos = await this.createImplementationTodos(options);
    allTodos.push(...implementationTodos);

    // Integration
    const integrationTodos = await this.createIntegrationTodos(options);
    allTodos.push(...integrationTodos);

    return allTodos;
  }

  /**
   * Get FDD workflow phases for a feature
   */
  getFDDWorkflowPhases(featureName: string): FDDPhase[] {
    return this.fddManager.generateFDDWorkflow(featureName);
  }

  /**
   * Update FDD configuration
   */
  updateFDDConfig(config: Partial<FDDConfig>): void {
    this.fddManager.updateConfig(config);
  }
}