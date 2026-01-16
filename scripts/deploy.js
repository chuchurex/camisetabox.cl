#!/usr/bin/env node
/**
 * deploy.js - Deploy to Hostinger via SSH/rsync
 *
 * Usage: npm run deploy
 *
 * Requirements:
 * - sshpass installed: brew install hudochenkov/sshpass/sshpass
 * - .env with UPLOAD_* variables configured
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadEnv() {
    const envPath = resolve(rootDir, '.env');
    if (!existsSync(envPath)) {
        log('ERROR: .env file not found', 'red');
        log('Copy .env.example to .env and configure your credentials', 'yellow');
        process.exit(1);
    }

    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};

    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
        }
    });

    return env;
}

function checkDependencies() {
    try {
        execSync('which sshpass', { stdio: 'pipe' });
    } catch {
        log('ERROR: sshpass not installed', 'red');
        log('Install with: brew install hudochenkov/sshpass/sshpass', 'yellow');
        process.exit(1);
    }

    try {
        execSync('which rsync', { stdio: 'pipe' });
    } catch {
        log('ERROR: rsync not installed', 'red');
        process.exit(1);
    }
}

function validateEnv(env) {
    const required = ['UPLOAD_HOST', 'UPLOAD_PORT', 'UPLOAD_USER', 'UPLOAD_PASS', 'UPLOAD_DIR'];
    const missing = required.filter(key => !env[key]);

    if (missing.length > 0) {
        log(`ERROR: Missing environment variables: ${missing.join(', ')}`, 'red');
        process.exit(1);
    }
}

function deploy() {
    log('\n========================================', 'cyan');
    log('  DEPLOY TO HOSTINGER - camisetabox.cl', 'cyan');
    log('========================================\n', 'cyan');

    // Check dependencies
    log('Checking dependencies...', 'blue');
    checkDependencies();
    log('Dependencies OK', 'green');

    // Load environment
    log('Loading environment...', 'blue');
    const env = loadEnv();
    validateEnv(env);
    log('Environment OK', 'green');

    // Check dist directory
    const distPath = resolve(rootDir, 'dist');
    if (!existsSync(distPath)) {
        log('ERROR: dist/ directory not found', 'red');
        log('Run: npm run build', 'yellow');
        process.exit(1);
    }
    log('dist/ directory found', 'green');

    // Build rsync command
    const rsyncCmd = [
        'sshpass',
        `-p "${env.UPLOAD_PASS}"`,
        'rsync',
        '-avz',
        '--delete',
        '-e', `"ssh -p ${env.UPLOAD_PORT} -o StrictHostKeyChecking=no"`,
        `${distPath}/`,
        `${env.UPLOAD_USER}@${env.UPLOAD_HOST}:${env.UPLOAD_DIR}/`
    ].join(' ');

    log('\nDeploying files...', 'blue');
    log(`Target: ${env.UPLOAD_USER}@${env.UPLOAD_HOST}:${env.UPLOAD_DIR}`, 'cyan');

    try {
        execSync(rsyncCmd, {
            stdio: 'inherit',
            cwd: rootDir
        });
        log('\nDeploy completed successfully!', 'green');
        log(`Site: https://${env.DOMAIN || 'camisetabox.cl'}`, 'cyan');
    } catch (error) {
        log('\nERROR: Deploy failed', 'red');
        log(error.message, 'red');
        process.exit(1);
    }
}

deploy();
