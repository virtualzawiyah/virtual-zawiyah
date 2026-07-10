const fs = require('fs');
const content = fs.readFileSync('schema.sql', 'utf8');
const lines = content.split('\n');

console.log('--- Searching for enrollment_requests definition ---');
let printing = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('CREATE TABLE enrollment_requests') || line.includes('create table enrollment_requests')) {
    printing = true;
  }
  if (printing) {
    console.log(`${i+1}: ${line}`);
    if (line.includes(');')) {
      printing = false;
    }
  }
}
