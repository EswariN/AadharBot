var restify = require('restify');
var builder = require('botbuilder');
var https = require('https');
var rp = require('request-promise');
var showdown = require('showdown');
var showdownHtmlEscape = require('showdown-htmlescape');

var MICROSOFT_APP_ID = '2b72e45a-84b0-4f50-8615-e80cdcb7068c';
var MICROSOFT_APP_PASSWORD = 'oqwrIM3244!@pckKXBJM8?]';

var header = {'Content-Type':'application/json', 'Ocp-Apim-Subscription-Key':'307c7bd9dd1d4310baa217e2b2541592'}
var requestUrl = 'https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/3bcac8d4-066a-418d-9669-bc3a11427d26/generateAnswer';
var task;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978,
function () {
    console.log('%s listening to %s', server.name, server.url);
});
// chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
// Listen for messages from users
server.post('/api/messages', connector.listen());

// Bot introduces itself and says hello upon conversation start
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded[0].id === message.address.bot.id) {
        var reply = new builder.Message()
                .address(message.address)
                .text("Hi,  I'm AadharBot! You can ask  Aadhar related questions to me.");
        bot.send(reply);
    }
});


bot.dialog('/', function(session) {
        sendToQnAMaker(session.message.text).then(function (parsedBody) {
            var answerObj = parsedBody.answers[0];
            var answer = answerObj.answer;
            console.log(answerObj.answer);
            session.send(answer);
        })
        .catch(function (err) {
            console.log("POST FAILED: " + err);
        });
  });

  function sendToQnAMaker(message) {
    var options = {
        method: 'POST',
        uri: requestUrl,
        body: {
            "question": message
        },
        json: true, // Automatically stringifies the body to JSON,
        headers: header
    };
    console.log("test");
    return rp(options);
}
