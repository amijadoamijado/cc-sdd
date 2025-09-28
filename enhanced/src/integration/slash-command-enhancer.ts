import { GitCommitEnforcer } from './git-commit-enforcer.js';
import { TodoEnhancer } from './todo-enhancer.js';
import { InstructionManager } from '../ai-coordination/instruction-manager.js';
import { ReportManager } from '../ai-coordination/report-manager.js';

export interface SlashCommandContext {
  command: string;
  args: string[];
  projectRoot: string;
  aiRole: 'claude' | 'gemini' | 'codex';
}

export interface TodoItem {
  content: string;
  activeForm: string;
  status: 'pending' | 'in_progress' | 'completed';
}

/**
 * Enhanced slash command processor with git commit enforcement
 */
export class SlashCommandEnhancer {
  private gitEnforcer: GitCommitEnforcer;
  private todoEnhancer: TodoEnhancer;
  private instructionManager: InstructionManager;
  private reportManager: ReportManager;

  constructor(projectRoot: string = process.cwd()) {
    this.gitEnforcer = new GitCommitEnforcer(projectRoot);
    this.todoEnhancer = new TodoEnhancer();
    this.instructionManager = new InstructionManager(projectRoot);
    this.reportManager = new ReportManager(projectRoot);
  }

  /**
   * Process slash command with enhanced todo and git commit rules
   */
  async processSlashCommand(
    command: string,
    args: string[],
    originalTodos: TodoItem[] = []
  ): Promise<{ todos: TodoItem[]; shouldCommit: boolean }> {
    console.log(`🔧 Enhanced slash command processing: ${command}`);

    let enhancedTodos = [...originalTodos];
    let shouldCommit = false;

    // Apply command-specific enhancements
    switch (command) {
      case 'kiro:spec-requirements':
      case 'kiro:spec-design':
      case 'kiro:spec-tasks':
        enhancedTodos = await this.enhanceSpecCommand(command, args, enhancedTodos);
        shouldCommit = true;
        break;

      case 'kiro:spec-impl':
        enhancedTodos = await this.enhanceImplementationCommand(args, enhancedTodos);
        shouldCommit = true;
        break;

      case 'kiro:spec-init':
        enhancedTodos = await this.enhanceInitCommand(args, enhancedTodos);
        shouldCommit = true;
        break;

      default:
        // Apply general enhancements
        enhancedTodos = this.todoEnhancer.enhanceTodos(enhancedTodos);
        const detection = this.gitEnforcer.detectDocumentationChanges(enhancedTodos);
        shouldCommit = detection.requiresCommit;
        break;
    }

    // Apply git commit rule if documentation is detected
    if (shouldCommit) {
      enhancedTodos = this.gitEnforcer.addGitCommitTodoIfNeeded(enhancedTodos);
    }

    return {
      todos: enhancedTodos,
      shouldCommit
    };
  }

  /**
   * Enhance spec-related commands (requirements, design, tasks)
   */
  private async enhanceSpecCommand(
    command: string,
    args: string[],
    todos: TodoItem[]
  ): Promise<TodoItem[]> {
    const featureName = args[0] || 'unknown-feature';

    // Add AI coordination tasks
    const coordinationTasks: TodoItem[] = [
      {
        content: `Generate ${command.split(':')[1]} specification for ${featureName}`,
        activeForm: `Generating ${command.split(':')[1]} specification for ${featureName}`,
        status: 'pending'
      },
      {
        content: `Create AI instruction document for ${command.split(':')[1]} phase`,
        activeForm: `Creating AI instruction document for ${command.split(':')[1]} phase`,
        status: 'pending'
      },
      {
        content: `Review and validate ${command.split(':')[1]} completeness`,
        activeForm: `Reviewing and validating ${command.split(':')[1]} completeness`,
        status: 'pending'
      }
    ];

    // Insert coordination tasks at the beginning
    const enhancedTodos = [...coordinationTasks, ...todos];

    // Apply todo enhancement rules
    return this.todoEnhancer.enhanceTodos(enhancedTodos);
  }

