import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = '/Users/inova/Desktop/dev/iPRODUCE app';
const libPrismaPath = path.join(rootDir, 'lib', 'prisma');

const result = execSync('grep -rl "new PrismaClient()" .', { cwd: rootDir, encoding: 'utf-8' });
const files = result.trim().split('\n').filter(Boolean);

for (const file of files) {
  if (file.includes('lib/prisma.ts') || file.includes('node_modules') || file.includes('.next')) continue;
  
  const absFile = path.join(rootDir, file);
  const fileDir = path.dirname(absFile);
  let relativePath = path.relative(fileDir, libPrismaPath);
  if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
  }
  
  relativePath = relativePath.replace(/\\/g, '/');

  let content = fs.readFileSync(absFile, 'utf-8');
  
  content = content.replace(/import\s*\{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"];?\n?/g, '');
  content = content.replace(/const\s+prisma\s+=\s+new\s+PrismaClient\(\)?;?/g, `import { prisma } from '${relativePath}';`);
  
  fs.writeFileSync(absFile, content);
  console.log('Fixed', file, 'with relative path', relativePath);
}
