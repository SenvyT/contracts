const fs = require('fs');
const path = require('path');

// Copy artifacts and ignition directories to public folder
function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

// Copy artifacts
const artifactsSource = path.join(__dirname, '../../artifacts');
const artifactsDest = path.join(__dirname, 'artifacts');

if (fs.existsSync(artifactsSource)) {
  copyDirectory(artifactsSource, artifactsDest);
  console.log('✅ Artifacts copied to public folder');
} else {
  console.log('⚠️  Artifacts directory not found');
}

// Copy ignition
const ignitionSource = path.join(__dirname, '../../ignition');
const ignitionDest = path.join(__dirname, 'ignition');

if (fs.existsSync(ignitionSource)) {
  copyDirectory(ignitionSource, ignitionDest);
  console.log('✅ Ignition deployments copied to public folder');
} else {
  console.log('⚠️  Ignition directory not found');
}

console.log('🎉 Contract files copied successfully!'); 