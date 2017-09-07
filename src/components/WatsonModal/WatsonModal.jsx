import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import GhostButton from '../GhostButton';
import Socket from 'socket.io-client'

// The modal relies on creating a socket connected to a backend to
// make requests to Watson Conversation on the client's behalf.
// By utilizing a socket, the frontend xcan merely pass a `reqWatson` message
// and await a `resWatson` message with Watson's response.
const socketAddr = __SOCKET_ID__ || 'http://127.0.0.1:3000'
const socket = Socket(socketAddr);

export default class WatsonModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      query: "",
      response: "",
      opener: ""
    };
  }

  // When the component is loaded, send a special message to Conversation
  // Services to get the introduction message configured on the server
  componentDidMount() {
    const introMessage = "D4SHB04RD-1NTR0DUCT10N-M3SS4G3";
    this.askWatson(introMessage);
  }

  // Handler for 'Ask Watson' button
  handleOpen = () => {
    this.setState({
      open: true,
      response: this.state.opener
    });
  };

  // Handler for 'Close' button
  handleClose = () => {
    this.setState({
      open: false,
      query: "",
      response: ""
    });
  };

  // Handler for 'Ask' button
  submitQuery = () => {
    const query = this.state.query;
    if (query) {
      this.askWatson(query);
    }
  }

  // Use socket connection to send query to backend and listen for res message
  askWatson = (query) => {
    socket.emit('reqWatson', query);
    socket.on('resWatson', (response) => {
      this.setState({
        response: response,
        query: "",
        opener: this.state.opener || response
      });
    })
  }

  // Listener for change in TextField
  handleQueryChange = (event) => {
    this.setState({
      query: event.target.value
    });
  }

  // Listener to see if 'Enter' is pressed in TextField
  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.submitQuery()
    }
  }

  render() {
    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Ask"
        primary={true}
        onClick={this.submitQuery}
      />,
    ];

    return (
      <div>
        <GhostButton
          label="Ask Watson"
          primary={false}
          id="viewInActionButton"
          onTouchTap={this.handleOpen}
        />
        <Dialog
          title="Ask Watson A Question"
          actions={actions}
          modal={true}
          open={this.state.open}
        >
        <TextField
          ref="queryText"
          onChange={this.handleQueryChange}
          onKeyPress={this.handleKeyPress}
          value={this.state.query}
          hintText="i.e. What is the shipment status of my fleet?"
          fullWidth={true}
        />
        <br />
        <p>
          {this.state.response}
        </p>
        </Dialog>
      </div>
    );
  }
}
