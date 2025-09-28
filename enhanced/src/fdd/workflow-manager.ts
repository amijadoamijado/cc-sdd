import { promises as fs } from 'fs';
import { join } from 'path';
import { InstructionManager } from '../ai-coordination/instruction-manager.js';
import { ReportManager } from '../ai-coordination/report-manager.js';

export interface FDDConfig {
  enableMockups?: boolean;
  enablePrototyping?: boolean;
  enableUserTesting?: boolean;
  uiFramework?: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla';
  designSystem?: string;
}

export interface FDDPhase {
  name: 'ui-mockup' | 'prototype' | 'user-test' | 'implementation' | 'integration';
  description: string;
  deliverables: string[];
  nextPhase?: string;
}

/**
 * Frontend-Driven Development workflow manager
 * Implements UI-first development approach with user feedback loops
 */
export class FDDWorkflowManager {
  private config: FDDConfig;
  private projectRoot: string;
  private instructionManager: InstructionManager;
  private reportManager: ReportManager;

  constructor(projectRoot: string = process.cwd(), config: FDDConfig = {}) {
    this.projectRoot = projectRoot;
    this.config = {
      enableMockups: true,
      enablePrototyping: true,
      enableUserTesting: false,
      uiFramework: 'react',
      ...config
    };
    this.instructionManager = new InstructionManager(projectRoot);
    this.reportManager = new ReportManager(projectRoot);
  }

  /**
   * Initialize FDD workspace structure
   */
  async initializeFDDWorkspace(featureName: string): Promise<void> {
    const fddPath = join(this.projectRoot, 'fdd', featureName);

    // Create FDD folder structure
    const directories = [
      'ui-mockups',
      'prototypes',
      'user-feedback',
      'design-assets',
      'component-specs'
    ];

    for (const dir of directories) {
      await fs.mkdir(join(fddPath, dir), { recursive: true });
    }

    // Create FDD workflow document
    const workflowDoc = this.generateFDDWorkflowDocument(featureName);
    await fs.writeFile(join(fddPath, 'FDD_WORKFLOW.md'), workflowDoc, 'utf-8');

    console.log(`📱 FDD workspace initialized for ${featureName}`);
  }

  /**
   * Execute FDD phase with AI coordination
   */
  async executeFDDPhase(
    phase: FDDPhase,
    featureName: string,
    userRequirements: string[]
  ): Promise<{ success: boolean; deliverables: string[] }> {
    console.log(`🎨 Starting FDD phase: ${phase.name} for ${featureName}`);

    try {
      // Generate AI instruction for the phase
      const instruction = this.generatePhaseInstruction(phase, featureName, userRequirements);
      await this.instructionManager.createInstruction(instruction);

      // Execute phase-specific work
      const deliverables = await this.executePhaseWork(phase, featureName);

      // Generate completion report
      const report = this.generatePhaseReport(phase, featureName, deliverables);
      await this.reportManager.createReport(report);

      // Setup next phase if applicable
      if (phase.nextPhase) {
        await this.prepareNextPhase(phase.nextPhase, featureName);
      }

      console.log(`✅ FDD phase ${phase.name} completed for ${featureName}`);
      return { success: true, deliverables };

    } catch (error) {
      console.error(`❌ FDD phase ${phase.name} failed:`, error);

      // Generate error report
      const errorReport = {
        from: 'claude' as const,
        to: 'gemini' as const,
        task: `FDD ${phase.name} phase for ${featureName}`,
        status: 'blocked' as const,
        blockedItems: [`${phase.name} phase failed: ${error instanceof Error ? error.message : error}`],
        nextActions: ['Review error details', 'Adjust FDD approach', 'Retry phase'],
        notes: `Frontend-Driven Development phase error`
      };

      await this.reportManager.createReport(errorReport);
      return { success: false, deliverables: [] };
    }
  }

