import { promises as fs } from 'fs';
import { join } from 'path';

export interface InstructionRequest {
  to: 'claude' | 'gemini' | 'codex';
  from: 'claude' | 'gemini' | 'codex';
  task: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  context?: string;
  requirements?: string[];
  acceptanceCriteria?: string[];
}

export class InstructionManager {
  private docsPath: string;

  constructor(projectRoot: string = process.cwd()) {
    this.docsPath = join(projectRoot, 'docs');
  }

  /**
   * Generate instruction document for AI collaboration
   */
  async createInstruction(request: InstructionRequest): Promise<string> {
    const timestamp = this.generateTimestamp();
    const fileName = `${request.from}_to_${request.to}_${timestamp}_${this.sanitizeTaskName(request.task)}.md`;
    const instructionPath = join(this.docsPath, 'instructions', `To${this.capitalize(request.to)}`, fileName);

    // Ensure directory exists
    await fs.mkdir(join(this.docsPath, 'instructions', `To${this.capitalize(request.to)}`), { recursive: true });

    const content = this.generateInstructionContent(request, timestamp);
    await fs.writeFile(instructionPath, content, 'utf-8');

    return instructionPath;
  }

  /**
   * Generate instruction content using template
   */
  private generateInstructionContent(request: InstructionRequest, timestamp: string): string {
    const roleMap = {
      claude: 'Claude Code (司令塔)',
      gemini: 'Gemini (実装)',
      codex: 'Codex (品質ゲート)'
    };

    return `# ${request.from}_to_${request.to}_${timestamp}_${this.sanitizeTaskName(request.task)}.md

## 📋 ${roleMap[request.from]} → ${roleMap[request.to]} 指示書
**From**: ${roleMap[request.from]}
**To**: ${roleMap[request.to]}
**Date**: ${timestamp}
**Task**: ${request.task}
**Priority**: ${request.priority}

## 🎯 タスク概要
${request.context || 'タスクの詳細説明'}

## 📝 詳細要件
${request.requirements?.map((req, i) => `${i + 1}. ${req}`).join('\n') || '- 要件を具体的に記載'}

## 📋 受入条件
${request.acceptanceCriteria?.map((criteria, i) => `${i + 1}. ${criteria}`).join('\n') || '1. 実装完了\n2. テスト通過\n3. 品質基準満足'}

## ⏰ 期限・スケジュール
- **期限**: ${request.deadline || '相談'}
- **中間チェック**: 必要に応じて

## 🔄 次のステップ
1. 実装開始
2. 進捗報告
3. 完了後は ${this.getNextReceiver(request.to)} に報告

## 📎 関連資料
- 要件定義: .kiro/specs/
- 設計書: docs/handover/decisions/
- 参考実装: 既存コードベース

## 💬 備考・注意事項
AI役割分担システムによる自動生成指示書

---
*指示者: ${request.from}*
*緊急度: ${request.priority}*
*生成日時: ${timestamp}*`;
  }

  /**
   * List all instructions for a specific AI
   */
  async listInstructions(ai: 'claude' | 'gemini' | 'codex'): Promise<string[]> {
    const instructionsDir = join(this.docsPath, 'instructions', `To${this.capitalize(ai)}`);

    try {
      const files = await fs.readdir(instructionsDir);
      return files.filter(file => file.endsWith('.md')).sort().reverse(); // Latest first
    } catch (error) {
      return [];
    }
  }

  /**
   * Read instruction content
   */
  async readInstruction(ai: 'claude' | 'gemini' | 'codex', fileName: string): Promise<string> {
    const filePath = join(this.docsPath, 'instructions', `To${this.capitalize(ai)}`, fileName);
    return await fs.readFile(filePath, 'utf-8');
  }

  private generateTimestamp(): string {
    const now = new Date();
    return now.getFullYear().toString() +
           (now.getMonth() + 1).toString().padStart(2, '0') +
           now.getDate().toString().padStart(2, '0') +
           now.getHours().toString().padStart(2, '0') +
           now.getMinutes().toString().padStart(2, '0');
  }

  private sanitizeTaskName(task: string): string {
    return task.toLowerCase()
               .replace(/[^a-z0-9\s]/g, '')
               .replace(/\s+/g, '_')
               .substring(0, 30);
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getNextReceiver(currentTo: string): string {
    const flow: Record<string, string> = {
      'claude': 'プロジェクト管理',
      'gemini': 'Codex (品質チェック)',
      'codex': 'Claude (結果報告)'
    };
    return flow[currentTo] || 'チーム';
  }
}