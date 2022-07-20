# Purpose and Scope

## Serverless Message App

Using the websocket API a AWS account is notified when a user has uploaded an image to a message item.

The use of this functionality is to eventually be used as a check-in application for a caretakers to track kids, elderly, or any other individual that may need a periodic check-in.

# Functionality of the application

A user of web application can use interface to create, delete, and complete a message.

A user needs to authenticate in order to use the application.

A user can click on "pencil" button, then select and upload a file. The AWS account running the application is notifified using the websocket API that a file has been uploaded by the user.

A user only sees the items they created.

# Deploy application

./client

    npm run start

./backend

    sls deploy

WEBSOCKET:

wscat -c wss://6c3ehmqan5.execute-api.us-east-1.amazonaws.com/dev


# Test Application

See folder /testing for user based testing.


