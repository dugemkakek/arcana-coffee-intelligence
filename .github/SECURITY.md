# Security Policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | ✅ Yes             |
| < 0.1   | ❌ No              |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Send a private email to **security@arcana-coffee.example** with:

1. A clear description of the vulnerability
2. Steps to reproduce (or a proof-of-concept)
3. Impact assessment (what an attacker could achieve)
4. Your name / handle for credit in the fix announcement (optional)

You should receive an acknowledgement within 72 hours. We aim to:

- Triage the report within 7 days
- Ship a fix for critical issues within 30 days
- Coordinate disclosure timing with you

## Scope

In-scope:

- The Arcana desktop app and AI service (this repo)
- Any data at rest in the local SQLite database
- Any data the AI service sends to the configured LLM provider

Out-of-scope:

- The third-party LLM provider's own security (contact them directly)
- The user's own network or Windows installation
- Roast hardware (Phidget, VNT, Kaffelogic) — vendor security policies apply
