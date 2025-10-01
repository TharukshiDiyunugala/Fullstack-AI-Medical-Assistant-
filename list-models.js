// List available Gemini models for your API key
// Run with: node list-models.js

require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('🔍 Checking available Gemini models...\n');
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not set in .env.local');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...\n');
  
  try {
    // Try to list models using the REST API directly
    const fetch = (await import('node-fetch')).default;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    console.log('📡 Fetching available models from Google AI...\n');
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      console.error('Response:', JSON.stringify(data, null, 2));
      
      if (response.status === 403) {
        console.log('\n⚠️  403 Forbidden - This usually means:');
        console.log('1. The API key is invalid or revoked');
        console.log('2. The Generative Language API is not enabled');
        console.log('3. Billing is not enabled (required even for free tier)');
        console.log('\n📋 Steps to fix:');
        console.log('1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
        console.log('2. Enable the "Generative Language API"');
        console.log('3. Set up billing: https://console.cloud.google.com/billing');
        console.log('4. Or create a new API key: https://aistudio.google.com/app/apikey');
      }
      
      process.exit(1);
    }
    
    if (data.models && data.models.length > 0) {
      console.log('✅ Available models:\n');
      data.models.forEach(model => {
        console.log(`📦 ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Description: ${model.description}`);
        if (model.supportedGenerationMethods) {
          console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
        console.log('');
      });
      
      // Find the best model to use
      const generateModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (generateModels.length > 0) {
        const recommended = generateModels[0].name.replace('models/', '');
        console.log(`\n✨ Recommended model to use: ${recommended}`);
        console.log(`\nUpdate your code to use this model name.`);
      }
    } else {
      console.log('⚠️  No models available for this API key');
      console.log('\nThis usually means:');
      console.log('1. The Generative Language API is not enabled');
      console.log('2. Billing is not set up');
      console.log('3. The API key doesn\'t have proper permissions');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n⚠️  Network error - cannot reach Google AI servers');
      console.log('Check your internet connection and firewall settings');
    } else {
      console.error('\nFull error:', error);
    }
    
    process.exit(1);
  }
}

listModels();
