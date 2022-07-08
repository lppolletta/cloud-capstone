import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';


const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
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

        logger.info(`Updating todo item ${todoId} in ${this.todosTable}`)

        const updatedItem = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
            ConditionExpression: 'todoId = :todoId',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            },
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            }
        }).promise()

        return updatedItem.Attributes as TodoUpdate
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

    getSignedURL(todoId: string) {
        const uploadUrl = {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: Number(this.urlExpiration)
        }
        return this.s3.getSignedUrl('putObject', uploadUrl)
    }

    /** Create attachment signed Url */
    async createAttachmentPresignedUrl(userId: string, todoId: string): Promise<any> {
        logger.info(`[Repo] Get Signed URL from S3 bucket by ${userId} & ${todoId}`)
        const signedUrl = this.getSignedURL(todoId)
        logger.info(`[Repo] SighedURL from s3 bucket ${signedUrl}`)
        logger.info('[Repo] Create signed Url for userId ', userId, ' todoId ', todoId)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set attachmentUrl=:url",
            ExpressionAttributeValues: {
                ":url": signedUrl.split("?")[0]
            }
        }).promise()
        logger.info('[Repo] Completed')
        return signedUrl
    }
}