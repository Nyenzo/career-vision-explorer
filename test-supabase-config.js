/**
 * Test Supabase Configuration
 * This script helps verify your Supabase configuration
 */

console.log('🔍 Testing Supabase Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || '❌ Not set');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');

// Check if .env file exists
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');

console.log('\n📁 Environment Files:');
console.log('.env file:', fs.existsSync(envPath) ? '✅ Exists' : '❌ Not found');
console.log('.env.local file:', fs.existsSync(envLocalPath) ? '✅ Exists' : '❌ Not found');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n📋 .env file contents:');
  console.log(envContent);
}

console.log('\n🔧 Next Steps:');
console.log('1. Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
console.log('2. Enable LinkedIn provider in your Supabase dashboard');
console.log('3. Configure LinkedIn Developer App with correct redirect URL');
console.log('4. Test the LinkedIn login button');
