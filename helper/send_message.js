const twilio = require('twilio');

exports.sendSMS = (accountSid, authToken, body, to) => {
  const client = new twilio(accountSid, authToken);
  return client.messages
  .create({
    body: body,
    to: to, 
    from: '+18043363492',
  })
  .then((message) => console.log(message.sid));
}