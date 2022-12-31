import bot from './assets/bot.svg';
import user from "./assets/user.svg"

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

function loader(e) {
  e.textContent = '';

  loadInterval = setInterval(() => {
    e.textContent += '.'

    if (e.textContent >= '....') {
      e.textContent = '';
    }
  }, 300);
}

function typeText(e, text) {
  let index = 0

  let interval = setInterval(() => {
    if (index < text.length) {
      e.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 30);
}

function generateId() {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalStr = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalStr}`
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}">
        </div>
        <div class="message ${isAi && 'ai-wrap'}" id=${uniqueId}>
        ${value}
        </div>
      </div>
    </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault()
  window.scrollTo(0, document.body.scrollHeight)
  const data = new FormData(form)

  // user's chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  form.reset()

  // bot's chatstripe
  const uniqueId = generateId()
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId)


  chatContainer.scrollTop = chatContainer.scrollHeight

  const messageDiv = document.getElementById(uniqueId)

  loader(messageDiv)

  // fetch data from server

  const response = await fetch('https://ai-bot-4hsv.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = ''
  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim()

    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text()

    messageDiv.innerHTML = "Something went wrong"

    alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})