---
title: "Document Ingestion"
description: "How to ingest documents without the development environment"
---

# Document Ingestion

This platform supports multiple ways to ingest documents without requiring the development environment to be running.

## Methods

### 1. API Route (Recommended for Production)

Use the REST API endpoint to ingest documents programmatically.

#### Endpoint

```
POST /api/ingest
```

#### Authentication (Optional)

Set `DOCUMENT_INGEST_USERNAME` and `DOCUMENT_INGEST_PASSWORD` environment variables to enable simple username/password authentication.

#### Request Body

```json
{
  "path": "guides/my-document",
  "content": "---\ntitle: My Document\ndescription: Document description\n---\n\n# Content here...",
  "token": "your-secret-token"
}
```

#### Example: cURL

```bash
curl -X POST https://your-domain.com/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "path": "guides/getting-started",
    "content": "---\ntitle: Getting Started\n---\n\n# Getting Started\n\nWelcome!",
    "username": "admin",
    "password": "your-secret-password"
  }'
```

#### Example: Node.js

```javascript
const response = await fetch('https://your-domain.com/api/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    path: 'guides/my-document',
    content: `---
title: My Document
---

# Content here...`,
    username: process.env.DOCUMENT_INGEST_USERNAME || 'admin',
    password: process.env.DOCUMENT_INGEST_PASSWORD,
  }),
});

const result = await response.json();
console.log(result);
```

#### Example: Python

```python
import requests
import os

response = requests.post(
    'https://your-domain.com/api/ingest',
    json={
        'path': 'guides/my-document',
        'content': '''---
title: My Document
---

# Content here...''',
        'username': os.getenv('DOCUMENT_INGEST_USERNAME', 'admin'),
        'password': os.getenv('DOCUMENT_INGEST_PASSWORD'),
    }
)

print(response.json())
```

### 2. CLI Script

Use the command-line script to ingest documents locally or in CI/CD pipelines.

#### Installation

The script uses `tsx` which should already be available. If not:

```bash
pnpm add -D tsx
```

#### Usage

**From a file:**
```bash
pnpm ingest guides/my-document ./my-document.mdx
```

**From stdin:**
```bash
cat my-document.mdx | pnpm ingest guides/my-document
```

**Direct content:**
```bash
echo "---\ntitle: Test\n---\n# Test" | pnpm ingest test/doc
```

#### In CI/CD

```yaml
# GitHub Actions example
- name: Ingest document
  run: |
    pnpm ingest guides/new-feature ./docs/new-feature.mdx
    pnpm build:content
```

### 3. Direct File System

Simply add files directly to the `docs/` directory:

```bash
# Copy file
cp my-document.mdx docs/guides/my-document.mdx

# Or create directly
cat > docs/guides/my-document.mdx << 'EOF'
---
title: My Document
---

# Content
EOF
```

Then rebuild Contentlayer:
```bash
pnpm build:content
```

## Processing Documents

After ingesting a document, you need to process it with Contentlayer:

### Development
- If `pnpm dev` is running, Contentlayer watches for changes automatically
- Just refresh your browser

### Production/CI
```bash
pnpm build:content  # Process documents
pnpm build          # Build Next.js app
```

## Security

### Username/Password Authentication (Recommended)

Set environment variables to protect the ingestion endpoint:

```bash
# .env.local or production environment
DOCUMENT_INGEST_USERNAME=admin
DOCUMENT_INGEST_PASSWORD=your-secret-password-here
```

**Note:** If `DOCUMENT_INGEST_PASSWORD` is not set, authentication is disabled. The default username is `admin` if `DOCUMENT_INGEST_USERNAME` is not set.

Then include username and password in API requests:

```json
{
  "path": "guides/doc",
  "content": "...",
  "username": "admin",
  "password": "your-secret-password-here"
}
```

### Path Validation

The API automatically prevents:
- Directory traversal (`../`)
- Absolute paths (`/`)
- Invalid characters

## Best Practices

1. **Always include frontmatter** with at least `title`:
   ```mdx
   ---
   title: "Document Title"
   description: "Optional description"
   ---
   ```

2. **Use consistent paths**: Follow a clear structure (e.g., `guides/`, `api/`, `reference/`)

3. **Update sidebar**: After ingesting, update `config/sidebar.tsx` to include the new document

4. **Validate content**: Ensure MDX syntax is valid before ingesting

5. **Version control**: Commit ingested documents to git for tracking

## Troubleshooting

### Document not appearing

1. Check if file was created: `ls docs/your/path.mdx`
2. Rebuild Contentlayer: `pnpm build:content`
3. Check Contentlayer logs for errors
4. Verify frontmatter is correct

### API returns 401

- Check if `DOCUMENT_INGEST_PASSWORD` is set in environment
- Verify username and password match environment variables
- Ensure both `username` and `password` are provided in request

### API returns 400

- Verify `path` is relative (no `/` or `..`)
- Ensure both `path` and `content` are provided
- Check JSON format is valid

## Examples

### Webhook Integration

```javascript
// Webhook handler (e.g., Vercel Serverless Function)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { document } = req.body;
  
  const response = await fetch(`${process.env.API_URL}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: document.path,
        content: document.content,
        username: process.env.DOCUMENT_INGEST_USERNAME || 'admin',
        password: process.env.DOCUMENT_INGEST_PASSWORD,
      }),
  });

  return res.json(await response.json());
}
```

### Automated Documentation Sync

```bash
#!/bin/bash
# sync-docs.sh - Sync documents from external source

for file in external-docs/*.mdx; do
  filename=$(basename "$file" .mdx)
  pnpm ingest "external/$filename" "$file"
done

pnpm build:content
```

