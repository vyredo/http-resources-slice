# Contributing to create-http-resources-slice

Thank you for considering contributing to create-http-resources-slice! We welcome contributions from the community.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/create-http-resources-slice.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## 📋 Development Guidelines

### Code Style

- Follow the existing code style
- Use 4 spaces for indentation
- Maximum line length: 100 characters
- Use single quotes for strings
- Semicolons are required

We use ESLint and Prettier to enforce code style. Run them before committing:

```bash
npm run lint
npm run format
```

### TypeScript

- Enable strict mode (already configured in tsconfig.json)
- Avoid `any` type - use proper type definitions
- Export types for all public APIs
- Add JSDoc comments for public functions

### Testing

- Write tests for all new features
- Maintain high test coverage (>90%)
- Run tests before submitting PR: `npm test`
- Tests should be isolated and reproducible

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Pull Request Process

1. **Branch Naming**
   - `feature/description` for new features
   - `fix/description` for bug fixes
   - `docs/description` for documentation
   - `refactor/description` for code improvements

2. **Commit Messages**
   - Use present tense: "Add feature" not "Added feature"
   - Be concise but descriptive
   - Reference issues when applicable

3. **PR Description**
   - Describe what changes you made
   - Explain why you made them
   - Include any relevant issue numbers
   - Add screenshots if UI changes

4. **Before Submitting**
   - [ ] Tests pass: `npm test`
   - [ ] Linting passes: `npm run lint`
   - [ ] Code is formatted: `npm run format`
   - [ ] TypeScript compiles: `npm run build`
   - [ ] Documentation updated (if needed)

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Description**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Create store with '...'
2. Call function '...'
3. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Code Example**
```typescript
// Minimal code example that reproduces the bug
```

**Environment:**
- OS: [e.g., macOS, Windows, Linux]
- Node.js version: [e.g., 20.11.0]
- Package version: [e.g., 1.0.0]
- State manager: [e.g., Zustand 4.5.0]

**Additional Context**
Add any other context about the problem here.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Problem Statement**
What problem are you trying to solve?

**Proposed Solution**
A clear and concise description of what you want to happen.

**Alternatives Considered**
A clear and concise description of any alternative solutions or features you've considered.

**Use Case Example**
```typescript
// How would this feature be used?
```

**Additional Context**
Add any other context, mockups, or examples about the feature request.
```

## 📚 Documentation

- Update README.md for user-facing changes
- Update JSDoc comments for API changes
- Add examples for new features
- Keep code examples in sync with the API

## 🔍 Code Review

All submissions require review. We use GitHub pull requests. Please:

- Be respectful and constructive
- Explain your reasoning
- Be open to feedback and changes
- Respond to review comments in a timely manner

## 📦 Release Process

Releases are managed by maintainers. The process:

1. Update CHANGELOG.md with version and date
2. Update version in package.json
3. Create a git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Publish to npm: `npm publish`
6. Create GitHub release with changelog

## 🙏 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Accept constructive criticism
- Focus on what's best for the community

## 📞 Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Join discussions in existing issues

## 🎯 Areas We Need Help

- Additional test cases
- Documentation improvements
- Performance optimizations
- Type improvements
- Examples for different frameworks

## 📜 License

By contributing to create-http-resources-slice, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
