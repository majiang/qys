from xml.etree.ElementTree import parse

def get_matching(doc, path):
    if path == []:
        yield doc
        return
    for child in doc:
        if child.tag.endswith('}'+path[0]):
            for ret in get_matching(child, path[1:]):
                yield ret

def get_dict():
    ret = {}
    for (suit, chars) in zip('bcd', ['asdfghjkl', 'qwertyuio', 'zxcvbnm,.']):
        for (i, char) in enumerate(chars):
            ret[char] = (suit, i)
    return ret

def main():
    d = get_dict()
    doc = parse('GL-MahjongTile.svg').getroot()
    for item in get_matching(doc, ['defs', 'font', 'glyph']):
        a = item.attrib
        if 'unicode' not in a:
            continue
        c = a['unicode']
        if c not in d:
            continue
        s, r = d[c]
        with open(f'gl-mahjongtile-svg/{s}-{r}.svg', 'w') as f:
            f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="30 -115 580 830"><g><path d="{a["d"]}" /></g></svg>')

if __name__ == "__main__":
    main()
