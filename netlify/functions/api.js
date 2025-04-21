// This is a simple proxy function to handle API requests in a static Netlify deployment
// For more complex applications, you'll need to reimplement your API logic as Netlify functions

exports.handler = async function(event, context) {
  // Basic CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Extract path and parameters
    const path = event.path.replace(/^\/\.netlify\/functions\/api/, '');
    
    // In a real implementation, you would handle different API routes here
    // For example, differentiating between /api/users, /api/posts, etc.
    
    if (path === '/test' || path === '/api/test') {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'API is working via Netlify Functions!' })
      };
    }
    
    // Default response for unimplemented endpoints
    return {
      statusCode: 501,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Not implemented',
        message: 'This API endpoint has not been implemented in Netlify Functions yet.'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
}; 