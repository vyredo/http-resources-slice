# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the severity of the vulnerability:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of create-http-resources-slice seriously.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email at [security@example.com](mailto:security@example.com) or create a private vulnerability report on GitHub.

### What to Include

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes (if applicable)

### Response Time

We will acknowledge receipt of your report within **48 hours** and will send you a more detailed response within **5 business days** indicating the next steps in handling your report.

### Disclosure Policy

Once a security issue is reported, we follow this process:

1. **Investigation** - We investigate the report and confirm the vulnerability
2. **Fix Development** - We develop a fix for the vulnerability
3. **Testing** - We test the fix thoroughly
4. **Release** - We release a patched version
5. **Disclosure** - We publicly disclose the vulnerability after users have had time to update

We aim to resolve critical security issues within **7 days** of reporting.

## Security Best Practices

When using create-http-resources-slice, please follow these security best practices:

### 1. Validate API Responses
Always validate data received from API endpoints before using it in your application.

```typescript
try {
  const { data } = await fetchUsers();
  // Validate data before using
  if (Array.isArray(data)) {
    // Process data
  }
} catch (error) {
  // Handle error
}
```

### 2. Use HTTPS
Always use HTTPS for API endpoints to encrypt data in transit.

```typescript
createHttpResources('user', {
  baseUrl: 'https://api.example.com' // ✅ Use HTTPS
});
```

### 3. Handle Authentication Securely
Store tokens securely and never expose them in client-side code.

```typescript
// ✅ Good: Use environment variables
createHttpResources('user', {
  fetchOptions: {
    headers: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`
    }
  }
});
```

### 4. Implement Request Cancellation
Cancel requests when components unmount to prevent memory leaks and unwanted state updates.

```typescript
useEffect(() => {
  const { fetchUsers, cancelFetchUsers } = useStore();
  fetchUsers();
  
  return () => {
    cancelFetchUsers(); // Cleanup on unmount
  };
}, []);
```

### 5. Handle Errors Gracefully
Always implement proper error handling to prevent information leakage.

```typescript
try {
  await postUser(userData);
} catch (error) {
  // Log error appropriately
  console.error('Failed to create user');
  // Don't expose internal error details to users
}
```

## Known Limitations

- This library does not perform input validation - validate data before sending to API
- This library does not handle authentication - implement auth in your API layer
- This library does not encrypt data - use HTTPS for all API calls

## Contact

For security-related questions, please contact:
- Email: security@example.com
- GitHub: @yourusername

---

Thank you for helping keep create-http-resources-slice and our users safe!
