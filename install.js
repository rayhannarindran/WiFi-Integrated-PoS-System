const { execSync } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';

const services = [
    { name: 'backend', path: './backend' },
    { name: 'frontend-admin', path: './frontend-admin' },
    { name: 'frontend-operator', path: './frontend-operator' }
];

function installNpmDependencies() {
    console.log('Installing NPM dependencies...');
    
    services.forEach(service => {
        try {
            console.log(`\nInstalling dependencies for ${service.name}...`);
            execSync('npm install', {
                cwd: path.join(__dirname, service.path),
                stdio: 'inherit',
                shell: isWindows
            });
            console.log(`✓ ${service.name} dependencies installed successfully`);
        } catch (error) {
            console.error(`× Error installing dependencies for ${service.name}:`, error.message);
            process.exit(1);
        }
    });
}

function installPythonRequirements() {
    console.log('\nInstalling Python requirements...');
    
    const pythonCommand = 'pip install -r python-requirements.txt';
    
    try {
        execSync(pythonCommand, {
            cwd: path.join(__dirname, './backend'),
            stdio: 'inherit',
            shell: isWindows
        });
        console.log('✓ Python requirements installed successfully');
    } catch (error) {
        console.error('× Error installing Python requirements:', error.message);
        process.exit(1);
    }
}

// Run installations
console.log('Starting installation process...\n');
installNpmDependencies();
installPythonRequirements();
console.log('\nAll installations completed successfully!');