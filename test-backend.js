const axios = require('axios');

const BACKEND_URL = 'https://food-ordering-app-backend-bi38.onrender.com';

async function testBackend() {
  console.log('🔍 Testing Backend Status...\n');
  
  try {
    // Test ping endpoint (fastest)
    console.log('1. Testing /ping endpoint...');
    const startTime = Date.now();
    const pingResponse = await axios.get(`${BACKEND_URL}/ping`, { timeout: 10000 });
    const pingTime = Date.now() - startTime;
    console.log(`✅ Ping successful: ${pingResponse.data} (${pingTime}ms)\n`);
    
    // Test health endpoint
    console.log('2. Testing /health endpoint...');
    const healthStart = Date.now();
    const healthResponse = await axios.get(`${BACKEND_URL}/health`, { timeout: 15000 });
    const healthTime = Date.now() - healthStart;
    console.log(`✅ Health check successful:`, healthResponse.data);
    console.log(`⏱️  Response time: ${healthTime}ms\n`);
    
    // Test main endpoint
    console.log('3. Testing main endpoint...');
    const mainStart = Date.now();
    const mainResponse = await axios.get(`${BACKEND_URL}/`, { timeout: 15000 });
    const mainTime = Date.now() - mainStart;
    console.log(`✅ Main endpoint successful:`, mainResponse.data);
    console.log(`⏱️  Response time: ${mainTime}ms\n`);
    
    // Test API endpoint
    console.log('4. Testing /api/food/list endpoint...');
    const apiStart = Date.now();
    const apiResponse = await axios.get(`${BACKEND_URL}/api/food/list`, { timeout: 20000 });
    const apiTime = Date.now() - apiStart;
    console.log(`✅ API endpoint successful: ${apiResponse.data.success ? '✅' : '❌'}`);
    console.log(`📊 Food items count: ${apiResponse.data.data?.length || 0}`);
    console.log(`⏱️  Response time: ${apiTime}ms\n`);
    
    console.log('🎉 All tests passed! Backend is responding well.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNABORTED') {
      console.log('💡 This might be a cold start. Try again in a few seconds.');
    }
  }
}

// Run the test
testBackend(); 