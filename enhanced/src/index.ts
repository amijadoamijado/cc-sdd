import { CoreWorkflowEnhancer, WorkflowContext } from './integration/core-workflow-enhancer.js';
import { GitCommitEnforcer } from './integration/git-commit-enforcer.js';
import { TodoEnhancer } from './integration/todo-enhancer.js';
import { InstructionManager } from './ai-coordination/instruction-manager.js';
import { ReportManager } from './ai-coordination/report-manager.js';

export interface EnhancedCliOptions {
  enableGitCommitRule?: boolean;
  enableAICoordination?: boolean;
  enableFDD?: boolean;
  autoLearningCapture?: boolean;
}

export interface CliIO {
  log: (msg: string) => void;
  error: (msg: string) => void;
  exit: (code: number) => void;
}

export interface EnvRuntime {
  platform: string;
  env: Record<string, string | undefined>;
}

export interface UserConfig {
  [key: string]: any;
}

/**
 * Enhanced cc-sdd CLI runner with AI coordination and git commit enforcement
 */
export const runEnhancedCli = async (
  argv: string[],
  runtime: EnvRuntime = { platform: process.platform, env: process.env },
  io: CliIO = {
    log: (s) => console.log(s),
    error: (s) => console.error(s),
    exit: (c) => process.exit(c),
  },
  loadedConfig: UserConfig = {},
  execOpts?: { cwd?: string; templatesRoot?: string },
  enhancedOpts: EnhancedCliOptions = {}
): Promise<number> => {
  const projectRoot = execOpts?.cwd || process.cwd();

  // Initialize enhanced components
  const workflowEnhancer = new CoreWorkflowEnhancer(projectRoot);
  const gitEnforcer = new GitCommitEnforcer(projectRoot, {
    autoCommit: enhancedOpts.enableGitCommitRule ?? true,
    enforceRule: enhancedOpts.enableGitCommitRule ?? true,
  });
  const todoEnhancer = new TodoEnhancer({
    enforceGitCommit: enhancedOpts.enableGitCommitRule ?? true,
    detectDocumentCreation: true,
    autoLearningCapture: enhancedOpts.autoLearningCapture ?? true,
  });

  // Validate git repository if git commit enforcement is enabled
  if (enhancedOpts.enableGitCommitRule !== false) {
    const isValidRepo = await gitEnforcer.validateGitRepository();
    if (!isValidRepo) {
      io.log('⚠️ Git repository not available. Git commit enforcement disabled.');
    }
  }

  // Enhanced workflow wrapper
  const enhancedWorkflow = async () => {
    // Determine context based on argv
    const context: WorkflowContext = {
      projectRoot,
      currentPhase: determinePhaseFromArgs(argv),
      featureName: extractFeatureFromArgs(argv),
      aiRole: 'claude',
    };

    // For now, simulate the original cc-sdd workflow
    // In a real implementation, this would call the original cc-sdd
    return await workflowEnhancer.enhanceSpecWorkflow(
      () => Promise.resolve(0), // Placeholder for original cc-sdd
      context
    );
  };

  try {
    io.log('🚀 Enhanced CC-SDD starting...');
    io.log(`📋 Git Commit Rule: ${enhancedOpts.enableGitCommitRule !== false ? 'Enabled' : 'Disabled'}`);
    io.log(`🤖 AI Coordination: ${enhancedOpts.enableAICoordination !== false ? 'Enabled' : 'Disabled'}`);

    const result = await enhancedWorkflow();

    io.log('✅ Enhanced CC-SDD completed successfully!');
    return result;
  } catch (error) {
    io.error(`❌ Enhanced CC-SDD failed: ${error instanceof Error ? error.message : error}`);
    return 1;
  }
};

/**
 * Determine current phase from command line arguments
 */
function determinePhaseFromArgs(argv: string[]): WorkflowContext['currentPhase'] {
  const argStr = argv.join(' ').toLowerCase();

  if (argStr.includes('spec-requirements') || argStr.includes('requirements')) {
    return 'requirements';
  }
  if (argStr.includes('spec-design') || argStr.includes('design')) {
    return 'design';
  }
  if (argStr.includes('spec-tasks') || argStr.includes('tasks')) {
    return 'tasks';
  }
  if (argStr.includes('spec-impl') || argStr.includes('implementation')) {
    return 'implementation';
  }
  if (argStr.includes('quality') || argStr.includes('validate')) {
    return 'quality';
  }

  return 'requirements'; // default
}

/**
 * Extract feature name from command line arguments
 */
function extractFeatureFromArgs(argv: string[]): string {
  // Look for feature name after common commands
  const commands = ['spec-init', 'spec-requirements', 'spec-design', 'spec-tasks', 'spec-impl'];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (commands.some(cmd => arg.includes(cmd)) && i + 1 < argv.length) {
      return argv[i + 1];
    }
  }

  return 'unknown-feature';
}

/**
 * Enhanced todo processing with git commit rules
 */
export const enhanceTodoList = (todos: any[], options: EnhancedCliOptions = {}): any[] => {
  if (!options.enableGitCommitRule) return todos;

  const enhancer = new TodoEnhancer({
    enforceGitCommit: true,
    detectDocumentCreation: true,
    autoLearningCapture: options.autoLearningCapture ?? true,
  });

  return enhancer.enhanceTodos(todos);
};

/**
 * Git commit automation for documentation changes
 */
export const autoCommitDocumentation = async (
  todos: any[],
  options: EnhancedCliOptions = {},
  projectRoot: string = process.cwd()
): Promise<boolean> => {
  if (!options.enableGitCommitRule) return true;

  const gitEnforcer = new GitCommitEnforcer(projectRoot);
  const detection = gitEnforcer.detectDocumentationChanges(todos);

  if (detection.requiresCommit) {
    return await gitEnforcer.executeCommitWithRule(
      'general',
      `Documentation updates: ${detection.detectedTypes.join(', ')}`,
      ['docs/']
    );
  }

  return true;
};

// Export all enhanced components for external use
export {
  CoreWorkflowEnhancer,
  GitCommitEnforcer,
  TodoEnhancer,
  InstructionManager,
  ReportManager,
};

// Export FDD components
export { FddWorkflowManager } from './fdd/fdd-workflow-manager.js';

// Export types
export type { WorkflowContext } from './integration/core-workflow-enhancer.js';
export type { GitCommitConfig } from './integration/git-commit-enforcer.js';
export type { TodoItem, EnhancedTodoOptions } from './integration/todo-enhancer.js';
export type { SlashCommandContext } from './integration/slash-command-enhancer.js';
export type { InstructionRequest } from './ai-coordination/instruction-manager.js';
export type { ReportData } from './ai-coordination/report-manager.js';