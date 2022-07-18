/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateMessageRequest {
  name: string
  dueDate: string
  done: boolean
}