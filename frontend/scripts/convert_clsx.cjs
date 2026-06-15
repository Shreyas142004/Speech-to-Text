const fs = require('fs');
let content = fs.readFileSync('d:/Certificates/Speech-reading/frontend/src/App.jsx', 'utf8');

content = content.replace(/className=\{clsx\(([^)]+)\)\}/g, (match, p1) => {
    const matches = [...p1.matchAll(/'([^']+)'/g)];
    const classes = matches.map(m => m[1]).join(' ');
    return `className="${classes}"`;
});

content = content.replace(/import clsx from 'clsx';\n/g, '');

fs.writeFileSync('d:/Certificates/Speech-reading/frontend/src/App.jsx', content);
