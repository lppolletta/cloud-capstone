import { apiEndpoint } from '../config'
import { Message } from '../types/Message';
import { CreateMessageRequest } from '../types/CreateMessageRequest';
import Axios from 'axios'
import { UpdateMessageRequest } from '../types/UpdateMessageRequest';

export async function getMessage(idToken: string): Promise<Message[]> {
  console.log('Fetching messages')

  const response = await Axios.get(`${apiEndpoint}/messages`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Messages:', response.data)
  return response.data.items
}

export async function createMessage(
  idToken: string,
  newMessage: CreateMessageRequest
): Promise<Message> {
  const response = await Axios.post(`${apiEndpoint}/messages`, JSON.stringify(newMessage), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchMessage(
  idToken: string,
  messageId: string,
  updatedMessage: UpdateMessageRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/messages/${messageId}`, JSON.stringify(updatedMessage), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteMessage(
  idToken: string,
  messageId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/messages/${messageId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  messageId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/messages/${messageId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
