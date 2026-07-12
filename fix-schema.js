const fs = require('fs');
let schema = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

schema = schema.replace(/@relation\(([^)]+)\)/g, (match, p1) => {
    if (p1.includes('onDelete') || p1.includes('onUpdate')) return match;
    if (!p1.includes('fields:')) return match;
    return `@relation(${p1}, onDelete: NoAction, onUpdate: NoAction)`;
});

fs.writeFileSync('backend/prisma/schema.prisma', schema);
console.log("Schema patched!");
