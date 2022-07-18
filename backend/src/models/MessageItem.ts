export interface MessageItem {
  userId: string
  messageId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
