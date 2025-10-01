// Check what models are available with your API key
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ No API key found in .env.local');
  process.exit(1);
}

console.log('🔍 Checking API key:', apiKey.substring(0, 15) + '...\n');

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
  .then(res => {
    console.log('📡 Response Status:', res.status, res.statusText);
    return res.json();
  })
  .then(data => {
    if (data.error) {
      console.error('\n❌ API ERROR:', data.error.message);
      console.error('Status:', data.error.status);
      console.error('\n🔧 This means:');
      
      if (data.error.status === 'PERMISSION_DENIED') {
        console.error('• Your API key is invalid or restricted');
        console.error('• The API is not enabled for this key');
        console.error('\n✅ SOLUTION: Create a NEW API key at:');
        console.error('   https://aistudio.google.com/app/apikey');
      }
      
      process.exit(1);
    }
    
    if (data.models && data.models.length > 0) {
      console.log('\n✅ SUCCESS! Available models:\n');
      data.models.forEach(model => {
        const name = model.name.replace('models/', '');
        const methods = model.supportedGenerationMethods || [];
        if (methods.includes('generateContent')) {
          console.log(`✓ ${name} - ${model.displayName}`);
        }
      });
      
      const generateModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (generateModels.length > 0) {
        const recommended = generateModels[0].name.replace('models/', '');
        console.log(`\n🎯 Use this model: ${recommended}`);
      }
    } else {
      console.log('\n⚠️ No models found for this API key');
      console.log('\n✅ SOLUTION: Create a NEW API key at:');
      console.log('   https://aistudio.google.com/app/apikey');
    }
  })
  .catch(err => {
    console.error('\n❌ Network Error:', err.message);
    console.error('\nCheck your internet connection');
  });