  /**
   * Enhance implementation command
   */
  private async enhanceImplementationCommand(
    args: string[],
    todos: TodoItem[]
  ): Promise<TodoItem[]> {
    const featureName = args[0] || 'unknown-feature';

    const implementationTasks: TodoItem[] = [
      {
        content: `Implement feature: ${featureName}`,
        activeForm: `Implementing feature: ${featureName}`,
        status: 'pending'
      },
      {
        content: `Write comprehensive tests for ${featureName}`,
        activeForm: `Writing comprehensive tests for ${featureName}`,
        status: 'pending'
      },
      {
        content: `Update documentation for ${featureName}`,
        activeForm: `Updating documentation for ${featureName}`,
        status: 'pending'
      },
      {
        content: `Generate implementation report`,
        activeForm: `Generating implementation report`,
        status: 'pending'
      }
    ];

    const enhancedTodos = [...implementationTasks, ...todos];
    return this.todoEnhancer.enhanceTodos(enhancedTodos);
  }

  /**
   * Enhance spec-init command
   */
  private async enhanceInitCommand(
    args: string[],
    todos: TodoItem[]
  ): Promise<TodoItem[]> {
    const projectDescription = args.join(' ') || 'new project';

    const initTasks: TodoItem[] = [
      {
        content: `Initialize project specification: ${projectDescription}`,
        activeForm: `Initializing project specification: ${projectDescription}`,
        status: 'pending'
      },
      {
        content: `Create project structure and steering documents`,
        activeForm: `Creating project structure and steering documents`,
        status: 'pending'
      },
      {
        content: `Set up AI coordination workspace`,
        activeForm: `Setting up AI coordination workspace`,
        status: 'pending'
      }
    ];

    const enhancedTodos = [...initTasks, ...todos];
    return this.todoEnhancer.enhanceTodos(enhancedTodos);
  }

  /**
   * Auto-execute git commit if rules are satisfied
   */
  async autoExecuteCommit(todos: TodoItem[]): Promise<boolean> {
    const detection = this.gitEnforcer.detectDocumentationChanges(todos);

    if (detection.requiresCommit) {
      console.log('🔄 Auto-executing git commit for documentation changes...');
      return await this.gitEnforcer.executeCommitWithRule(
        'general',
        `Automated commit: ${detection.detectedTypes.join(', ')} documentation`,
        []
      );
    }

    return true;
  }

  /**
   * Generate AI coordination documents based on command
   */
  async generateAICoordinationDocs(
    command: string,
    args: string[],
    todos: TodoItem[]
  ): Promise<void> {
    const featureName = args[0] || 'unknown-feature';

    // Generate instruction for next AI in the workflow
    if (command.includes('spec-requirements')) {
      await this.instructionManager.createInstruction({
        from: 'claude',
        to: 'gemini',
        task: `Design phase for ${featureName}`,
        priority: 'high',
        context: `Requirements completed for ${featureName}. Proceed with technical design.`,
        requirements: [
          'Review completed requirements document',
          'Create detailed technical design',
          'Define API contracts and data models'
        ]
      });
    }

    if (command.includes('spec-design')) {
      await this.instructionManager.createInstruction({
        from: 'claude',
        to: 'gemini',
        task: `Implementation tasks for ${featureName}`,
        priority: 'high',
        context: `Design completed for ${featureName}. Ready for implementation.`,
        requirements: [
          'Follow approved design specifications',
          'Implement with comprehensive testing',
          'Document implementation decisions'
        ]
      });
    }

    // Generate progress report
    await this.reportManager.createReport({
      from: 'claude',
      to: 'gemini',
      task: `${command} for ${featureName}`,
      status: 'completed',
      completedItems: [`${command} executed successfully`],
      nextActions: ['Review output', 'Proceed to next phase'],
      changedFiles: ['docs/', '.kiro/specs/'],
      notes: 'Enhanced cc-sdd command execution completed'
    });
  }

  /**
   * Validate enhanced todo list
   */
  validateEnhancedTodos(todos: TodoItem[]): { valid: boolean; violations: string[] } {
    return this.todoEnhancer.validateTodos(todos);
  }
}