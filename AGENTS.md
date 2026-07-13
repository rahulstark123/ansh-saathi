<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Database Design Rules (Multi-Tenancy)
- **Workspace ID (`wid`)**: Every workspace created will have a `wid` column of type `Int` (Integer) that auto-increments sequentially (1, 2, 3, etc.).
- **Tenant Association**: All other database tables (e.g. `Customer`, `Saathi`, `Commission`, etc.) MUST contain this `wid` column (type `Int`) to map data to its respective workspace.

