| **master** | [![Build Status](https://travis-ci.org/IBM/acme-freight-webui.svg?branch=master)](https://travis-ci.org/IBM/acme-freight-webui) [![Coverage Status](https://coveralls.io/repos/github/IBM/acme-freight-webui/badge.svg?branch=master)](https://coveralls.io/github/IBM/acme-freight-webui?branch=master) |
| ----- | ----- |
| **dev** | [![Build Status](https://travis-ci.org/IBM/acme-freight-webui.svg?branch=dev)](https://travis-ci.org/IBM/acme-freight-webui) [![Coverage Status](https://coveralls.io/repos/github/IBM/acme-freight-webui/badge.svg?branch=dev)](https://coveralls.io/github/IBM/acme-freight-webui?branch=dev)|

# Acme Freight Web UI

Learn more about the Acme Freight Web UI framework from the parent [Logistics Wizard repo](https://github.com/IBM-Bluemix/logistics-wizard-webui).

# Leeloo Version Changes: Watson Conversation

[This version of Acme Freight](http://leeloo-acme-freight-webui.mybluemix.net/) has been modified to integrate Watson Conversation Services into the project. Click on the `Ask Watson` button and ask it questions regarding Acme Freight, such as:

```
Are there any weather problems affecting deliveries?
How many active shipments are there / How many shipments are currently running?
How many shipments are finished / How many order are completed?
Are there any delayed shipments? [You can then reply yes to Watson's answer]
```

A new React component [`WatsonModal`](https://github.com/leeloo-acme-freight/acme-freight-webui/blob/master/src/components/WatsonModal/WatsonModal.jsx) was created to handle this functionality. It provides the UI for submitting queries and receiving responses. It creates a [Socket.io](https://socket.io/) socket to communicate with the new [acme-freight-conversation](https://github.com/leeloo-acme-freight/acme-freight-conversation) backend service that makes requests to the Watson Conversation service on the frontend's behalf. So effectively the frontend only need to send a "question" message through the socket and listen for an "answer" message to achieve this new functionality.

### Developer Notes

The socket needs to only know the domain of the backend with the respective partner socket. This is acheived by setting the `WAT_CONV_SOCKET_ADDR` property in environment variables. Locally this is handled by creating a `.env` file. When deployed onto Bluemix, this environment must be set in the `BUILD` stage of the DevOps toolchain. Since the webui is built into a static package to be served via [nginx](https://www.nginx.com/resources/wiki/), the environment variables are bound during the `BUILD` stage and served as build artifacts down the pipeline.

When running locally, a basic implementation of the backend socket can be found in [`main.js`](https://github.com/leeloo-acme-freight/acme-freight-webui/blob/master/server/main.js#L113). The sockets will then connect to each other via `localhost` This code only runs locally though; when deployed to Bluemix, the webui must be configured to connect to a running backend deployed somewhere else.

# Quick Links
- [Go to the Acme Freight journey website](http://developer.ibm.com/code/journey/unlock-enterprise-data-using-apis?cm_mmc=github-code-_-native-_-acme-_-journey&cm_mmca1=000019RT&cm_mmca2=10004796)
- [View the main Acme Freight repository](https://github.com/ibm/acme-freight)
- [Read the blog post about implementing LoopBack for Acme Freight's ERP system](https://developer.ibm.com/code/2017/05/04/unlock-enterprise-data-with-loopback?cm_mmc=github-code-_-native-_-acme-_-related-content&cm_mmca1=000019RT&cm_mmca2=10004796)
