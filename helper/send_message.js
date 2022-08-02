const Vonage = require('@vonage/server-sdk');
const vonage = new Vonage({
  apiKey: "8cd4842f",
  apiSecret: "8AZi730Cq2BZfIBZ"
});

const from = "Thang Nguyen"
const to = "84363757636"

exports.sendSMS = vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
        console.log(err);
    } else {
        if(responseData.messages[0]['status'] === "0") {
            console.log("Message sent successfully.");
        } else {
            console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
        }
    }
})
