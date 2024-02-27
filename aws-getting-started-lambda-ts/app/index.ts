import {APIGatewayEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import fetch from 'node-fetch';

interface DadJokeResponse {
    id: string;
    joke: string;
    status: number;
}

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    try {
        // Call the icanhazdadjoke API
        const response = await fetch('https://icanhazdadjoke.com/', {
            headers: {'Accept': 'application/json'}
        });

        // Wait for the JSON response
        const data: DadJokeResponse = <DadJokeResponse>await response.json();

        // Return the joke in the response body
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: data.joke,
            }),
        };
    } catch (error) {
        console.error('Error fetching dad joke:', error);

        // Return an error message
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to fetch dad joke',
            }),
        };
    }
};
