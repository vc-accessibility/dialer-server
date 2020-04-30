const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

client.calls
      .create({
         url: 'http://demo.twilio.com/docs/voice.xml',
         //to: '+16179533605',
         to: '+16178401339',
         from: '+12565408395'
       })
      .then(call => console.log(call.sid));
