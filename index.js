import { process } from '/env'
import { Configuration, OpenAIApi } from 'openai'

const setupInputContainer = document.getElementById('setup-input-container')
const movieBossText = document.getElementById('anime-boss-text')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

document.getElementById("send-btn").addEventListener("click", () => {
  const setupTextarea = document.getElementById('setup-textarea')
  if (setupTextarea.value) {
    const userInput = setupTextarea.value
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`
    fetchBotReply(userInput)
    fetchSynopsis(userInput)
  }
})

async function fetchBotReply(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a short message to enthusiastically say an outline sounds interesting and that you need some minutes to think about it.
    ###
    outline: With its intense battles, lovable characters, and iconic transformations, this series is a must-watch for anyone who loves action and adventure. 
    message: I'll need to think about that. But your idea is amazing! I love the bit about intense battles and iconic transformations scenes!
    ###
    outline: The anime has just begun and it's already packed with heart-pumping action, stunning animation, and unforgettable characters. 
    message: I'll spend a few moments considering that. But I love your idea!! A hear-pumping action anime with unforgettable characters!
    ###
    outline: This show is sure to keep you on the edge of your seat as you follow the heroic adventures of Saitama, the ultimate hero who can defeat any opponent with just one punch. 
    message: Wow that is awesome! Saitama, huh? Give me a few moments to think!
    ###
    outline: ${outline}
    message: 
    `,
    max_tokens: 60 
  })
  movieBossText.innerText = response.data.choices[0].text.trim()
} 

async function fetchSynopsis(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate an engaging, professional and marketable anime synopsis based on an outline. The synopsis should include actors names in brackets after each character. Choose actors that would be ideal for this role. 
    ###
    outline: Embark on a thrilling journey of action, adventure, and demon-slaying as we witness the epic rise of a young swordsman who will stop at nothing to avenge his family and protect humanity in the captivating world of the Demon Slayer anime.
    synopsis: 
    In the world of Demon Slayer, humans coexist with demons who feast on the flesh of unsuspecting prey. One fateful day, a young boy named Tanjiro Kamado (voiced by Natsuki Hanae) returns home to find his family slaughtered by these monstrous beings, with only his younger sister, Nezuko (voiced by Akari Kitō), miraculously surviving the attack. Determined to avenge his family and restore his sister's humanity, Tanjiro sets out to become a Demon Slayer and join the ranks of elite warriors who hunt down and exterminate demons.
    ###
    outline: ${outline}
    synopsis: 
    `,
    max_tokens: 700
  })
  const synopsis = response.data.choices[0].text.trim()
  document.getElementById('output-text').innerText = synopsis
  fetchTitle(synopsis)
  fetchStars(synopsis)
}

async function fetchTitle(synopsis) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a catchy anime title for this synopsis: ${synopsis}`,
    max_tokens: 25,
    temperature: 0.7
  })
  const title = response.data.choices[0].text.trim()
  document.getElementById('output-title').innerText = title
  fetchImagePromt(title, synopsis)
}

async function fetchStars(synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Extract the names in brackets from the synopsis.
    ###
    synopsis: In the world of Demon Slayer, humans coexist with demons who feast on the flesh of unsuspecting prey. One fateful day, a young boy named Tanjiro Kamado (voiced by Natsuki Hanae) returns home to find his family slaughtered by these monstrous beings, with only his younger sister, Nezuko (voiced by Akari Kitō), miraculously surviving the attack. Determined to avenge his family and restore his sister's humanity, Tanjiro sets out to become a Demon Slayer and join the ranks of elite warriors who hunt down and exterminate demons.
    names: Natsuki Hanae, Akari Kitō
    ###
    synopsis: ${synopsis}
    names:   
    `,
    max_tokens: 30
  })
  document.getElementById('output-stars').innerText = response.data.choices[0].text.trim()
}

async function fetchImagePromt(title, synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Give a short description of an image which could be used to advertise an anime based on a title and synopsis. The description should be rich in visual detail but contain no names.
    ###
    title: My Hero Academia
    synopsis: In a world where almost everyone possesses a unique superhuman ability, young Izuku Midoriya (voiced by Daiki Yamashita) has always dreamed of becoming a hero despite being born without any powers.
    image description: In the background, a towering cityscape looms, with high-rise buildings and skyscrapers reaching up towards the sky. The students appear ready for action, each armed with their unique weapons or powers. The overall impression is one of high-energy and excitement, with the promise of thrilling battles and epic adventures to come.
    ###
    title: Dragon Ball Z
    synopsis: In a world of martial arts and superhuman abilities, a powerful warrior named Goku (voiced by Masako Nozawa) trains tirelessly to become the strongest fighter in the universe. With his spiky hair and fierce determination, Goku battles against fearsome enemies, pushing himself to the brink of his abilities in order to protect those he loves.
    image description: The series features a dynamic and action-packed scene set against a fiery backdrop. In the foreground, two figures are shown in mid-air, engaged in an intense battle. 
    ###
    title: ${title}
    synopsis: ${synopsis}
    image description: 
    `,
    temperature: 0.8,
    max_tokens: 100
  })
  fetchImageUrl(response.data.choices[0].text.trim())
}

async function fetchImageUrl(imagePrompt){
  const response = await openai.createImage({
    prompt: `${imagePrompt}. There should be no text in this image.`,
    n: 1,
    size: '256x256',
    response_format: 'b64_json' 
  })
  document.getElementById('output-img-container').innerHTML = `<img src="data:image/png;base64,${response.data.data[0].b64_json}">`
  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
  document.getElementById('view-pitch-btn').addEventListener('click', ()=>{
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'
    movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
  })
}