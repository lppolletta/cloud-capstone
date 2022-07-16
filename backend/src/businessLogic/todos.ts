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
        done: false
    })
}

export async function getTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Retrieving all todos for user ${userId}`, { userId })
  
    return await todosAccess.getTodos(userId)
  }

export async function deleteTodo(userId: string, todoId: string) {
    return await todosAccess.deleteTodo(userId, todoId);
}

export async function updateTodo(userId: string, todoId: string, todoUpdate: UpdateTodoRequest): Promise<TodoUpdate> {
    return await todosAccess.updateTodo(userId, todoId, todoUpdate);
}

export async function generateUploadUrl(userId: string, todoId: string):  Promise < String >{
    return todosAccess.generateUploadUrl(userId, todoId)
}