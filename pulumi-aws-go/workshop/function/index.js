const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const params = {
        TableName: 'HighScores',
        Key: {
            'UserId': event.queryStringParameters.UserId,
            'GameTitle': event.queryStringParameters.GameTitle
        }
    };

    try {
        const data = await dynamo.get(params).promise();
        const response = {
            statusCode: 200,
            body: JSON.stringify(data.Item),
        };
        return response;
    } catch (error) {
        console.log(error);
        throw new Error('Error occurred while accessing DynamoDB');
    }
};
