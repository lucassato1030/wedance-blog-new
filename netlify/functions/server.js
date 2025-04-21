// This is a proxy handler for Nuxt SSR
// It delegates to the Nuxt-generated server handler

export default async function handler(event, context) {
    // This function should never be called directly
    // The .output/server handler should be used
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "This is a placeholder. The Netlify deployment should be using the Nuxt SSR handler."
      })
    };
  } 