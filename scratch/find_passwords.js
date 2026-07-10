const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        searchDir(filePath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.sql') || file.endsWith('.json') || file.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('password123') || content.includes('teacher@test.com') || content.includes('password') || content.includes('testpassword')) {
        console.log(`Found match in ${filePath}`);
      }
    }
  }
}

searchDir('.');
