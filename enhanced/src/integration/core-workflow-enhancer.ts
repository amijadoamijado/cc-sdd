import { promises as fs } from 'fs';
import { join } from 'path';
import { InstructionManager } from '../ai-coordination/instruction-manager.js';
import { ReportManager } from '../ai-coordination/report-manager.js';
import { FddWorkflowManager } from '../fdd/fdd-workflow-manager.js';

export interface WorkflowContext {
  projectRoot: string;
  currentPhase: 'requirements' | 'design' | 'tasks' | 'implementation' | 'quality';
  featureName: string;
  aiRole: 'claude' | 'gemini' | 'codex';
  enableFdd?: boolean;
}

export class CoreWorkflowEnhancer {
  private instructionManager: InstructionManager;
  private reportManager: ReportManager;
  private fddManager: FddWorkflowManager;

  constructor(projectRoot: string = process.cwd()) {
    this.instructionManager = new InstructionManager(projectRoot);
    this.reportManager = new ReportManager(projectRoot);
    this.fddManager = new FddWorkflowManager(projectRoot);
  }

  /**
   * Enhance cc-sdd spec workflow with AI coordination
   */
  async enhanceSpecWorkflow(
    originalWorkflow: () => Promise<any>,
    context: WorkflowContext
  ): Promise<any> {
    console.log(`🚀 Enhanced workflow starting: ${context.currentPhase} for ${context.featureName}`);

    try {
      // Pre-workflow: AI coordination setup
      await this.preWorkflowSetup(context);

      // Execute original cc-sdd workflow
      const result = await originalWorkflow();

      // Post-workflow: AI coordination and learning capture
      await this.postWorkflowCleanup(context, result);

      return result;
    } catch (error) {
      // Error handling with AI coordination
      await this.handleWorkflowError(context, error);
      throw error;
    }
  }

  /**
   * Pre-workflow setup: AI role assignment and instruction creation
   */
  private async preWorkflowSetup(context: WorkflowContext): Promise<void> {
    // Create AI instruction based on phase
    const instruction = this.generatePhaseInstruction(context);

    if (instruction) {
      await this.instructionManager.createInstruction(instruction);
      console.log(`📋 Created ${instruction.to} instruction for ${context.currentPhase} phase`);
    }

    // Initialize FDD workflow if enabled
    if (context.enableFdd && context.currentPhase === 'design') {
      console.log(`🎨 Initializing FDD workflow for ${context.featureName}`);
      await this.fddManager.initializeFddWorkflow(context.featureName);
    }

    // Setup phase-specific enhancements
    switch (context.currentPhase) {
      case 'requirements':
        await this.setupRequirementsPhase(context);
        break;
      case 'design':
        await this.setupDesignPhase(context);
        break;
      case 'tasks':
        await this.setupTasksPhase(context);
        break;
      case 'implementation':
        await this.setupImplementationPhase(context);
        break;
      case 'quality':
        await this.setupQualityPhase(context);
        break;
    }
  }

  /**
   * Post-workflow cleanup: Reports, learning capture, git commit
   */
  private async postWorkflowCleanup(context: WorkflowContext, result: any): Promise<void> {
    // Generate AI report
    const report = this.generatePhaseReport(context, result);
    if (report) {
      await this.reportManager.createReport(report);
      console.log(`📊 Generated ${report.from} report for ${context.currentPhase} phase`);
    }

    // Capture learning insights
    await this.captureLearningInsights(context, result);

    // Auto git commit (enhanced rule)
    await this.autoGitCommit(context, result);

    console.log(`✅ Enhanced workflow completed: ${context.currentPhase}`);
  }

