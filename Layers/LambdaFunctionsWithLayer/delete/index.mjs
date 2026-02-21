import { docClient, DeleteCommand, createResponse } from '/opt/nodejs/utils.mjs'; // Import from Layer

const tableName = process.env.tableName || "Users";

export const deleteUser = async (event) => {
    const { pathParameters } = event;
    const userId = pathParameters?.id;
    if (!userId)
        return createResponse(400, { error: "Missing userId" });

    try {
        const command = new DeleteCommand({
            TableName: tableName,
            Key: {
                userId,
            },
            ReturnValues: "ALL_OLD", // returns deleted value as response
            ConditionExpression: "attribute_exists(userId)", // ensures the item exists before deleting
        });

        const response = await docClient.send(command);
        return createResponse(200, { message: "User Deleted Successfully!", response });
    }
    catch (err) {
        if (err.message === "The conditional request failed")
            return createResponse(404, { error: "User does not exist!" });
        return createResponse(500, {
            error: "Internal Server Error!",
            message: err.message,
        });
    }
}