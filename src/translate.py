import sys
import codecs

# Force stdout and stderr to utf-8 to avoid Windows console errors
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("deep-translator is not installed. Run: pip install deep-translator", file=sys.stderr)
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python translate.py <target_language>", file=sys.stderr)
        sys.exit(1)

    target_lang = sys.argv[1]
    
    # Read the text to translate from standard input
    # This avoids command-line length limits and weird escaping issues
    # Ensure we decode stdin as utf-8
    sys.stdin = codecs.getreader('utf-8')(sys.stdin.detach())
    text = sys.stdin.read().strip()

    if not text:
        sys.exit(0)

    try:
        translated = GoogleTranslator(source='auto', target=target_lang).translate(text)
        print(translated)
    except Exception as e:
        print(f"Translation Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
