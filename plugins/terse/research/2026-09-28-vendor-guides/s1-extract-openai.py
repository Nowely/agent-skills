"""Extract readable text from HTML: drop script/style/SVG, retain block breaks, strip tags, decode entities, collapse inline whitespace."""
import html,re,sys
s=open(sys.argv[1],encoding='utf-8',errors='replace').read()
s=re.sub(r'<(script|style|svg|noscript)\b[^>]*>.*?</\1>',' ',s,flags=re.I|re.S)
s=re.sub(r'<(br|/p|/li|/h[1-6]|/div|/tr|/section|/article)\b[^>]*>','\n',s,flags=re.I)
s=html.unescape(re.sub('<[^>]+>',' ',s));s=re.sub(r'[ \t\r\f\v]+',' ',s);s=re.sub(r' *\n *','\n',s)
print(s)
