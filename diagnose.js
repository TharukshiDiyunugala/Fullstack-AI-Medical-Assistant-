// Complete diagnostic for Gemini API issues
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
  console.log('🔍 GEMINI API DIAGNOSTIC\n');
  console.log('=' .repeat(60));
  
  // Check 1: API Key exists
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found in .env.local');
    console.log('\n✅ FIX: Add this line to .env.local:');
    console.log('GEMINI_API_KEY=your-api-key-here\n');
    process.exit(1);
  }
  
  console.log('✓ API Key found');
  console.log('  Format:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
  console.log('  Length:', apiKey.length, 'characters');
  
  // Check 2: API Key format
  if (!apiKey.startsWith('AIza')) {
    console.log('⚠️  WARNING: API key should start with "AIza"');
    console.log('   Your key starts with:', apiKey.substring(0, 4));
  } else {
    console.log('✓ API Key format looks correct');
  }
  
  if (apiKey.length < 35 || apiKey.length > 45) {
    console.log('⚠️  WARNING: API key length unusual (should be ~39 chars)');
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📡 Testing API Connection...\n');
  
  // Check 3: Test API connection
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response Status:', response.status, response.statusText);
    
    if (data.error) {
      console.log('\n❌ API ERROR:', data.error.message);
      console.log('Status:', data.error.status);
      console.log('Code:', data.error.code);
      
      console.log('\n🔧 DIAGNOSIS:');
      
      if (data.error.status === 'PERMISSION_DENIED' || data.error.code === 403) {
        console.log('• Your API key is INVALID or RESTRICTED');
        console.log('• The Generative Language API is NOT enabled');
        console.log('\n✅ SOLUTION:');
        console.log('1. Go to: https://aistudio.google.com/app/apikey');
        console.log('2. Click "Create API Key"');
        console.log('3. Select "Create API key in new project"');
        console.log('4. Copy the NEW key');
        console.log('5. Replace in .env.local');
        console.log('6. Restart: npm run dev');
      } else if (data.error.code === 400) {
        console.log('• Your API key format is INVALID');
        console.log('\n✅ SOLUTION:');
        console.log('Get a new key from: https://aistudio.google.com/app/apikey');
      }
      
      console.log('\n');
      process.exit(1);
    }
    
    // Check 4: List available models
    if (data.models && data.models.length > 0) {
      console.log('\n✅ SUCCESS! Your API key works!\n');
      console.log('=' .repeat(60));
      console.log('📦 Available Models:\n');
      
      const generateModels = [];
      
      data.models.forEach(model => {
        const name = model.name.replace('models/', '');
        const methods = model.supportedGenerationMethods || [];
        
        if (methods.includes('generateContent')) {
          generateModels.push(name);
          console.log(`✓ ${name}`);
          console.log(`  Display: ${model.displayName}`);
          console.log(`  Methods: ${methods.join(', ')}`);
          console.log('');
        }
      });
      
      if (generateModels.length > 0) {
        console.log('=' .repeat(60));
        console.log('🎯 RECOMMENDED MODEL:', generateModels[0]);
        console.log('\n✅ Your API is configured correctly!');
        console.log('   You can now use the chat feature.\n');
      } else {
        console.log('⚠️  No models support generateContent');
        console.log('   This is unusual. Try creating a new API key.\n');
      }
      
    } else {
      console.log('\n⚠️  No models returned');
      console.log('This usually means the API is not enabled.\n');
      console.log('✅ SOLUTION:');
      console.log('Create a new key at: https://aistudio.google.com/app/apikey\n');
    }
    
  } catch (error) {
    console.log('\n❌ NETWORK ERROR:', error.message);
    console.log('\nCheck your internet connection and try again.\n');
    process.exit(1);
  }
}

diagnose();
