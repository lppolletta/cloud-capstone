import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteMessage } from '../../businessLogic/messages'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Message')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.warn("Proccessing delete event on message", event)
  const messageId = event.pathParameters.messageId
  const userId = getUserId(event);

  // TODO: Remove a TODO item by id
  await deleteMessage(userId, messageId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: " "
  }
}
