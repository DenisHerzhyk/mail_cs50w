document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  document.querySelector('#compose-form').addEventListener('submit', send_email)
  // By default, load the inbox
  load_mailbox('inbox');
});

const compose_email = () => {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-details-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

const view_email = (email_id) => {
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#email-details-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    const email_div = document.querySelector('#email-details-view')
    email_div.innerHTML = `
      <h6><strong>From:</strong> ${email.sender}</h6>
      <h6><strong>To:</strong> ${email.recipients}</h6>
      <h6><strong>Subject:</strong> ${email.subject}</h6>
      <h6><strong>Timestamp:</strong> <span style="color: gray;">${email.timestamp}</span></h6>
      <br>
      <hr>
      <p>${email.body}</p>
      <br>
      `
    
    if (!email.read) {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
    }

    const achive_button = document.createElement('button')
    achive_button.className = email.archived ? 'btn btn-success' : 'btn btn-danger'
    achive_button.innerHTML = email.archived ? 'Unarchive' : 'Archive'
    achive_button.addEventListener('click', () => {
      console.log("Something is happening")
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: !email.archived
        })
      })
      .then(() => load_mailbox('archive'))
    })
    document.querySelector('#email-details-view').append(achive_button)

    const reply_button = document.createElement('button')
    reply_button.className = 'btn btn-primary'
    reply_button.innerHTML = 'Reply'
    reply_button.addEventListener('click', () => {
      compose_email()
      document.querySelector('#compose-recipients').value = email.sender
      if (email.subject.split(" ", 1)[0] != "Re:") {
        email.subject = `Re: ${email.subject}`
      }
      document.querySelector('#compose-subject').value = email.subject
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`
    })
    document.querySelector('#email-details-view').append(reply_button)
  })
}
const load_mailbox = (mailbox) => {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const div = document.createElement('div');
      div.className = 'inbox-email'
      div.innerHTML = 
      `
        <div style="display: flex; gap: 20px;">
          <p style="font-weight: bold;">${email.sender}</p>
          <p style="margin-left: auto;">${email.subject}</p>
        </div>
        <p style="color: gray; font-weight: semibold;">${email.timestamp}</p>
      `

      div.className = email.read ? 'inbox-email read' : 'inbox-email unread'
      div.addEventListener('click', () => {
        view_email(email.id)
      })
      document.querySelector('#emails-view').append(div)
    })
  })
}

const send_email = (e) => {
  e.preventDefault();

  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
    load_mailbox('sent')
  })
}