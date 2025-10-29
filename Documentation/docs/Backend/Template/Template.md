# Endpoint document generate template guide

Generate professional API documentation in **Markdown/Docusaurus style**.

Use this structure:

1. **Module name & Base URL**
2. **Relationships diagram** (if any)
3. **Endpoints Overview Table** (Endpoint | Method | Description | Payload DTO)
4. **Detailed Endpoint Sections**:
   - Endpoint + Method
   - Description
   - Request Body (example JSON / DTO)
   - Response Example (use ApiResponse format)
   - Notes / JWT / passkey / special rules
5. **DTO Definitions** with example JSON and required fields
6. **General Notes** about authentication, security, and flows

**Style rules**:

- Use ✅/❌ for required fields in tables
- Clear JSON formatting
- Section dividers `---` between major sections
- Include all relevant flows (passkey, security questions, forgot password)

**Input format to provide**:
Module Name:  
Base URL:  
Relationships:  
Endpoints:  
DTOs:  
Notes:

---
