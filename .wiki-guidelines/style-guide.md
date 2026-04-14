# Wiki Style Guide

## Tone
- Professional but approachable
- Write for developers who are new to the project
- Assume the reader knows general web development but not this specific codebase

## Formatting Rules
- Use Markdown-compatible formatting (Confluence renders it)
- Use tables for endpoint references, env vars, and tech stack
- Use code blocks with language hints for code snippets (```python, ```bash, etc.)
- Use headings (H2, H3) to break up long pages — no page should be a wall of text
- Keep paragraphs short (3-5 sentences max)

## Language
- Write in English
- Hebrew terms (lead statuses, UI labels) should appear in Hebrew with an English translation in parentheses on first use
  - Example: `עסקה נסגרה` (closed deal)
- API paths use backtick formatting: `POST /api/v1/auth/register`

## Content Rules
- Every page must start with a one-line summary of what it covers
- Every endpoint table must include: Method, Path, Description
- Never include secrets, tokens, or real credentials — use placeholder values
- Keep the wiki in sync with the codebase — if the code changes, update the wiki
- Link between wiki pages where relevant (e.g., "See [Twilio Integration] for webhook details")

## Page Metadata
- Every parent page should link to its children at the bottom
- Use status labels where applicable (e.g., "In Progress", "Complete")
