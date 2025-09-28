#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const cliPath = join(process.cwd(), 'dist', 'cli.js');

try {
  const content = await readFile(cliPath, 'utf-8');

  if (!content.startsWith('#!/usr/bin/env node')) {
    const newContent = '#!/usr/bin/env node\n' + content;
    await writeFile(cliPath, newContent, 'utf-8');
    console.log('✅ Shebang added to cli.js');
  } else {
    console.log('✅ Shebang already present in cli.js');
  }
} catch (error) {
  console.warn('⚠️ Could not add shebang to cli.js:', error.message);
}