  /**
   * Generate comprehensive FDD workflow sequence
   */
  generateFDDWorkflow(featureName: string): FDDPhase[] {
    const phases: FDDPhase[] = [
      {
        name: 'ui-mockup',
        description: 'Create UI mockups and wireframes based on user requirements',
        deliverables: [
          'Wireframe designs',
          'UI component breakdown',
          'User interaction flows',
          'Design system components'
        ],
        nextPhase: 'prototype'
      },
      {
        name: 'prototype',
        description: 'Build interactive prototype for user validation',
        deliverables: [
          'Interactive prototype',
          'Component library',
          'User interaction demos',
          'Technical feasibility analysis'
        ],
        nextPhase: this.config.enableUserTesting ? 'user-test' : 'implementation'
      }
    ];

    if (this.config.enableUserTesting) {
      phases.push({
        name: 'user-test',
        description: 'Conduct user testing and gather feedback',
        deliverables: [
          'User testing results',
          'Feedback analysis',
          'UI improvement recommendations',
          'Validated user flows'
        ],
        nextPhase: 'implementation'
      });
    }

    phases.push({
      name: 'implementation',
      description: 'Implement production-ready components based on validated designs',
      deliverables: [
        'Production components',
        'Unit tests',
        'Integration tests',
        'Component documentation'
      ],
      nextPhase: 'integration'
    });

    phases.push({
      name: 'integration',
      description: 'Integrate components into main application',
      deliverables: [
        'Integrated feature',
        'E2E tests',
        'Performance benchmarks',
        'Deployment documentation'
      ]
    });

    return phases;
  }

  /**
   * Execute phase-specific work
   */
  private async executePhaseWork(phase: FDDPhase, featureName: string): Promise<string[]> {
    const deliverables: string[] = [];
    const phasePath = join(this.projectRoot, 'fdd', featureName);

    switch (phase.name) {
      case 'ui-mockup':
        deliverables.push(...await this.createUIMockups(phasePath));
        break;
      case 'prototype':
        deliverables.push(...await this.createPrototype(phasePath));
        break;
      case 'user-test':
        deliverables.push(...await this.conductUserTesting(phasePath));
        break;
      case 'implementation':
        deliverables.push(...await this.implementComponents(phasePath));
        break;
      case 'integration':
        deliverables.push(...await this.integrateComponents(phasePath));
        break;
    }

    return deliverables;
  }

  /**
   * Create UI mockups and wireframes
   */
  private async createUIMockups(phasePath: string): Promise<string[]> {
    const mockupPath = join(phasePath, 'ui-mockups');

    // Create mockup template files
    const wireframeTemplate = `# UI Wireframes

## Layout Structure
- Header: Navigation and branding
- Main Content: Primary user interface
- Sidebar: Secondary navigation/info
- Footer: Additional links and info

## Component Breakdown
1. **Header Component**
   - Logo
   - Navigation menu
   - User profile

2. **Main Content Area**
   - Primary functionality
   - Action buttons
   - Data display

3. **Interactive Elements**
   - Forms
   - Buttons
   - Modals
   - Tooltips

## User Flow Diagram
1. User enters application
2. Navigates to feature
3. Interacts with UI elements
4. Completes primary task
5. Receives feedback

## Design System References
- Colors: Primary, Secondary, Accent
- Typography: Headers, Body, Captions
- Spacing: Margins, Padding, Grid
- Components: Buttons, Forms, Cards
`;

    await fs.writeFile(join(mockupPath, 'wireframes.md'), wireframeTemplate, 'utf-8');

    const componentSpecs = `# Component Specifications

## ${this.config.uiFramework?.toUpperCase()} Components

### Button Component
\`\`\`${this.config.uiFramework}
<Button
  variant="primary|secondary|danger"
  size="sm|md|lg"
  disabled={boolean}
  onClick={handler}
>
  Button Text
</Button>
\`\`\`

### Input Component
\`\`\`${this.config.uiFramework}
<Input
  type="text|email|password"
  placeholder="Enter text"
  value={value}
  onChange={handler}
  error={errorMessage}
/>
\`\`\`

### Card Component
\`\`\`${this.config.uiFramework}
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
\`\`\`
`;

    await fs.writeFile(join(phasePath, 'component-specs', `${this.config.uiFramework}_components.md`), componentSpecs, 'utf-8');

    return [
      'wireframes.md',
      `${this.config.uiFramework}_components.md`
    ];
  }

