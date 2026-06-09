from html.parser import HTMLParser
import pathlib
path = pathlib.Path(r'c:\Users\punit\Downloads\AssetTemp\AssetManagementFrontend\projects\asset-management\src\app\modules\view-asset-tag\view-asset-tag.component.html')
text = path.read_text(encoding='utf-8')
self_closing = {'br','img','input','meta','link','hr','area','base','col','embed','param','source','track','wbr','path','rect','circle','line','polyline','polygon','ellipse'}
class MyParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack=[]
        self.errors=[]
    def handle_starttag(self, tag, attrs):
        if tag in self_closing: return
        self.stack.append((tag, self.getpos()))
    def handle_startendtag(self, tag, attrs):
        pass
    def handle_endtag(self, tag):
        if not self.stack:
            self.errors.append(('extra close', tag, self.getpos()))
            return
        last, pos = self.stack[-1]
        if last == tag:
            self.stack.pop()
            return
        self.errors.append(('mismatch', last, tag, pos, self.getpos()))
        while self.stack and self.stack[-1][0] != tag:
            self.stack.pop()
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
parser = MyParser()
parser.feed(text)
print('errors:', parser.errors)
print('remaining stack count:', len(parser.stack))
for item in parser.stack[-20:]:
    print(item)
