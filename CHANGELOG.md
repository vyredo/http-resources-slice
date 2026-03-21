# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release with full CRUD operations support
- Optimistic update support with automatic rollback
- Request cancellation for all HTTP methods
- Query parameter support for filtering and pagination
- TypeScript types for all exported functions
- Comprehensive test suite with Vitest
- GitHub Pages documentation site

### Features
- **Zero Dependencies**: No runtime dependencies, pure TypeScript
- **Framework Agnostic**: Works with Zustand, Valtio, or any (set, get) pattern
- **AI Agent Ready**: Predictable API designed for AI code generation
- **Type Safe**: Full TypeScript support with strict mode
- **Loading & Error States**: Per-operation state management
- **Bundle Size**: ~2kb minified, ~1kb gzipped

---

## Versioning Guidelines

This project uses [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible changes
- **MINOR** version for backwards-compatible features
- **PATCH** version for backwards-compatible bug fixes

**Example:**
- `1.0.0` - Initial release
- `1.1.0` - New features, backwards compatible
- `1.1.1` - Bug fixes
- `2.0.0` - Breaking changes

---

## Release Notes Template

### [X.Y.Z] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes in existing functionality

#### Deprecated
- Soon-to-be removed features

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security improvements