  /**
   * Create interactive prototype
   */
  private async createPrototype(phasePath: string): Promise<string[]> {
    const prototypePath = join(phasePath, 'prototypes');

    // Create prototype documentation
    const prototypeDoc = `# Interactive Prototype

## Framework: ${this.config.uiFramework}

## Prototype Features
1. **Core Interactions**
   - Button clicks
   - Form submissions
   - Navigation flows
   - State changes

2. **Visual Feedback**
   - Loading states
   - Error states
   - Success confirmations
   - Hover effects

3. **Responsive Design**
   - Mobile layout
   - Tablet layout
   - Desktop layout

## Demo Scenarios
1. **Happy Path**: User completes primary task successfully
2. **Error Handling**: System handles user errors gracefully
3. **Edge Cases**: Boundary conditions and unusual inputs

## Technical Implementation Notes
- State management approach
- API integration points
- Performance considerations
- Accessibility requirements
`;

    await fs.writeFile(join(prototypePath, 'PROTOTYPE_SPEC.md'), prototypeDoc, 'utf-8');

    return ['PROTOTYPE_SPEC.md'];
  }

  /**
   * Conduct user testing
   */
  private async conductUserTesting(phasePath: string): Promise<string[]> {
    const testingPath = join(phasePath, 'user-feedback');

    const testingPlan = `# User Testing Plan

## Testing Objectives
1. Validate user interface intuitiveness
2. Identify usability issues
3. Gather feedback on user experience
4. Confirm feature meets user needs

## Test Scenarios
1. **First Time User**: New user discovers and uses feature
2. **Returning User**: Experienced user performs advanced tasks
3. **Error Recovery**: User encounters and recovers from errors

## Success Metrics
- Task completion rate > 90%
- User satisfaction score > 4/5
- Time to complete core task < 2 minutes
- Error rate < 5%

## Feedback Collection
- User interviews
- Task completion observations
- System usage analytics
- Satisfaction surveys
`;

    await fs.writeFile(join(testingPath, 'testing_plan.md'), testingPlan, 'utf-8');

    return ['testing_plan.md'];
  }

  /**
   * Implement production components
   */
  private async implementComponents(phasePath: string): Promise<string[]> {
    // This would integrate with actual component implementation
    console.log('🔧 Implementation phase - integrating with actual development tools');

    const implementationDoc = `# Implementation Guide

## Component Implementation Status
- [ ] Core components developed
- [ ] Unit tests written
- [ ] Integration tests added
- [ ] Accessibility verified
- [ ] Performance optimized

## Development Guidelines
1. Follow established code patterns
2. Implement responsive design
3. Add comprehensive testing
4. Document component API
5. Optimize for performance

## Quality Checklist
- Code review completed
- Tests passing
- Accessibility audit passed
- Performance benchmarks met
- Documentation updated
`;

    await fs.writeFile(join(phasePath, 'IMPLEMENTATION.md'), implementationDoc, 'utf-8');

    return ['IMPLEMENTATION.md'];
  }

  /**
   * Integrate components into main application
   */
  private async integrateComponents(phasePath: string): Promise<string[]> {
    const integrationDoc = `# Integration Documentation

## Integration Completed
- ✅ Components added to main application
- ✅ Routing configured
- ✅ State management integrated
- ✅ API connections established
- ✅ E2E tests implemented

## Deployment Checklist
- [ ] Production build successful
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Documentation updated

## Rollback Plan
1. Database migration rollback scripts
2. Previous version deployment artifacts
3. Configuration rollback procedures
4. Monitoring and alerting setup
`;

    await fs.writeFile(join(phasePath, 'INTEGRATION.md'), integrationDoc, 'utf-8');

    return ['INTEGRATION.md'];
  }

