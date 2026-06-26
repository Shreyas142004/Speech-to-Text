import youtubedl from 'youtube-dl-exec';
import path from 'path';

async function test() {
  try {
    console.log("Downloading audio...");
    const outputPath = path.join(__dirname, 'test-audio.mp3');
    await youtubedl('https://youtube.com/shorts/ET9jxQUMesk?si=s4ozcSl98jZd0KL5', {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath
    });
    console.log("Success! File saved to:", outputPath);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
