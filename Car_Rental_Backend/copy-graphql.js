const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else if (exists && stats.isFile()) {
    if (src.endsWith('.graphql')) {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(src, dest);
    }
  }
}

try {
  copyRecursiveSync(
    path.join(__dirname, 'src'),
    path.join(__dirname, 'dist', 'src')
  );
  console.log('✅ GraphQL schema files copied to dist/src/');
} catch (err) {
  console.error('❌ Failed to copy GraphQL files:', err);
  process.exit(1);
}