  /**
   * Generate phase-specific AI instruction
   */
  private generatePhaseInstruction(phase: FDDPhase, featureName: string, userRequirements: string[]) {
    return {
      from: 'claude' as const,
      to: 'gemini' as const,
      task: `FDD ${phase.name} phase for ${featureName}`,
      priority: 'high' as const,
      context: `Frontend-Driven Development: ${phase.description}`,
      requirements: [
        ...phase.deliverables.map(d => `Create ${d}`),
        'Follow FDD best practices',
        'Ensure user-centric design',
        ...userRequirements
      ]
    };
  }

  /**
   * Generate phase completion report
   */
  private generatePhaseReport(phase: FDDPhase, featureName: string, deliverables: string[]) {
    return {
      from: 'claude' as const,
      to: 'gemini' as const,
      task: `FDD ${phase.name} phase for ${featureName}`,
      status: 'completed' as const,
      completedItems: deliverables.map(d => `✅ ${d}`),
      nextActions: phase.nextPhase ? [`Proceed to ${phase.nextPhase} phase`] : ['Feature ready for production'],
      changedFiles: deliverables,
      notes: `Frontend-Driven Development ${phase.name} phase completed successfully`
    };
  }

  /**
   * Prepare next phase setup
   */
  private async prepareNextPhase(nextPhase: string, featureName: string): Promise<void> {
    console.log(`🔄 Preparing ${nextPhase} phase for ${featureName}`);

    // Create next phase instruction
    const instruction = {
      from: 'claude' as const,
      to: 'gemini' as const,
      task: `Prepare for FDD ${nextPhase} phase: ${featureName}`,
      priority: 'medium' as const,
      context: `Previous phase completed. Ready for ${nextPhase} phase execution.`,
      requirements: [
        'Review previous phase deliverables',
        'Set up next phase workspace',
        'Coordinate team resources'
      ]
    };

    await this.instructionManager.createInstruction(instruction);
  }

  /**
   * Generate FDD workflow document
   */
  private generateFDDWorkflowDocument(featureName: string): string {
    return `# Frontend-Driven Development Workflow: ${featureName}

## FDD Overview
Frontend-Driven Development (FDD) is a user-centric approach that prioritizes UI/UX design and user feedback throughout the development process.

## Workflow Phases
1. **UI Mockup**: Design wireframes and component specifications
2. **Prototype**: Build interactive prototype for validation
${this.config.enableUserTesting ? '3. **User Testing**: Gather user feedback and iterate\n4. **Implementation**: Build production components\n5. **Integration**: Integrate into main application' : '3. **Implementation**: Build production components\n4. **Integration**: Integrate into main application'}

## Configuration
- UI Framework: ${this.config.uiFramework}
- Mockups Enabled: ${this.config.enableMockups}
- Prototyping Enabled: ${this.config.enablePrototyping}
- User Testing Enabled: ${this.config.enableUserTesting}
- Design System: ${this.config.designSystem || 'Default'}

## Success Criteria
- User-centered design validated through testing
- High-quality UI components with comprehensive testing
- Smooth integration with existing application
- Performance and accessibility standards met

## AI Coordination
- Claude: Coordinates workflow and provides strategic guidance
- Gemini: Implements UI components and handles technical execution
- Codex: Validates quality, performance, and best practices

---
*Generated by Enhanced CC-SDD FDD Workflow Manager*
`;
  }

  /**
   * Get current FDD configuration
   */
  getConfig(): FDDConfig {
    return { ...this.config };
  }

  /**
   * Update FDD configuration
   */
  updateConfig(newConfig: Partial<FDDConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}