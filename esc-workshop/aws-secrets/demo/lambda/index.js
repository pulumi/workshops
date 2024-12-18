const axios = require('axios');

exports.handler = async (event) => {
    // Retrieve the GitHub API key from environment variables
    const apiKey = process.env.GITHUB_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'GitHub API key not provided' }),
        };
    }

    try {
        // Make a GET request to the GitHub API to fetch the authenticated user's information
        const response = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${apiKey}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        // Return the user's information
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully fetched user information',
                user: {
                    login: response.data.login,
                    name: response.data.name,
                    publicRepos: response.data.public_repos,
                    followers: response.data.followers,
                    following: response.data.following
                }
            }),
        };
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return {
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({ error: 'Failed to fetch user information' }),
        };
    }
};