import { MessagesAccess } from '../dataLayer/messagesAcess'
//import { attachmentUtils } from '../fileStorage/attachmentUtils';
import { MessageItem } from '../models/MessageItem'
import { MessageUpdate } from '../models/MessageUpdate'
import { CreateMessageRequest } from '../requests/CreateMessageRequest'
import { UpdateMessageRequest } from '../requests/UpdateMessageRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic

const logger = createLogger('messages')

const messagesAccess = new MessagesAccess();

export async function createMessage(user: string, createMessageRequest: CreateMessageRequest): Promise<MessageItem> {
    const messageId = uuid.v4()
    return await messagesAccess.createMessage({
        userId: user,
        messageId: messageId,
        createdAt: new Date().toISOString(),
        name: createMessageRequest.name,
        dueDate: createMessageRequest.dueDate,
        done: false
    })
}

export async function getMessage(userId: string): Promise<MessageItem[]> {
    logger.info(`Retrieving all messages for user ${userId}`, { userId })

    return await messagesAccess.getMessage(userId)
}

export async function deleteMessage(userId: string, messageId: string) {
    return await messagesAccess.deleteMessage(userId, messageId);
}

export async function updateMessage(userId: string, messageId: string, messageUpdate: UpdateMessageRequest): Promise<MessageUpdate> {
    return await messagesAccess.updateMessage(userId, messageId, messageUpdate);
}

export async function generateUploadUrl(userId: string, messageId: string): Promise<String> {
    return messagesAccess.generateUploadUrl(userId, messageId)
}