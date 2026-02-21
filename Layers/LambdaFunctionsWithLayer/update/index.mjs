import { docClient, UpdateCommand, createResponse } from '/opt/nodejs/utils.mjs'; // Import from Layer

const tableName = process.env.tableName || "Users";

export const updateUser = async (event) => {
    const { pathParameters, body } = event;

    const userId = pathParameters?.id;
    if (!userId)
        return createResponse(400, { error: "Missing userId" });

    const { email, fullName, status } = JSON.parse(body || "{}");
    if (!email && !fullName && !status)
        return createResponse(400, { error: "Nothing to update!" })

    const timestamp = new Date().toISOString();

    let updateExpression = `SET updatedAt = :updatedAt, ${email ? "email = :email, " : ""}${fullName ? "fullName = :fullName, " : ""}${status ? "#status = :status, " : ""}`.slice(0, -2);

    try {

        const command = new UpdateCommand({
            TableName: tableName,
            Key: {
                userId,
            },
            UpdateExpression: updateExpression,
            ...(status && {
                ExpressionAttributeNames: {
                    "#status": "status", // status is a reserved keyword in DynamoDB
                },
            }),
            ExpressionAttributeValues: {
                ":updatedAt": timestamp,
                ...(email && { ":email": email }),
                ...(fullName && { ":fullName": fullName }),
                ...(status && { ":status": status }),
            },
            ReturnValues: "ALL_NEW", // returns updated value as response
            ConditionExpression: "attribute_exists(userId)", // ensures the item exists before updating
        });

        const response = await docClient.send(command);
        console.log(response);
        return response;

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