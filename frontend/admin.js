const messageList = document.querySelector('#message-list');
const messageCount = document.querySelector('#message-count');
const adminStatus = document.querySelector('#admin-status');

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function createMessageCard(message) {
  const card = document.createElement('article');
  card.className = 'message-card';

  const person = document.createElement('div');
  person.className = 'message-person';
  const name = document.createElement('h2');
  name.textContent = message.name;
  const email = document.createElement('a');
  email.href = `mailto:${message.email}`;
  email.textContent = message.email;
  person.append(name, email);
  if (message.phone) {
    const phone = document.createElement('a');
    phone.href = `tel:${message.phone.replace(/[^\d+]/g, '')}`;
    phone.textContent = message.phone;
    person.append(document.createElement('br'), phone);
  }
  const date = document.createElement('time');
  date.className = 'message-date';
  date.dateTime = message.createdAt;
  date.textContent = formatDate(message.createdAt);
  person.append(date);

  const content = document.createElement('div');
  content.className = 'message-content';
  const subject = document.createElement('span');
  subject.textContent = message.subject || 'GENERAL ENQUIRY';
  const body = document.createElement('p');
  body.textContent = message.message;
  content.append(subject, body);

  const remove = document.createElement('button');
  remove.className = 'message-delete';
  remove.type = 'button';
  remove.textContent = 'Delete';
  remove.setAttribute('aria-label', `Delete message from ${message.name}`);
  remove.addEventListener('click', () => deleteMessage(message.id, remove));
  card.append(person, content, remove);
  return card;
}

async function loadMessages() {
  adminStatus.textContent = 'Loading enquiries...';
  try {
    const response = await fetch('/api/messages', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(response.status === 401 ? 'Please sign in to view enquiries.' : 'Unable to load enquiries.');
    const messages = await response.json();
    messageCount.textContent = String(messages.length);
    messageList.replaceChildren();
    if (messages.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'admin-empty';
      empty.textContent = 'No enquiries yet. New contact form messages will appear here.';
      messageList.append(empty);
    } else {
      messageList.append(...messages.map(createMessageCard));
    }
    adminStatus.textContent = 'Up to date';
  } catch (error) {
    adminStatus.textContent = error.message;
  }
}

async function deleteMessage(id, button) {
  if (!window.confirm('Delete this enquiry?')) return;
  button.disabled = true;
  try {
    const response = await fetch(`/api/messages/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Unable to delete this enquiry.');
    await loadMessages();
  } catch (error) {
    adminStatus.textContent = error.message;
    button.disabled = false;
  }
}

document.querySelector('#refresh-button').addEventListener('click', loadMessages);
loadMessages();
