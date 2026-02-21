import { docClient, PutCommand, createResponse } from '/opt/nodejs/utils.mjs'; // Import from Layer

const tableName = process.env.tableName || "Users";

export const createUser = async (event) => {
    const { body } = event;
    const { userId, email, fullName, status } = JSON.parse(body || "{}");

    console.log("values", userId, email, fullName, status);

    if (!userId || !email || !fullName || !status) {
        return createResponse(409, { error: "Missing required attributes for the item: userId, email, fullName, or status." });
    }

    const timestamp = new Date().toISOString();

    const command = new PutCommand({
        TableName: tableName,
        Item: {
            userId,
            email,
            fullName,
            status,
            createdAt: timestamp,
            updatedAt: timestamp
        },
        ConditionExpression: "attribute_not_exists(userId)",
    });

    try {
        const response = await docClient.send(command);
        return createResponse(201, { message: "User Created Successfully!", response });
    }
    catch (err) {
        if (err.message === "The conditional request failed")
            return createResponse(409, { error: "User already exists!" });
        else
            return createResponse(500, {
                error: "Internal Server Error!",
                message: err.message,
            });
    }

}