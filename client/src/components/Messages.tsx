import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createMessage, deleteMessage, getMessage, patchMessage } from '../api/messages-api'
import Auth from '../auth/Auth'
import { Message } from '../types/Message'

interface MessagesProps {
  auth: Auth
  history: History
}

interface MessagesState {
  messages: Message[]
  newMessageName: string
  loadingMessages: boolean
}

export class Messages extends React.PureComponent<MessagesProps, MessagesState> {
  state: MessagesState = {
    messages: [],
    newMessageName: '',
    loadingMessages: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newMessageName: event.target.value })
  }

  onEditButtonClick = (messageId: string) => {
    this.props.history.push(`/messages/${messageId}/edit`)
  }

  onMessageCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newMessage = await createMessage(this.props.auth.getIdToken(), {
        name: this.state.newMessageName,
        dueDate
      })
      this.setState({
        messages: [...this.state.messages, newMessage],
        newMessageName: ''
      })
    } catch {
      alert('Message creation failed')
    }
  }

  onMessageDelete = async (messageId: string) => {
    try {
      await deleteMessage(this.props.auth.getIdToken(), messageId)
      this.setState({
        messages: this.state.messages.filter(message => message.messageId !== messageId)
      })
    } catch {
      alert('Message deletion failed')
    }
  }

  onMessageCheck = async (pos: number) => {
    try {
      const message = this.state.messages[pos]
      await patchMessage(this.props.auth.getIdToken(), message.messageId, {
        name: message.name,
        dueDate: message.dueDate,
        done: !message.done
      })
      this.setState({
        messages: update(this.state.messages, {
          [pos]: { done: { $set: !message.done } }
        })
      })
    } catch {
      alert('Message deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const messages = await getMessage(this.props.auth.getIdToken())
      this.setState({
        messages,
        loadingMessages: false
      })
    } catch (e: any) {
      alert(`Failed to fetch messages: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Check-Ins</Header>

        {this.renderCreateMessageInput()}

        {this.renderMessages()}
      </div>
    )
  }

  renderCreateMessageInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'green',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Check-In',
              onClick: this.onMessageCreate
            }}
            fluid
            actionPosition="left"
            placeholder="I'm good..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderMessages() {
    if (this.state.loadingMessages) {
      return this.renderLoading()
    }

    return this.renderMessagesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading MESSAGES
        </Loader>
      </Grid.Row>
    )
  }

  renderMessagesList() {
    return (
      <Grid padded>
        {this.state.messages.map((message, pos) => {
          return (
            <Grid.Row key={message.messageId}>
              <Grid.Column width={5} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onMessageCheck(pos)}
                  checked={message.done}
                />
                <label htmlFor="checkbox"> &nbsp; <b> Select 'pencil' to upload image file to Check-In </b> </label>
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {message.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {message.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(message.messageId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onMessageDelete(message.messageId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {message.attachmentUrl && (
                <Image src={message.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
