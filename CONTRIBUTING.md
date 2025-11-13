# Contributing to ness Documentation

Thank you for considering contributing to **ness Documentation**! 🚀 Your contributions help improve this project for everyone. Please follow these guidelines to ensure a smooth collaboration.

## Development Workflow

This project follows **Spec-Driven Development** using GitHub Spec Kit. All contributions must follow this workflow:

1. **Specification**: Create feature branch and specification via `create-new-feature.sh`
2. **Planning**: Execute `/speckit.plan` with technical stack details
3. **Tasks**: Generate task breakdown via `/speckit.tasks`
4. **Implementation**: Execute `/speckit.implement` or implement manually
5. **Validation**: Run quality gates before creating PR

See the [Development Workflow](/docs/settings/workflow) for detailed instructions.

## Code of Conduct

- Be respectful and inclusive
- Follow the project constitution (see `/docs/specs/constitution`)
- Maintain code quality standards
- Update documentation when making changes

## Quality Gates

Before submitting a PR:

- [ ] Run `pnpm lint` and fix all errors
- [ ] Run `pnpm type-check` and fix all errors
- [ ] Update `library.md` if new Context7 libraries were used
- [ ] Update documentation if needed
- [ ] Ensure Lighthouse scores meet targets (≥ 90)

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/resper1965/ndoc.git`
3. Install dependencies: `pnpm install`
4. Create a feature branch: `./.specify/scripts/bash/create-new-feature.sh "Your feature"`
5. Make your changes following the Spec-Driven Development workflow
6. Submit a pull request

Thank you for contributing! 🙏
