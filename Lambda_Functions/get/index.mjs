import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.tableName || "Users";

const createResponse = (statusCode, body) => {
    const responseBody = JSON.stringify(body);
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: responseBody,
    };
};

export const getUser = async (event) => {
    const { pathParameters } = event;
    const { id } = pathParameters || {};

    try {
        let command;
        if (id) {
            command = new GetCommand({
                TableName: tableName,
                Key: {
                    "userId": id,
                },
            });
        }
        else {
            command = new ScanCommand({
                TableName: tableName,
            });
        }
        const response = await docClient.send(command);
        return createResponse(200, response);
    }
    catch (err) {
        console.error("Error fetching data from DynamoDB:", err);
        return createResponse(500, { error: err.message });
    }

}