// Minimal Markdown → Sanity Portable Text converter.
// Supports: ## / ### headings, blockquotes (>), bullet (-,*) and numbered (1.) lists,
// paragraphs, and inline **bold**, *italic*, `code`, and [links](url).
// Blocks are separated by blank lines. This is intentionally small — it covers the
// subset of Markdown our blog drafts use, and produces valid Portable Text.

function key() {
  return Math.random().toString(36).slice(2, 12);
}

// Parse inline marks (**bold**, *italic*, `code`, [text](href)) into spans + markDefs.
function parseInline(text) {
  const markDefs = [];
  const children = [];
  // Token regex: links, bold, italic, code — evaluated left to right.
  const re = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\*([^*]+)\*)/g;
  let last = 0;
  let m;
  const push = (t, marks) => {
    if (!t) return;
    children.push({ _type: "span", _key: key(), text: t, marks: marks ?? [] });
  };
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) push(text.slice(last, m.index), []);
    if (m[1]) {
      // link
      const defKey = key();
      markDefs.push({ _key: defKey, _type: "link", href: m[3] });
      push(m[2], [defKey]);
    } else if (m[4]) {
      push(m[5], ["strong"]);
    } else if (m[6]) {
      push(m[7], ["code"]);
    } else if (m[8]) {
      push(m[9], ["em"]);
    }
    last = re.lastIndex;
  }
  if (last < text.length) push(text.slice(last), []);
  if (children.length === 0) push(text, []);
  return { children, markDefs };
}

function block(style, text, extra = {}) {
  const { children, markDefs } = parseInline(text);
  return { _type: "block", _key: key(), style, markDefs, children, ...extra };
}

function tableCells(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
const isTableSeparator = (l) => /^\s*\|?[\s:|-]*-{1,}[\s:|-]*\|?\s*$/.test(l) && l.includes("-");

export function markdownToPortableText(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(block("normal", paragraph.join(" ").trim()));
      paragraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // Markdown table: header row + separator row + body rows
    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushParagraph();
      const rows = [{ _type: "tableRow", _key: key(), header: true, cells: tableCells(line) }];
      i += 2; // skip header + separator
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push({ _type: "tableRow", _key: key(), cells: tableCells(lines[i]) });
        i++;
      }
      i--; // for-loop will increment
      blocks.push({ _type: "table", _key: key(), rows });
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      continue;
    }
    let m;
    if ((m = line.match(/^###\s+(.*)$/))) {
      flushParagraph();
      blocks.push(block("h3", m[1]));
    } else if ((m = line.match(/^##\s+(.*)$/))) {
      flushParagraph();
      blocks.push(block("h2", m[1]));
    } else if ((m = line.match(/^#\s+(.*)$/))) {
      flushParagraph();
      blocks.push(block("h2", m[1]));
    } else if ((m = line.match(/^>\s+(.*)$/))) {
      flushParagraph();
      blocks.push(block("blockquote", m[1]));
    } else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      flushParagraph();
      blocks.push(block("normal", m[1], { listItem: "bullet", level: 1 }));
    } else if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) {
      flushParagraph();
      blocks.push(block("normal", m[1], { listItem: "number", level: 1 }));
    } else {
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  return blocks;
}
