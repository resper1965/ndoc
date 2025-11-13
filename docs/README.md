# Documentation Structure

This directory contains all your documentation files in MDX format. Contentlayer automatically processes these files and makes them available in your documentation site.

## Adding New Documentation

1. Create a new `.mdx` file in this directory (or a subdirectory)
2. Add frontmatter with required fields:

```mdx
---
title: "Your Page Title"
description: "Brief description of the page"
---

# Your Content

Start writing your documentation here...
```

3. **That's it!** The document is automatically processed by Contentlayer when you run `pnpm dev`
4. Update the sidebar navigation in `config/sidebar.tsx` to include your new page in the navigation

## Automatic Processing

✅ **During Development** (`pnpm dev`): Contentlayer watches for changes and automatically processes new/updated MDX files. No manual build needed!

✅ **During Production Build** (`pnpm build`): All documents are processed automatically as part of the Next.js build process.

⚠️ **Note**: If you add a new document while the dev server is running, it will be automatically detected and processed. Just refresh your browser to see it!

## File Structure

```
docs/
├── index.mdx          # Home page (required)
├── getting-started/   # Example: Create subdirectories for organization
│   └── introduction.mdx
└── guides/
    └── your-guide.mdx
```

## Frontmatter Fields

- `title` (required): Page title displayed in navigation and page header
- `description` (optional): Brief description for SEO and previews
- `date` (optional): Publication date (format: YYYY-MM-DD)

## Sidebar Navigation

To add pages to the sidebar, edit `config/sidebar.tsx`:

```tsx
{
  title: 'Your Section',
  icon: <YourIcon className="h-5 w-5" />,
  defaultOpen: true,
  pages: [
    {
      title: 'Your Page',
      href: '/docs/your-page',
    },
  ],
}
```

The sidebar will automatically reflect your navigation structure.

