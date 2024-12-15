const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';

const getCommand = (cmd) => {
  if (isWindows && cmd === 'npm') {
    return 'npm.cmd';
  }
  return cmd;
};

const services = {
  backend: { command: 'npm', args: ['run', 'start'], cwd: './backend', process: null },
  frontendAdmin: { command: 'npm', args: ['run', 'dev'], cwd: './frontend-admin', process: null },
  frontendOperator: { command: 'npm', args: ['run', 'dev'], cwd: './frontend-operator', process: null },
  pythonAPI: { command: 'python', args: ['routerServiceAPI.py'], cwd: './backend/services/routerService', process: null },
};

function runService(serviceName) {
  const service = services[serviceName];
  if (!service) {
    console.error(`Service "${serviceName}" not found.`);
    return;
  }

  console.log(`Starting ${serviceName}...`);

  const command = getCommand(service.command);
  const child = spawn(command, service.args, {
    cwd: path.join(__dirname, service.cwd),
    stdio: 'inherit',
    shell: isWindows
  });

  service.process = child;

  child.on('error', (err) => {
    console.error(`Error starting ${serviceName}:`, err);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`${serviceName} exited with code ${code}. Restarting...`);
      restartService(serviceName);
    } else {
      console.log(`${serviceName} stopped gracefully.`);
    }
  });

  child.on('exit', (code) => {
    console.log(`${serviceName} process exited with code ${code}`);
    if (code !== 0) restartService(serviceName);
  });
}

function startAllServices() {
  console.log('Starting All Services...');
  Object.keys(services).forEach((serviceName) => runService(serviceName));
}

function restartService(serviceName) {
  console.log(`Restarting ${serviceName}...`);
  stopService(serviceName, () => runService(serviceName));
}

function stopService(serviceName, callback) {
  const service = services[serviceName];
  if (service && service.process) {
    console.log(`Stopping ${serviceName}...`);
    service.process.kill();
    service.process = null;
    if (callback) callback();
  } else {
    console.log(`${serviceName} is not running.`);
    if (callback) callback();
  }
}

function checkServiceStatus() {
  console.log('\nService Status:');
  Object.keys(services).forEach((serviceName) => {
    const service = services[serviceName];
    if (service.process) {
      console.log(`- ${serviceName}: RUNNING (PID: ${service.process.pid})`);
    } else {
      console.log(`- ${serviceName}: STOPPED`);
    }
  });
  console.log();
}

// Start monitoring service statuses every 10 seconds
function startMonitoring() {
  setInterval(checkServiceStatus, 10000); // Adjust interval as needed
}

// Run the script
startAllServices();
startMonitoring();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down all services...');
  Object.keys(services).forEach((serviceName) => stopService(serviceName));
  process.exit();
});