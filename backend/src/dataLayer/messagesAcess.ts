import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { MessageItem } from '../models/MessageItem'
import { MessageUpdate } from '../models/MessageUpdate'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)


const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('MessagesAccess')

// TODO: Implement the dataLayer logic

export class MessagesAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly messagesTable = process.env.MESSAGES_TABLE,
        private readonly messagesIndex = process.env.MESSAGES_CREATED_AT_INDEX,
        private readonly bucketName = process.env.MESSAGES_S3_BUCKET
    ) {
    }

    async getMessage(userId: string): Promise<MessageItem[]> {
        logger.info(`Getting all messages for user ${userId} from ${this.messagesTable}`)

        const result = await this.docClient.query({
            TableName: this.messagesTable,
            IndexName: this.messagesIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return result.Items as MessageItem[]
    }

    async createMessage(messageItem: MessageItem): Promise<MessageItem> {
        logger.info(`Putting message ${messageItem.messageId} into ${this.messagesTable}`)

        await this.docClient.put({
            TableName: this.messagesTable,
            Item: messageItem
        }).promise();

        return messageItem;
    }

    async updateMessage(userId: string, messageId: string, MessageUpdate: MessageUpdate): Promise<MessageUpdate> {
        var params = {
            TableName: this.messagesTable,
            Key: {
                userId: userId,
                messageId: messageId
            },
            UpdateExpression: "set #n = :r, dueDate=:p, done=:a",
            ExpressionAttributeValues: {
                ":r": MessageUpdate.name,
                ":p": MessageUpdate.dueDate,
                ":a": MessageUpdate.done
            },
            ExpressionAttributeNames: {
                "#n": "name"
            },
            ReturnValues: "UPDATED_NEW"
        };

        await this.docClient.update(params).promise()
        logger.info("Update was successful")
        return MessageUpdate

    }

    async deleteMessage(userId: string, messageId: string): Promise<void> {
        logger.info(`Deleting message item ${messageId} from ${this.messagesTable}`)

        await this.docClient.delete({
            TableName: this.messagesTable,
            Key: {
                userId: userId,
                messageId: messageId
            }
        }).promise()
    }

    /** Create attachment signed Url */
    async generateUploadUrl(userId: string, messageId: string): Promise<String> {
        const url = getUploadUrl(messageId, this.bucketName)

        const attachmentUrl: string = 'https://' + this.bucketName + '.s3.amazonaws.com/' + messageId

        const options = {
            TableName: this.messagesTable,
            Key: {
                userId: userId,
                messageId: messageId
            },
            UpdateExpression: "set attachmentUrl = :r",
            ExpressionAttributeValues: {
                ":r": attachmentUrl
            },
            ReturnValues: "UPDATED_NEW"
        };

        await this.docClient.update(options).promise()
        logger.info("Presigned url generated successfully ", url)

        return url;
    }

}

function getUploadUrl(messageId: string, bucketName: string): string {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: messageId,
        Expires: parseInt(urlExpiration)
    })
}
