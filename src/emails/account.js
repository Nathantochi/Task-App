const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const welcomeMsg = (name, email) => {
  sgMail.send= ({
    to: email,
    from: 'hycenthjoe1@gmail.com', 
    subject: 'Sending Email with SendGrid',
    text: `Hello ${name}, welcome to this new page`
  })

}

const CancellationMsg = (name, email) => {
  sgMail.send= ({
    to: email,
    from: 'hycenthjoe1@gmail.com', 
    subject: 'Sending Email with SendGrid',
    text: `Hello ${name}, You have successfully terminated your profile`
  })

}

module.exports = {
    welcomeMsg,
    CancellationMsg
}
