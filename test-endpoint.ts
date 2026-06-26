import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function test() {
  try {
    const form = new FormData();
    form.append('youtubeUrl', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    form.append('language', 'auto');
    form.append('multiSpeaker', 'false');

    console.log("Sending request to backend...");
    const res = await axios.post('http://localhost:4000/speech-to-text', form, {
      headers: form.getHeaders(),
    });
    console.log("Response:", res.data);
  } catch (err: any) {
    console.error("Error:", err.response?.status, err.response?.data || err.message);
  }
}
test();
