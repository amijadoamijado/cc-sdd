import { promises as fs } from 'fs';
import { join } from 'path';

export interface ReportData {
  from: 'claude' | 'gemini' | 'codex';
  to: 'claude' | 'gemini' | 'codex';
  task: string;
  status: 'completed' | 'in_progress' | 'blocked';
  completedItems?: string[];
  inProgressItems?: string[];
  blockedItems?: string[];
  changedFiles?: string[];
  metrics?: Record<string, any>;
  learnings?: string[];
  nextActions?: string[];
  notes?: string;
}

export class ReportManager {
  private docsPath: string;

  constructor(projectRoot: string = process.cwd()) {
    this.docsPath = join(projectRoot, 'docs');
  }

  /**
   * Generate report document for AI collaboration
   */
  async createReport(data: ReportData): Promise<string> {
    const timestamp = this.generateTimestamp();
    const fileName = `${data.from}_from_${data.status}_${timestamp}_${this.sanitizeTaskName(data.task)}.md`;
    const reportPath = join(this.docsPath, 'reports', `From${this.capitalize(data.from)}`, fileName);

    // Ensure directory exists
    await fs.mkdir(join(this.docsPath, 'reports', `From${this.capitalize(data.from)}`), { recursive: true });

    const content = this.generateReportContent(data, timestamp);
    await fs.writeFile(reportPath, content, 'utf-8');

    return reportPath;
  }

  /**
   * Generate report content using template
   */
  private generateReportContent(data: ReportData, timestamp: string): string {
    const roleMap = {
      claude: 'Claude Code (司令塔)',
      gemini: 'Gemini (実装)',
      codex: 'Codex (品質ゲート)'
    };

    const statusMap = {
      completed: '✅ 完了',
      in_progress: '🚧 進行中',
      blocked: '❌ ブロック'
    };

    return `# ${data.from}_from_${data.status}_${timestamp}_${this.sanitizeTaskName(data.task)}.md

## 📋 ${roleMap[data.from]} 報告書
**From**: ${roleMap[data.from]}
**To**: ${roleMap[data.to]}
**Date**: ${timestamp}
**Task**: ${data.task}
**Status**: ${statusMap[data.status]}

## ✅ 完了事項
${data.completedItems?.map(item => `- [x] ${item}`).join('\n') || '- 完了項目なし'}

## 🚧 進行中事項
${data.inProgressItems?.map(item => `- [ ] ${item}`).join('\n') || '- 進行中項目なし'}

## ❌ 課題・ブロック事項
${data.blockedItems?.map(item => `- ⚠️ ${item}`).join('\n') || '- ブロック項目なし'}

## 📁 変更・追加ファイル
${data.changedFiles?.map(file => `- \`${file}\``).join('\n') || '- ファイル変更なし'}

## 📊 メトリクス・測定結果
${this.formatMetrics(data.metrics)}

## 💡 学んだこと・改善点
${data.learnings?.map(learning => `- ${learning}`).join('\n') || '- 特記事項なし'}

## 🔄 次のアクション
${data.nextActions?.map((action, i) => `${i + 1}. ${action}`).join('\n') || '1. 次の指示待ち'}

## 💬 備考
${data.notes || 'AI役割分担システムによる自動生成報告書'}

---
*報告者: ${data.from}*
*ステータス: ${data.status}*
*生成日時: ${timestamp}*`;
  }

  /**
   * List all reports from a specific AI
   */
  async listReports(ai: 'claude' | 'gemini' | 'codex'): Promise<string[]> {
    const reportsDir = join(this.docsPath, 'reports', `From${this.capitalize(ai)}`);

    try {
      const files = await fs.readdir(reportsDir);
      return files.filter(file => file.endsWith('.md')).sort().reverse(); // Latest first
    } catch (error) {
      return [];
    }
  }

  /**
   * Read report content
   */
  async readReport(ai: 'claude' | 'gemini' | 'codex', fileName: string): Promise<string> {
    const filePath = join(this.docsPath, 'reports', `From${this.capitalize(ai)}`, fileName);
    return await fs.readFile(filePath, 'utf-8');
  }

  /**
   * Generate status dashboard
   */
  async generateStatusDashboard(): Promise<string> {
    const dashboard = [
      '# 📊 AI Team Status Dashboard',
      '',
      await this.getAIStatus('claude', '🎯 Claude Code (司令塔)'),
      await this.getAIStatus('gemini', '⚡ Gemini (実装)'),
      await this.getAIStatus('codex', '🔍 Codex (品質ゲート)'),
      '',
      '## 📁 Recent Activity',
      ...(await this.getRecentActivity())
    ];

    return dashboard.join('\n');
  }

  private async getAIStatus(ai: 'claude' | 'gemini' | 'codex', title: string): Promise<string> {
    const reports = await this.listReports(ai);
    const recentCount = reports.length;
    const lastActivity = recentCount > 0 ? reports[0].match(/\d{12}/)?.[0] || 'Unknown' : 'None';

    return `## ${title}
├── Recent Reports: ${recentCount}
├── Last Activity: ${this.formatTimestamp(lastActivity)}
└── Status: ${recentCount > 0 ? 'Active' : 'Idle'}`;
  }

  private async getRecentActivity(): Promise<string[]> {
    const activities: string[] = [];
    const ais: ('claude' | 'gemini' | 'codex')[] = ['claude', 'gemini', 'codex'];

    for (const ai of ais) {
      const reports = await this.listReports(ai);
      if (reports.length > 0) {
        const latest = reports[0];
        const timestamp = latest.match(/\d{12}/)?.[0] || '';
        const task = latest.split('_').slice(3).join('_').replace('.md', '');
        activities.push(`- ${this.formatTimestamp(timestamp)} ${this.capitalize(ai)}: ${task}`);
      }
    }

    return activities.slice(0, 5); // Show latest 5 activities
  }

  private formatMetrics(metrics?: Record<string, any>): string {
    if (!metrics || Object.keys(metrics).length === 0) {
      return '- メトリクス情報なし';
    }

    return Object.entries(metrics)
      .map(([key, value]) => `- **${key}**: ${value}`)
      .join('\n');
  }

  private formatTimestamp(timestamp: string): string {
    if (timestamp === 'Unknown' || timestamp === 'None' || !timestamp) {
      return timestamp;
    }

    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);

    return `${year}-${month}-${day} ${hour}:${minute}`;
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
}