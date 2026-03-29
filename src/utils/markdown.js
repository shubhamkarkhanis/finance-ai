/**
 * A simple and safe Markdown to HTML renderer.
 * Supports:
 * - Headings (h1, h2, h3) using #, ##, ###
 * - Unordered lists using *, -, +
 * - Bold using **text**
 * - Italic using *text*
 */
export function renderMarkdownToHtml(md) {
  if (!md) return '';

  const escapeHtml = (text) => 
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Process inline styles like **bold** and *italic* first
  const processInline = (text) =>
    escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

  const lines = md.split(/\r?\n/);
  let html = '';
  let inList = false;

  for (const line of lines) {
    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      if (inList) { html += '</ul>'; inList = false; }
      const level = headingMatch[1].length;
      const content = processInline(headingMatch[2]);
      html += `<h${level} class='text-lg font-semibold mt-4 mb-2 text-white'>${content}</h${level}>`;
      continue;
    }

    // Unordered list items
    const listMatch = line.match(/^[-*+]\s+(.*)$/);
    if (listMatch) {
      const content = processInline(listMatch[1]);
      if (!inList) {
        html += "<ul class='list-disc list-inside space-y-1 text-gray-300 mt-2'>";
        inList = true;
      }
      html += `<li>${content}</li>`;
      continue;
    }

    if (inList) { html += '</ul>'; inList = false; }

    // Paragraphs and blank lines
    if (line.trim() === '') {
      html += '<br />';
    } else {
      html += `<p class='text-gray-300'>${processInline(line)}</p>`;
    }
  }

  if (inList) html += '</ul>';
  return html;
}