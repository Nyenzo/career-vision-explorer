import { apiClient } from '../lib/api-client';

(async function testListFreelancers() {
  try {
    const response = await apiClient.get('/freelancers', {
      params: {
        limit: 10,
        offset: 0
      }
    });
    console.log('Freelancers:', response.data);
  } catch (error) {
    console.error('Error fetching freelancers:', error);
  }
})();

