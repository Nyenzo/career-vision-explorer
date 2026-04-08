// Test script for employer dashboard endpoints
// Run this in the browser console when logged in as an employer

async function testEmployerEndpoints() {
  console.log('Testing employer endpoints...');
  
  try {
    // Test 1: Get employer job stats
    console.log('\n1. Testing /jobs/my-stats endpoint...');
    const statsResponse = await fetch('/api/v1/jobs/my-stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Stats response status:', statsResponse.status);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('Stats data:', stats);
    } else {
      console.error('Stats error:', await statsResponse.text());
    }
    
    // Test 2: Get employer jobs
    console.log('\n2. Testing /jobs/my-jobs endpoint...');
    const jobsResponse = await fetch('/api/v1/jobs/my-jobs', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Jobs response status:', jobsResponse.status);
    if (jobsResponse.ok) {
      const jobs = await jobsResponse.json();
      console.log('Jobs data:', jobs);
    } else {
      console.error('Jobs error:', await jobsResponse.text());
    }
    
    // Test 3: Get employer applications
    console.log('\n3. Testing /applications/ endpoint for employer...');
    const appsResponse = await fetch('/api/v1/applications/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Applications response status:', appsResponse.status);
    if (appsResponse.ok) {
      const apps = await appsResponse.json();
      console.log('Applications data:', apps);
    } else {
      console.error('Applications error:', await appsResponse.text());
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testEmployerEndpoints();
