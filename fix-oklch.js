const fs = require('fs');

// 1. Update globals.css
let css = fs.readFileSync('app/globals.css', 'utf8');

css = css.replace(/hsl\(210 40% 98%\)/g, 'oklch(0.985 0 0)');
css = css.replace(/210 40% 98%/g, '0.985 0 0');
css = css.replace(/oklch\(\s*1\s+0\s+0\s+\/\s*10%\s*\)/g, 'oklch(0.23 0 0)');
css = css.replace(/oklch\(\s*1\s+0\s+0\s+\/\s*15%\s*\)/g, 'oklch(0.273 0 0)');

css = css.replace(/oklch\(([^)]+)\)/g, '$1');

fs.writeFileSync('app/globals.css', css, 'utf8');

// 2. Update tailwind.config.js
let tw = fs.readFileSync('tailwind.config.js', 'utf8');
tw = tw.replace(/"var\(--([^)]+)\)"/g, '"oklch(var(--$1) / <alpha-value>)"');
fs.writeFileSync('tailwind.config.js', tw, 'utf8');

console.log("Transformation complete!");
