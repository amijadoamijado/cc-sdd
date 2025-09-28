#!/usr/bin/env node

import { runEnhancedCli } from './index.js';

const main = async (): Promise<void> => {
  try {
    const exitCode = await runEnhancedCli(process.argv.slice(2));
    process.exit(exitCode);
  } catch (error) {
    console.error('Enhanced CC-SDD Error:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}