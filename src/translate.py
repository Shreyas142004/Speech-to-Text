import sys
import codecs
import os
import json
import urllib.request
import urllib.error

# Force stdout and stderr to utf-8 to avoid Windows console errors
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# ==============================================================================
# HOW THIS SCRIPT WORKS:
# This Python script acts as a bridge between our Node.js backend and the Groq API.
# It receives English text and translates it into the target language using Llama 3.
# ==============================================================================

def main():
    # STEP 1: Check if the backend provided a target language
    if len(sys.argv) < 2:
        print("Usage: python translate.py <target_language>", file=sys.stderr)
        sys.exit(1)

    target_lang = sys.argv[1]
    
    # Check for Groq API Key
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("Translation Error: GROQ_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)
    
    # STEP 2: Read the text to translate from standard input
    sys.stdin = codecs.getreader('utf-8')(sys.stdin.detach())
    text = sys.stdin.read().strip()

    if not text:
        sys.exit(0)

    try:
        # STEP 3: Connect to Groq API using built-in urllib
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        system_prompt = f"You are a professional, highly accurate translator. Translate the user's text into the language code/name '{target_lang}'. Do not provide explanations, notes, or conversational filler. Return ONLY the translated text and nothing else."
        
        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            "temperature": 0.1
        }
        
        json_data = json.dumps(data).encode('utf-8')
        
        req = urllib.request.Request(url, data=json_data, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", f"Bearer {api_key}")
        req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        with urllib.request.urlopen(req) as response:
            response_body = response.read().decode('utf-8')
            response_json = json.loads(response_body)
            
            translated_text = response_json['choices'][0]['message']['content'].strip()
            
            # STEP 4: Print the translated text
            print(translated_text)
            
    except urllib.error.URLError as e:
        error_msg = e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
        print(f"Translation API Error: {error_msg}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Translation Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