  /**
   * Generate phase-specific instruction
   */
  private generatePhaseInstruction(context: WorkflowContext): any {
    const phaseInstructions = {
      requirements: {
        from: 'claude' as const,
        to: 'gemini' as const,
        task: `Requirements analysis for ${context.featureName}`,
        priority: 'high' as const,
        context: 'Analyze and validate requirements for implementation readiness',
        requirements: [
          'Review requirements for completeness',
          'Identify technical constraints',
          'Prepare for design phase'
        ]
      },
      design: {
        from: 'claude' as const,
        to: 'gemini' as const,
        task: `Technical design for ${context.featureName}`,
        priority: 'high' as const,
        context: 'Create detailed technical design based on approved requirements',
        requirements: [
          'Design system architecture',
          'Define API contracts',
          'Plan implementation approach'
        ]
      },
      implementation: {
        from: 'claude' as const,
        to: 'gemini' as const,
        task: `Implementation of ${context.featureName}`,
        priority: 'high' as const,
        context: 'Implement feature according to approved design',
        requirements: [
          'Follow design specifications',
          'Write comprehensive tests',
          'Document implementation decisions'
        ]
      },
      tasks: {
        from: 'claude' as const,
        to: 'gemini' as const,
        task: `Task planning for ${context.featureName}`,
        priority: 'high' as const,
        context: 'Create detailed implementation tasks based on approved design',
        requirements: [
          'Break down design into actionable tasks',
          'Estimate effort and dependencies',
          'Prepare for implementation phase'
        ]
      },
      quality: {
        from: 'gemini' as const,
        to: 'codex' as const,
        task: `Quality assessment for ${context.featureName}`,
        priority: 'high' as const,
        context: 'Perform comprehensive quality checks on implementation',
        requirements: [
          'Run all quality gates',
          'Verify requirements traceability',
          'Validate performance benchmarks'
        ]
      }
    };

    return phaseInstructions[context.currentPhase] || null;
  }

  /**
   * Generate phase-specific report
   */
  private generatePhaseReport(context: WorkflowContext, result: any): any {
    const baseReport = {
      task: `${context.currentPhase} phase for ${context.featureName}`,
      status: 'completed' as const,
      changedFiles: result?.files || [],
      metrics: result?.metrics || {},
    };

    switch (context.currentPhase) {
      case 'requirements':
      case 'design':
      case 'tasks':
        return {
          ...baseReport,
          from: 'claude' as const,
          to: 'gemini' as const,
          completedItems: [`${context.currentPhase} phase completed successfully`],
          nextActions: [`Proceed to next phase`, 'Review and approve output']
        };

      case 'implementation':
        return {
          ...baseReport,
          from: 'gemini' as const,
          to: 'codex' as const,
          completedItems: ['Implementation completed', 'Tests written', 'Documentation updated'],
          nextActions: ['Quality assessment required', 'Run all quality gates']
        };

      case 'quality':
        return {
          ...baseReport,
          from: 'codex' as const,
          to: 'claude' as const,
          completedItems: ['Quality gates executed', 'Results analyzed'],
          nextActions: ['Review quality results', 'Approve for deployment']
        };

      default:
        return null;
    }
  }

  /**
   * Setup requirements phase enhancements
   */
  private async setupRequirementsPhase(context: WorkflowContext): Promise<void> {
    // Future: Add requirements traceability setup
    console.log('📋 Setting up requirements phase enhancements');
  }

  /**
   * Setup design phase enhancements
   */
  private async setupDesignPhase(context: WorkflowContext): Promise<void> {
    // Future: Add design validation setup
    console.log('🎨 Setting up design phase enhancements');
  }

  /**
   * Setup tasks phase enhancements
   */
  private async setupTasksPhase(context: WorkflowContext): Promise<void> {
    // Future: Add task breakdown and planning setup
    console.log('📋 Setting up tasks phase enhancements');
  }

  /**
   * Setup implementation phase enhancements
   */
  private async setupImplementationPhase(context: WorkflowContext): Promise<void> {
    // Future: Add implementation tracking setup
    console.log('⚡ Setting up implementation phase enhancements');
  }

  /**
   * Setup quality phase enhancements
   */
  private async setupQualityPhase(context: WorkflowContext): Promise<void> {
    // Future: Add enhanced quality gates setup
    console.log('🔍 Setting up quality phase enhancements');
  }

  /**
   * Get FDD workflow status
   */
  async getFddStatus(featureName: string): Promise<any> {
    return await this.fddManager.getFddStatus(featureName);
  }

  /**
   * Execute FDD phase
   */
  async executeFddPhase(featureName: string, phase: any, project: any): Promise<any> {
    return await this.fddManager.executeFddPhase(featureName, phase, project);
  }

