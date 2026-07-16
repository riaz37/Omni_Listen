const fs = require('fs');
const path = require('path');
const packager = require('electron-packager'); // Loaded from root node_modules
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const staging = path.join(root, 'staging');

async function buildAndPackage() {
    console.log('--- Starting Clean Packaging Process ---');
    console.log(`Root: ${root}`);
    console.log(`Staging: ${staging}`);

    // 1. Prepare Staging
    try {
        if (fs.existsSync(staging)) {
            console.log('Cleaning staging directory...');
            fs.rmSync(staging, { recursive: true, force: true });
        }
        fs.mkdirSync(staging);
    } catch (e) {
        console.error('Failed to clean staging:', e);
        process.exit(1);
    }

    // 2. Copy Essentials
    console.log('Copying application files...');
    try {
        fs.copyFileSync(path.join(root, 'package.json'), path.join(staging, 'package.json'));
        fs.copyFileSync(path.join(root, 'package-lock.json'), path.join(staging, 'package-lock.json'));
        
        fs.cpSync(path.join(root, 'public'), path.join(staging, 'public'), { recursive: true });
        fs.cpSync(path.join(root, 'dist-electron'), path.join(staging, 'dist-electron'), { recursive: true });
        
        const outPath = path.join(root, 'out');
        if (fs.existsSync(outPath)) {
            fs.cpSync(outPath, path.join(staging, 'out'), { recursive: true });
        } else {
            console.warn('WARNING: "out" folder not found! Next.js build might be missing.');
        }

        // Copy esapai_logo.ico specifically if it's not in public (it should be)
        if (!fs.existsSync(path.join(staging, 'public', 'esapai_logo.ico'))) {
            // copy from root public if needed, or assume convert-icon put it there
            const icoSrc = path.join(root, 'public', 'esapai_logo.ico');
            if (fs.existsSync(icoSrc)) {
                 fs.copyFileSync(icoSrc, path.join(staging, 'public', 'esapai_logo.ico'));
            }
        }

    } catch (e) {
        console.error('Failed to copy files:', e);
        process.exit(1);
    }

    // 3. Install Production Dependencies
    console.log('Installing production dependencies (npm ci --omit=dev)...');
    try {
        execSync('npm ci --omit=dev', { cwd: staging, stdio: 'inherit' });
    } catch (e) {
        console.error('Failed to install dependencies:', e);
        process.exit(1);
    }

    // 4. Package
    console.log('Packaging app using electron-packager...');
    const options = {
        dir: staging,
        overwrite: true,
        platform: 'win32',
        arch: 'x64',
        icon: path.join(staging, 'public', 'esapai_logo.ico'),
        prune: false, // Already pruned by npm ci --omit=dev
        out: path.join(root, 'release-builds-final'),
        asar: true,
        // No ignore needed because staging is clean!
    };

    try {
        const appPaths = await packager(options);
        console.log(`Wrote new app to: ${appPaths.join('\n')}`);
    } catch (err) {
        console.error('Packaging failed:', err);
        process.exit(1);
    }
}

buildAndPackage();
