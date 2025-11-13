# ness Documentation

Documentation platform for ness projects, built with **Spec-Driven Development** and **BMAD** methodology.

## Overview

This documentation platform is built using:
- **Next.js 15** for SEO-friendly, performant documentation
- **Tailwind CSS 4** for responsive design with ness design system
- **MDX** to blend documentation with React components
- **Contentlayer** for seamless content management
- **Spec Kit** for Spec-Driven Development workflow

## Design System

This platform follows the **ness design system**:
- **Colors**: Slate palette with #00ade8 primary accent
- **Typography**: Inter (body) and Montserrat (headings)
- **Spacing**: 4px base unit system
- **Philosophy**: "Invisible when it works, Present when it matters"

## Features

- **Spec-Driven Development** 🌱: Full integration with GitHub Spec Kit
- **MDX Support** 📚: Write rich, interactive documentation with JSX components
- **Automatic Content Indexing** 🔍: MDX pages are automatically indexed and searchable
- **Context7 Library Registry** 📦: Track external dependencies
- **Accessible** ♿: WCAG 2.1 AA compliant with keyboard navigation
- **Responsive** 📱: Works seamlessly on all devices

## Get Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Add your documentation as MDX files in the `/docs` folder
4. Start the development server: `pnpm dev`

## Development Workflow

All development follows the Spec-Driven Development workflow:
1. Create specification via `/speckit.specify`
2. Generate plan via `/speckit.plan`
3. Break down tasks via `/speckit.tasks`
4. Implement via `/speckit.implement`

See the [Development Workflow](/docs/settings/workflow) for detailed instructions.

## Links

- [Documentation](https://ndoc.vercel.app)
- [GitHub Repository](https://github.com/resper1965/ndoc)

---

## 🚀 Deploy to Vercel

Ready to deploy? Click the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/resper1965/ndoc)

---

_Built with ❤️ by ness_
