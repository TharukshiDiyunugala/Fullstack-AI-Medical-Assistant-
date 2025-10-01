// Quick test script to verify Gemini API connection
// Run with: node test-gemini.js

require('dotenv').config({ path: '.env.local' });

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('🔍 Testing Gemini API Configuration...\n');
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not set in .env.local');
    console.log('\nPlease add your API key to .env.local:');
    console.log('GEMINI_API_KEY=your-api-key-here\n');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try different model names
    const modelNames = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    let model, result, response, text;
    let lastError;
    
    for (const modelName of modelNames) {
      try {
        console.log(`🔄 Trying model: ${modelName}...`);
        model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent('Say "Hello, API is working!"');
        response = result.response;
        text = response.text();
        console.log(`✅ Success with model: ${modelName}\n`);
        break;
      } catch (err) {
        console.log(`❌ ${modelName} not available`);
        lastError = err;
      }
    }
    
    if (!text) {
      throw lastError;
    }
    
    console.log('✅ SUCCESS! API Response:');
    console.log('─'.repeat(50));
    console.log(text);
    console.log('─'.repeat(50));
    console.log('\n✨ Your Gemini API is configured correctly!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error details:');
    console.error(error);
    
    console.log('\n📋 Troubleshooting:');
    
    if (error.message?.includes('API key')) {
      console.log('• Your API key appears to be invalid');
      console.log('• Get a new key from: https://makersuite.google.com/app/apikey');
    } else if (error.message?.includes('403') || error.message?.includes('PERMISSION_DENIED')) {
      console.log('• API access denied - check these:');
      console.log('  1. Enable billing in Google Cloud Console');
      console.log('  2. Enable the Gemini API for your project');
      console.log('  3. Verify API key restrictions');
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('network')) {
      console.log('• Network connection issue');
      console.log('• Check your internet connection and firewall');
    } else {
      console.log('• Check the error message above for details');
      console.log('• Visit: https://ai.google.dev/gemini-api/docs/troubleshooting');
    }
    
    console.log('\n');
    process.exit(1);
  }
}

testGeminiAPI();
