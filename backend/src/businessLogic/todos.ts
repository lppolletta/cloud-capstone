import { TodosAccess } from '../dataLayer/todosAcess'
//import { attachmentUtils } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic
const bucketName = process.env.ATTACHMENT_S3_BUCKET;

const logger = createLogger('todos')

const todosAccess = new TodosAccess();

export async function createTodo(user: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4()
    return await todosAccess.createTodo({
        userId: user,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    })
}

export async function getTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Retrieving all todos for user ${userId}`, { userId })
  
    return await todosAccess.getTodos(userId)
  }

export async function deleteTodo(userId: string, todoId: string) {
    return await todosAccess.deleteTodo(userId, todoId);
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string) {
    logger.info(`[Service] Start create attachment signed URL for userId: ${userId} & todoId ${todoId}`)
    return await todosAccess.createAttachmentPresignedUrl(userId, todoId)
}

export async function updateTodo(userId: string, todoId: string, todoUpdate: UpdateTodoRequest): Promise<TodoUpdate> {
    return await todosAccess.updateTodo(userId, todoId, todoUpdate);
}