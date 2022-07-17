import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)


const s3 = new XAWS.S3({signatureVersion: 'v4'})
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET
    ) {
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Getting all todos for user ${userId} from ${this.todosTable}`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info(`Putting todo ${todoItem.todoId} into ${this.todosTable}`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise();

        return todoItem;
    }

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set #n = :r, dueDate=:p, done=:a",
            ExpressionAttributeValues: {
                ":r": todoUpdate.name,
                ":p": todoUpdate.dueDate,
                ":a": todoUpdate.done
            },
            ExpressionAttributeNames: {
                "#n": "name"
            },
            ReturnValues: "UPDATED_NEW"
        };

        await this.docClient.update(params).promise()
        logger.info("Update was successful")
        return todoUpdate

    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        logger.info(`Deleting todo item ${todoId} from ${this.todosTable}`)
        
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()
    }

    /** Create attachment signed Url */
    async generateUploadUrl(userId: string, todoId: string): Promise<String> {
        const url = getUploadUrl(todoId, this.bucketName)

        const attachmentUrl: string = 'https://' + this.bucketName + '.s3.amazonaws.com/' + todoId

        const options = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
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

function getUploadUrl(todoId: string, bucketName: string): string {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: parseInt(urlExpiration)
    })
}