  /**
   * Capture learning insights from workflow execution
   */
  private async captureLearningInsights(context: WorkflowContext, result: any): Promise<void> {
    // Auto-generate learning record if significant work was done
    if (result?.insights || result?.challenges || result?.solutions) {
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
      const learningPath = join(context.projectRoot, 'docs', 'handover', 'learnings', 'technical');

      await fs.mkdir(learningPath, { recursive: true });

      const learningContent = `# Learning_${timestamp}_${context.currentPhase}_${context.featureName}.md

## 📚 学習事項
**Date**: ${new Date().toISOString()}
**Topic**: ${context.currentPhase} phase insights
**Context**: Enhanced cc-sdd workflow execution
**AI**: ${context.aiRole}

## 💡 発見・知見
${result?.insights || 'Workflow execution completed successfully'}

## 🔧 実装例・コード
\`\`\`
${result?.codeExample || '// Generated during workflow execution'}
\`\`\`

## ✅ 適用できる場面
- ${context.currentPhase} phase optimization
- Enhanced cc-sdd workflow
- AI coordination improvements

## ⚠️ 注意点・制約
${result?.constraints || 'Standard workflow constraints apply'}

## 📊 効果・インパクト
- **Phase**: ${context.currentPhase}
- **Feature**: ${context.featureName}
- **Duration**: ${result?.duration || 'N/A'}

## 🏷️ タグ
#${context.currentPhase} #${context.featureName} #enhanced-cc-sdd

---
*記録者: ${context.aiRole}*
*関連プロジェクト: enhanced-cc-sdd*`;

      const learningFile = join(learningPath, `Learning_${timestamp}_${context.currentPhase}_${context.featureName}.md`);
      await fs.writeFile(learningFile, learningContent, 'utf-8');

      console.log(`📚 Captured learning insights: ${learningFile}`);
    }
  }

  /**
   * Auto git commit with enhanced rules
   */
  private async autoGitCommit(context: WorkflowContext, result: any): Promise<void> {
    // Enhanced git commit rule: commit after each phase completion
    try {
      const { execSync } = await import('child_process');

      // Add changed files
      const filesToCommit = [
        ...(result?.files || []),
        'docs/instructions/',
        'docs/reports/',
        'docs/handover/learnings/'
      ];

      for (const file of filesToCommit) {
        try {
          execSync(`git add "${file}"`, { cwd: context.projectRoot, stdio: 'ignore' });
        } catch {
          // Ignore individual file add failures
        }
      }

      // Commit with enhanced message
      const commitMessage = `feat(${context.featureName}): ${context.currentPhase} phase completed

Enhanced cc-sdd workflow with AI coordination
- ${context.currentPhase} phase: ${result?.summary || 'completed successfully'}
- AI role: ${context.aiRole}
- Generated documentation and reports

🤖 Generated with Enhanced CC-SDD

Co-Authored-By: ${context.aiRole} <noreply@enhanced-cc-sdd.com>`;

      execSync(`git commit -m "${commitMessage}"`, {
        cwd: context.projectRoot,
        stdio: 'ignore'
      });

      console.log(`📝 Auto-committed changes for ${context.currentPhase} phase`);
    } catch (error) {
      console.warn(`⚠️ Auto-commit failed, but workflow continues: ${error}`);
    }
  }

  /**
   * Handle workflow errors with AI coordination
   */
  private async handleWorkflowError(context: WorkflowContext, error: any): Promise<void> {
    console.error(`❌ Workflow error in ${context.currentPhase} phase:`, error.message);

    // Generate error report
    const errorReport = {
      from: context.aiRole,
      to: 'claude' as const,
      task: `${context.currentPhase} phase for ${context.featureName}`,
      status: 'blocked' as const,
      blockedItems: [`Error in ${context.currentPhase} phase: ${error.message}`],
      nextActions: ['Review error details', 'Apply fixes', 'Retry phase execution'],
      notes: `Workflow error occurred during enhanced cc-sdd execution`
    };

    await this.reportManager.createReport(errorReport);
    console.log(`📊 Generated error report for ${context.currentPhase} phase`);
  }
}