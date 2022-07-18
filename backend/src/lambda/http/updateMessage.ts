import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { updateMessage } from '../../businessLogic/messages'
import { UpdateMessageRequest } from '../../requests/UpdateMessageRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Message')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const messageId = event.pathParameters.messageId
  const updatedMessage: UpdateMessageRequest = JSON.parse(event.body)
  logger.info("processing event ", event)
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const userId = getUserId(event);

  await updateMessage(userId, messageId, updatedMessage)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}
