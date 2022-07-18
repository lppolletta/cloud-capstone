import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

import { generateUploadUrl } from '../../businessLogic/messages'
import { getUserId } from '../utils'

const logger = createLogger('Message')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(" Processing event for generating signed url", event)

  const messageId = event.pathParameters.messageId
  const userId = getUserId(event);
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

  const URL = await generateUploadUrl(userId, messageId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: URL
    })
  }

}
