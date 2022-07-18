import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { CreateMessageRequest } from '../../requests/CreateMessageRequest'
import { getUserId } from '../utils';
import { createMessage } from '../../businessLogic/messages'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Message')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  logger.info('auth user id ', userId)
  logger.info('Processing event: ', event);
  const newMessage: CreateMessageRequest = JSON.parse(event.body);

  // TODO: Implement creating a new TODO item

  const messageItem = await createMessage(userId, newMessage)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ item: messageItem })
  }
}
