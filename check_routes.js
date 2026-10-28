const fs = require('fs'); 
const content = fs.readFileSync('temp.js', 'utf8'); 
const routes = content.match(/path:\s*['"].*?['"]/g); 
console.log([...new Set(routes)]);
