const electronInstaller = require('electron-winstaller');
const path = require('path');

const rootPath = path.join(__dirname, '..');
const outPath = path.join(rootPath, 'release-builds-final');

console.log('Creating Windows installer...');

const settings = {
    appDirectory: path.join(outPath, 'ESAPAIListen-win32-x64'),
    outputDirectory: path.join(rootPath, 'installers'),
    authors: 'ESAP Listen Team',
    exe: 'ESAPAIListen.exe',
    setupExe: 'ESAPAIListenSetup.exe',
    setupIcon: path.join(rootPath, 'public/esapai_logo.ico'),
    noMsi: true,
    description: 'Background Listening Agent Desktop App'
};

resultPromise = electronInstaller.createWindowsInstaller(settings);

resultPromise.then(() => {
    console.log("Installer created successfully!");
}, (e) => {
    console.log(`Error creating installer: ${e.message}`);
    process.exit(1);
});
