import { promises as fs } from 'fs';
import { join } from 'path';

export interface FddPhase {
  name: 'ui-design' | 'prototype' | 'component-design' | 'integration' | 'testing';
  description: string;
  deliverables: string[];
  nextPhase?: FddPhase['name'];
}

export interface FddWorkflowConfig {
  enableUiFirst: boolean;
  prototypeTools: string[];
  componentFramework: string;
  testingStrategy: 'unit' | 'e2e' | 'visual' | 'all';
}

export interface FddProject {
  name: string;
  currentPhase: FddPhase['name'];
  uiDesignPath?: string;
  prototypePath?: string;
  componentPath?: string;
  phases: Record<FddPhase['name'], { completed: boolean; artifacts: string[] }>;
}

export class FddWorkflowManager {
  private config: FddWorkflowConfig;
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd(), config: Partial<FddWorkflowConfig> = {}) {
    this.projectRoot = projectRoot;
    this.config = {
      enableUiFirst: true,
      prototypeTools: ['figma', 'sketch', 'adobe-xd'],
      componentFramework: 'react',
      testingStrategy: 'all',
      ...config
    };
  }

  /**
   * Initialize FDD workflow for a new feature
   */
  async initializeFddWorkflow(featureName: string): Promise<FddProject> {
    const project: FddProject = {
      name: featureName,
      currentPhase: 'ui-design',
      phases: {
        'ui-design': { completed: false, artifacts: [] },
        'prototype': { completed: false, artifacts: [] },
        'component-design': { completed: false, artifacts: [] },
        'integration': { completed: false, artifacts: [] },
        'testing': { completed: false, artifacts: [] }
      }
    };

    // Create FDD project structure
    await this.createFddStructure(featureName);

    // Generate UI design template
    await this.generateUiDesignTemplate(featureName);

    console.log(`🎨 FDD workflow initialized for ${featureName}`);
    return project;
  }

  /**
   * Create FDD project folder structure
   */
  private async createFddStructure(featureName: string): Promise<void> {
    const fddBase = join(this.projectRoot, 'docs', 'fdd', featureName);

    const directories = [
      'ui-design',
      'prototypes',
      'components',
      'integration',
      'testing'
    ];

    for (const dir of directories) {
      await fs.mkdir(join(fddBase, dir), { recursive: true });
    }

    console.log(`📁 Created FDD structure for ${featureName}`);
  }

  /**
   * Generate UI design template
   */
  private async generateUiDesignTemplate(featureName: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const uiDesignPath = join(this.projectRoot, 'docs', 'fdd', featureName, 'ui-design');

    const uiDesignContent = `# UI_Design_${timestamp}_${featureName}.md

## 🎨 UI設計 - ${featureName}
**Date**: ${new Date().toISOString()}
**Phase**: UI Design (FDD Phase 1)
**Feature**: ${featureName}
**Designer**: AI Team

## 📱 画面設計

### メイン画面
- **目的**: ${featureName}の主要機能提供
- **レイアウト**:
  - ヘッダー
  - メインコンテンツエリア
  - サイドバー/ナビゲーション
  - フッター

### ユーザーフロー
1. エントリーポイント
2. 主要アクション
3. フィードバック表示
4. 完了/終了

## 🎯 ユーザビリティ要件
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **レスポンシブ**: モバイル/タブレット/デスクトップ対応
- **パフォーマンス**: ページ読み込み3秒以内
- **ブラウザ対応**: Chrome, Firefox, Safari, Edge最新2バージョン

## 🎨 デザインシステム
- **カラーパレット**:
  - Primary: #007bff
  - Secondary: #6c757d
  - Success: #28a745
  - Warning: #ffc107
  - Error: #dc3545

- **タイポグラフィ**:
  - ヘッダー: Inter, sans-serif
  - ボディ: -apple-system, BlinkMacSystemFont, Segoe UI

- **コンポーネント**:
  - ボタン: Material Design準拠
  - フォーム: バリデーション付き
  - カード: シャドウ・角丸
  - モーダル: オーバーレイ式

## 📐 ワイヤーフレーム

### デスクトップ版
\`\`\`
+------------------------------------------+
|  Header [Logo] [Nav] [User]              |
+------------------------------------------+
| Sidebar |  Main Content Area             |
|         |                               |
| - Nav1  |  [Content Block 1]            |
| - Nav2  |  [Content Block 2]            |
| - Nav3  |  [Action Buttons]             |
|         |                               |
+------------------------------------------+
|  Footer [Links] [Copyright]              |
+------------------------------------------+
\`\`\`

### モバイル版
\`\`\`
+------------------------+
| Header [☰] [Logo]      |
+------------------------+
| Main Content           |
| [Content Block 1]      |
| [Content Block 2]      |
| [Action Buttons]       |
+------------------------+
| Tab Navigation         |
+------------------------+
\`\`\`

## 🔄 次のステップ
1. **UIレビュー**: デザイン承認
2. **プロトタイプ作成**: インタラクティブモック
3. **ユーザビリティテスト**: 初期検証
4. **コンポーネント設計**: 実装準備

## 📎 関連ファイル
- デザインアセット: ./assets/
- プロトタイプ: ../prototypes/
- コンポーネント仕様: ../components/

## 💭 デザイン判断記録
- **レイアウト選択理由**: ユーザビリティと機能性のバランス
- **カラー選択理由**: ブランドガイドライン準拠
- **フォント選択理由**: 可読性と表示速度の最適化

---
*記録者: AI Design Team*
*FDD Phase: UI Design*
*次フェーズ: Prototype*`;

    const filePath = join(uiDesignPath, `UI_Design_${timestamp}_${featureName}.md`);
    await fs.writeFile(filePath, uiDesignContent, 'utf-8');

    console.log(`🎨 Generated UI design template: ${filePath}`);
  }

  /**
   * Generate prototype template
   */
  async generatePrototypeTemplate(featureName: string, uiDesignFile?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const prototypePath = join(this.projectRoot, 'docs', 'fdd', featureName, 'prototypes');

    const prototypeContent = `# Prototype_${timestamp}_${featureName}.md

## 🔧 プロトタイプ - ${featureName}
**Date**: ${new Date().toISOString()}
**Phase**: Prototype (FDD Phase 2)
**Feature**: ${featureName}
**Based on**: ${uiDesignFile || 'UI Design Document'}

## 🎯 プロトタイプ目標
- **ユーザビリティ検証**: UIフローの妥当性確認
- **インタラクション設計**: ユーザー操作の最適化
- **技術検証**: 実装可能性の確認
- **ステークホルダー承認**: ビジュアル・機能の合意

## 🛠️ プロトタイプ種別

### 1. ペーパープロトタイプ
- **目的**: 初期コンセプト検証
- **範囲**: 主要画面とフロー
- **完了**: [ ] 作成完了

### 2. デジタルプロトタイプ
- **ツール**: ${this.config.prototypeTools.join(', ')}
- **インタラクション**: クリック、フォーム入力、画面遷移
- **完了**: [ ] 作成完了

### 3. インタラクティブプロトタイプ
- **技術**: HTML/CSS/JavaScript
- **機能**: リアルタイムフィードバック
- **完了**: [ ] 作成完了

## 📱 プロトタイプ仕様

### 画面構成
1. **エントリー画面**
   - 目的: ユーザーの導入
   - 要素: ヒーロー画像、CTAボタン、ナビゲーション

2. **メイン機能画面**
   - 目的: 主要機能の提供
   - 要素: 機能パネル、操作ボタン、結果表示

3. **結果・完了画面**
   - 目的: アクション結果の表示
   - 要素: 成功/エラーメッセージ、次アクション提示

### インタラクション設計
- **ボタン**: ホバー・クリック効果
- **フォーム**: リアルタイムバリデーション
- **画面遷移**: スムーズなアニメーション
- **フィードバック**: 読み込み中、完了通知

## 🧪 ユーザビリティテスト計画

### テスト対象ユーザー
- **ペルソナ1**: ${featureName}の主要ユーザー
- **ペルソナ2**: 新規ユーザー
- **ペルソナ3**: 上級ユーザー

### テストシナリオ
1. 初回利用フロー
2. 日常的な操作フロー
3. エラー発生時の対応フロー

### 成功指標
- **タスク完了率**: 90%以上
- **エラー発生率**: 5%以下
- **ユーザー満足度**: 4.0/5.0以上

## 📊 テスト結果記録

### 実施日時
- **Test 1**: [日時]
- **Test 2**: [日時]
- **Test 3**: [日時]

### 発見事項
- **改善点1**: [詳細]
- **改善点2**: [詳細]
- **改善点3**: [詳細]

### 修正対応
- [ ] 改善点1の修正
- [ ] 改善点2の修正
- [ ] 改善点3の修正

## 🔄 次のステップ
1. **プロトタイプ修正**: テスト結果反映
2. **最終承認**: ステークホルダー確認
3. **コンポーネント設計**: 実装仕様策定
4. **開発着手**: 実装フェーズ移行

## 📎 成果物
- **プロトタイプファイル**: ./assets/prototype.html
- **テスト記録**: ./test-results/
- **承認記録**: ./approvals/

## 💡 プロトタイプから得られた知見
- **ユーザビリティ**: [知見]
- **技術的課題**: [知見]
- **デザイン改善**: [知見]

---
*記録者: AI Prototype Team*
*FDD Phase: Prototype*
*前フェーズ: UI Design*
*次フェーズ: Component Design*`;

    const filePath = join(prototypePath, `Prototype_${timestamp}_${featureName}.md`);
    await fs.writeFile(filePath, prototypeContent, 'utf-8');

    console.log(`🔧 Generated prototype template: ${filePath}`);
    return filePath;
  }

  /**
   * Generate component design template
   */
  async generateComponentDesignTemplate(featureName: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const componentPath = join(this.projectRoot, 'docs', 'fdd', featureName, 'components');

    const componentContent = `# Component_Design_${timestamp}_${featureName}.md

## ⚡ コンポーネント設計 - ${featureName}
**Date**: ${new Date().toISOString()}
**Phase**: Component Design (FDD Phase 3)
**Feature**: ${featureName}
**Framework**: ${this.config.componentFramework}

## 🧩 コンポーネント分解

### 主要コンポーネント

#### 1. ${featureName}Container
- **役割**: 最上位コンテナ、状態管理
- **Props**:
  \`\`\`typescript
  interface ${featureName}ContainerProps {
    data?: any[];
    onAction?: (action: string) => void;
    loading?: boolean;
  }
  \`\`\`

#### 2. ${featureName}Header
- **役割**: ヘッダー表示、ナビゲーション
- **Props**:
  \`\`\`typescript
  interface ${featureName}HeaderProps {
    title: string;
    subtitle?: string;
    actions?: HeaderAction[];
  }
  \`\`\`

#### 3. ${featureName}Content
- **役割**: メインコンテンツ表示
- **Props**:
  \`\`\`typescript
  interface ${featureName}ContentProps {
    items: ContentItem[];
    layout?: 'grid' | 'list' | 'card';
    onItemSelect?: (item: ContentItem) => void;
  }
  \`\`\`

#### 4. ${featureName}Actions
- **役割**: アクションボタン群
- **Props**:
  \`\`\`typescript
  interface ${featureName}ActionsProps {
    actions: Action[];
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
  }
  \`\`\`

## 📝 型定義

### Core Types
\`\`\`typescript
// 基本データ型
interface ${featureName}Data {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

// アクション型
interface Action {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

// 状態型
interface ${featureName}State {
  data: ${featureName}Data[];
  loading: boolean;
  error: string | null;
  selectedItem: ${featureName}Data | null;
}
\`\`\`

## 🎨 スタイリング仕様

### CSS変数
\`\`\`css
:root {
  --${featureName.toLowerCase()}-primary-color: #007bff;
  --${featureName.toLowerCase()}-secondary-color: #6c757d;
  --${featureName.toLowerCase()}-background: #f8f9fa;
  --${featureName.toLowerCase()}-border: #dee2e6;
  --${featureName.toLowerCase()}-border-radius: 0.375rem;
  --${featureName.toLowerCase()}-spacing-unit: 1rem;
}
\`\`\`

### コンポーネント別スタイル
\`\`\`scss
.${featureName.toLowerCase()}-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--${featureName.toLowerCase()}-background);
}

.${featureName.toLowerCase()}-header {
  background: white;
  border-bottom: 1px solid var(--${featureName.toLowerCase()}-border);
  padding: var(--${featureName.toLowerCase()}-spacing-unit);
}

.${featureName.toLowerCase()}-content {
  flex: 1;
  padding: var(--${featureName.toLowerCase()}-spacing-unit);
}
\`\`\`

## 🔧 状態管理

### Context API設計
\`\`\`typescript
interface ${featureName}Context {
  state: ${featureName}State;
  dispatch: React.Dispatch<${featureName}Action>;
}

type ${featureName}Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: ${featureName}Data[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SELECT_ITEM'; payload: ${featureName}Data | null };
\`\`\`

### Reducer実装
\`\`\`typescript
const ${featureName.toLowerCase()}Reducer = (
  state: ${featureName}State,
  action: ${featureName}Action
): ${featureName}State => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DATA':
      return { ...state, data: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload };
    default:
      return state;
  }
};
\`\`\`

## 🧪 コンポーネントテスト戦略

### Unit Tests
- **${featureName}Container**: 状態管理、Props渡し
- **${featureName}Header**: 表示、イベントハンドリング
- **${featureName}Content**: データ表示、インタラクション
- **${featureName}Actions**: ボタン動作、無効化状態

### Integration Tests
- **フルフロー**: データ取得→表示→アクション→結果
- **エラーハンドリング**: API失敗、無効データ
- **ユーザーインタラクション**: 複数操作の組み合わせ

### Visual Regression Tests
- **スナップショット**: 各コンポーネントの外観
- **レスポンシブ**: モバイル/タブレット/デスクトップ
- **状態別**: Loading/Error/Empty/Success

## 📋 実装チェックリスト

### 開発準備
- [ ] TypeScript型定義
- [ ] スタイリングCSS/SCSS
- [ ] テストファイル準備
- [ ] Storybook設定

### コンポーネント実装
- [ ] ${featureName}Container
- [ ] ${featureName}Header
- [ ] ${featureName}Content
- [ ] ${featureName}Actions

### テスト実装
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Visual Tests
- [ ] アクセシビリティTests

## 🔄 次のステップ
1. **実装開始**: コンポーネント開発
2. **テスト実行**: 品質確保
3. **統合テスト**: システム結合
4. **パフォーマンス最適化**: 高速化

## 📎 参考資料
- **UIデザイン**: ../ui-design/
- **プロトタイプ**: ../prototypes/
- **APIスペック**: ../../api/
- **デザインシステム**: ../../design-system/

---
*記録者: AI Component Team*
*FDD Phase: Component Design*
*前フェーズ: Prototype*
*次フェーズ: Integration*`;

    const filePath = join(componentPath, `Component_Design_${timestamp}_${featureName}.md`);
    await fs.writeFile(filePath, componentContent, 'utf-8');

    console.log(`⚡ Generated component design template: ${filePath}`);
    return filePath;
  }

  /**
   * Execute FDD phase workflow
   */
  async executeFddPhase(
    featureName: string,
    phase: FddPhase['name'],
    project: FddProject
  ): Promise<FddProject> {
    console.log(`🚀 Executing FDD phase: ${phase} for ${featureName}`);

    const updatedProject = { ...project, currentPhase: phase };

    switch (phase) {
      case 'ui-design':
        await this.generateUiDesignTemplate(featureName);
        updatedProject.phases['ui-design'].completed = true;
        break;

      case 'prototype':
        const prototypeFile = await this.generatePrototypeTemplate(featureName);
        updatedProject.prototypePath = prototypeFile;
        updatedProject.phases['prototype'].completed = true;
        break;

      case 'component-design':
        const componentFile = await this.generateComponentDesignTemplate(featureName);
        updatedProject.componentPath = componentFile;
        updatedProject.phases['component-design'].completed = true;
        break;

      case 'integration':
        await this.generateIntegrationTemplate(featureName);
        updatedProject.phases['integration'].completed = true;
        break;

      case 'testing':
        await this.generateTestingTemplate(featureName);
        updatedProject.phases['testing'].completed = true;
        break;
    }

    console.log(`✅ FDD phase ${phase} completed for ${featureName}`);
    return updatedProject;
  }

  /**
   * Generate integration template
   */
  private async generateIntegrationTemplate(featureName: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const integrationPath = join(this.projectRoot, 'docs', 'fdd', featureName, 'integration');

    const integrationContent = `# Integration_${timestamp}_${featureName}.md

## 🔗 統合テスト - ${featureName}
**Date**: ${new Date().toISOString()}
**Phase**: Integration (FDD Phase 4)
**Feature**: ${featureName}

## 🎯 統合目標
- **コンポーネント結合**: 個別コンポーネントの統合
- **API統合**: バックエンドとの連携
- **システム統合**: 既存システムとの協調
- **パフォーマンス確認**: 統合後の性能検証

## 📋 統合チェックリスト
- [ ] フロントエンド統合
- [ ] API統合
- [ ] データフロー確認
- [ ] エラーハンドリング
- [ ] パフォーマンステスト

---
*記録者: AI Integration Team*
*FDD Phase: Integration*`;

    const filePath = join(integrationPath, `Integration_${timestamp}_${featureName}.md`);
    await fs.writeFile(filePath, integrationContent, 'utf-8');
  }

  /**
   * Generate testing template
   */
  private async generateTestingTemplate(featureName: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const testingPath = join(this.projectRoot, 'docs', 'fdd', featureName, 'testing');

    const testingContent = `# Testing_${timestamp}_${featureName}.md

## 🧪 総合テスト - ${featureName}
**Date**: ${new Date().toISOString()}
**Phase**: Testing (FDD Phase 5)
**Feature**: ${featureName}
**Strategy**: ${this.config.testingStrategy}

## 🎯 テスト目標
- **機能確認**: 全機能の動作検証
- **品質確保**: バグ・不具合の排除
- **ユーザビリティ**: 使いやすさの最終確認
- **パフォーマンス**: 速度・安定性の検証

## 📋 テストチェックリスト
- [ ] Unit Tests: ${this.config.testingStrategy.includes('unit') ? '実施' : 'スキップ'}
- [ ] E2E Tests: ${this.config.testingStrategy.includes('e2e') ? '実施' : 'スキップ'}
- [ ] Visual Tests: ${this.config.testingStrategy.includes('visual') ? '実施' : 'スキップ'}
- [ ] ユーザビリティテスト
- [ ] パフォーマンステスト

---
*記録者: AI Testing Team*
*FDD Phase: Testing*`;

    const filePath = join(testingPath, `Testing_${timestamp}_${featureName}.md`);
    await fs.writeFile(filePath, testingContent, 'utf-8');
  }

  /**
   * Get FDD project status
   */
  async getFddStatus(featureName: string): Promise<{ phases: string; currentPhase: string; completion: number }> {
    const phases = ['ui-design', 'prototype', 'component-design', 'integration', 'testing'];
    let completed = 0;

    for (const phase of phases) {
      const phasePath = join(this.projectRoot, 'docs', 'fdd', featureName, phase);
      try {
        const files = await fs.readdir(phasePath);
        if (files.length > 0) completed++;
      } catch {
        // Phase directory doesn't exist yet
      }
    }

    const completion = Math.round((completed / phases.length) * 100);
    const currentPhase = phases[completed] || 'completed';

    return {
      phases: phases.join(' → '),
      currentPhase,
      completion
    };
  }

  /**
   * Update FDD configuration
   */
  updateConfig(newConfig: Partial<FddWorkflowConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get FDD configuration
   */
  getConfig(): FddWorkflowConfig {
    return { ...this.config };
  }
}