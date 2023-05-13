import { Configuration, OpenAIApi } from "openai";
import {process} from './env';

const outputImg = document.getElementById('output-img')
const apiKey = process.env.API_KEY;
const configuration = new Configuration({
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

document.getElementById("btn").addEventListener("click", () => {
  const prompt = document.getElementById("instruction").value;
  generateImage(prompt);
})

async function generateImage(prompt) {
  const response = await openai.createImage({
    prompt: `${prompt}, There should be no text in this image.`,
    n: 1,
    size: '256x256',
    response_format: 'b64_json'
  })
  outputImg.innerHTML = `<img src="data:image/png;base64,${response.data.data[0].b64_json}">`
}