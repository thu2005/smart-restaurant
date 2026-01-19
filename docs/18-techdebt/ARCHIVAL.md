# Archival & End-of-Life (EOL) Documentation

This document tracks deprecated features, legacy code, archived components, and the lifecycle management policy for the Smart Restaurant QR Ordering System.

> **Created:** 2025-10-31  
> **Last Updated:** 2026-01-19  
> **Status:** Active Maintenance

---

## Table of Contents

- [Versioning Policy](#versioning-policy)
- [End-of-Life (EOL) Policy](#end-of-life-eol-policy)
- [Deprecated Features](#deprecated-features)
- [Legacy Code](#legacy-code)
- [Archived Components](#archived-components)
- [Migration Guides](#migration-guides)
- [Technical Debt Items](#technical-debt-items)
- [Upcoming Changes](#upcoming-changes)

---

## Versioning Policy

### Semantic Versioning

The Smart Restaurant System follows **Semantic Versioning 2.0.0** (SemVer):

**Format:** `MAJOR.MINOR.PATCH`

- **MAJOR** (1.x.x) - Breaking changes, incompatible API changes
- **MINOR** (x.1.x) - New features, backwards-compatible
- **PATCH** (x.x.1) - Bug fixes, backwards-compatible

**Current Versions:**
- **Backend API:** v1.0.0
- **Frontend App:** v0.0.1 (Pre-release)
- **Database Schema:** v1.0 (Prisma)

### Version History

| Version | Release Date | Type | Description |
|---------|--------------|------|-------------|
| v1.0.0 | 2025-11-15 | Major | Initial production release |
| v0.9.0 | 2025-10-20 | Beta | Feature-complete beta |
| v0.5.0 | 2025-09-10 | Alpha | Early access version |

### Release Cycle

- **Major Releases:** Every 12-18 months
- **Minor Releases:** Every 2-3 months
- **Patch Releases:** As needed (security, critical bugs)
- **LTS Support:** Major versions supported for 2 years

---

## End-of-Life (EOL) Policy

### Support Lifecycle

Each major version follows this lifecycle:

1. **Active Development** (12 months)
   - New features added
   - Bug fixes
   - Security patches
   - Full support

2. **Maintenance Mode** (6 months)
   - Critical bug fixes only
   - Security patches
   - No new features

3. **Extended Support** (6 months)
   - Security patches only
   - Critical vulnerabilities

4. **End-of-Life**
   - No updates
   - No support
   - Archived

### EOL Schedule

| Version | Release Date | EOL Date | Status | Notes |
|---------|--------------|----------|--------|-------|
| v1.0.0 | 2025-11-15 | 2027-11-15 | **Active** | Current production |
| v0.9.0 | 2025-10-20 | 2025-12-20 | EOL | Upgrade to v1.0.0 |
| v0.5.0 | 2025-09-10 | 2025-11-10 | EOL | Superseded |

### Deprecation Notice Period

- **Features:** 6 months notice before removal
- **APIs:** 12 months notice before breaking changes
- **Dependencies:** Follow upstream EOL schedules

---

## Deprecated Features

### 1. Legacy Table Entry Route

**Deprecated:** v1.0.0 (2025-11-15)  
**EOL Date:** v2.0.0 (Planned 2027)  
**Reason:** Security improvement, better URL structure

**Old Format:**
```
/table/:tableId
```

**New Format:**
```
/qr/:restaurantId/:tableId
```

**Migration:**
- Old routes still work for backward compatibility
- All new QR codes use new format
- Admin dashboard generates new format only

**Code Location:**
```javascript
// frontend/src/Routes.jsx (Line 64)
<Route path="/table/:tableId" element={<TableEntry />} />
```

**Impact:**
- Existing QR codes continue to work
- New deployments should use new format
- Old format will be removed in v2.0.0

**Action Required:**
- Regenerate all QR codes using Admin → Tables page
- Update any hardcoded URLs in marketing materials
- Test both formats during transition period

---

### 2. Auto-Verified Email for Development

**Deprecated:** v1.0.0 (2025-11-15)  
**EOL Date:** Production deployment  
**Reason:** Security - production must verify emails

**Current Behavior:**
```javascript
// backend/src/services/auth.service.js (Line 62)
emailVerified: true // Auto-verify for development
```

**Production Behavior:**
```javascript
emailVerified: false // Require email verification
```

**Migration:**
- Enable email verification in production
- Configure SMTP or Resend API
- Update user registration flow

**Code Locations:**
- `backend/src/services/auth.service.js` (Lines 62, 67, 120)

**Action Required:**
- Set `NODE_ENV=production` in deployment
- Configure email service (SMTP/Resend)
- Test email verification flow
- Update user documentation

---

### 3. Kitchen Complete Order Function

**Deprecated:** v1.0.0 (2025-11-15)  
**Status:** Soft deprecation (still functional)  
**Reason:** Workflow change - waiters complete orders, not kitchen

**Legacy Code:**
```javascript
// frontend/src/pages/kitchen/dashboard/index.jsx (Line 190)
const handleCompleteOrder = async (orderId) => {
  // This function might be deprecated if Kitchen doesn't complete orders
}
```

**New Workflow:**
1. Kitchen marks items as READY
2. Waiter serves order
3. Waiter completes order (not kitchen)

**Migration:**
- Kitchen can still mark orders READY
- Complete button removed from kitchen UI in future versions
- Waiters handle order completion

**Action Required:**
- Update kitchen staff training
- Remove complete button in next major version

---

### 4. MongoDB Reference in package.json

**Deprecated:** v0.5.0 (2025-09-10)  
**Removed:** v1.0.0 (2025-11-15)  
**Reason:** Switched from MongoDB to PostgreSQL

**Legacy:**
```json
"keywords": ["mongodb"]
```

**Current:**
Using PostgreSQL with Prisma ORM

**Migration:**
- Completed in v1.0.0
- No action required
- Historical note only

---

## Legacy Code

### 1. Deprecated HTML Attributes

**Location:** `frontend/src/pages/admin/reports/MetabaseDashboard.jsx` (Line 79)

**Issue:**
```jsx
frameBorder="0" // Deprecated but widely supported
```

**Replacement:**
```jsx
style={{ border: 0 }}
```

**Priority:** Low  
**Impact:** None (still works in all browsers)  
**Scheduled:** Next refactor cycle

---

### 2. Manual Status Change in Kitchen

**Location:** `frontend/src/pages/kitchen/dashboard/index.jsx` (Line 175)

**Issue:**
```javascript
// Legacy support for manual status change if needed
```

**Current State:**
- Kept for backward compatibility
- Rarely used in production
- May be removed in v2.0.0

**Recommendation:**
- Use item-level status tracking instead
- Remove manual order status override

---

### 3. TODO Items in Codebase

**Dashboard Navigation (Admin):**
```javascript
// frontend/src/pages/admin/dashboard/index.jsx (Line 244)
// TODO: Navigate to table details or show modal

// Line 249
// TODO: Call API to update order status
```

**Status:** Planned for v1.1.0  
**Priority:** Medium

**Allergens Field (Kitchen):**
```javascript
// frontend/src/pages/kitchen/dashboard/index.jsx (Line 138)
allergens: [], // TODO: Add allergens field to MenuItem schema
```

**Status:** Planned for v1.2.0 (requires schema migration)  
**Priority:** High (food safety feature)

---

## Archived Components

### 1. MongoDB Adapter (Removed v1.0.0)

**Archive Date:** 2025-11-15  
**Reason:** Migrated to PostgreSQL with Prisma ORM

**What Was Removed:**
- Mongoose models
- MongoDB connection strings
- NoSQL query patterns

**Replacement:**
- Prisma schema (`backend/prisma/schema.prisma`)
- PostgreSQL on Supabase
- SQL-based queries

**Archive Location:**
- Git history: Commit before v1.0.0
- Branch: `archive/mongodb-adapter`

---

### 2. Old Authentication System (Removed v0.9.0)

**Archive Date:** 2025-10-20  
**Reason:** Security improvements, JWT implementation

**What Was Removed:**
- Session-based authentication
- Cookie storage
- Express-session middleware

**Replacement:**
- JWT tokens
- Passport.js strategies
- Bearer token authentication

---

## Migration Guides

### Migrating from v0.9.0 to v1.0.0

**Breaking Changes:**

1. **Database:** MongoDB → PostgreSQL
   - Export all data to JSON
   - Run Prisma migrations
   - Import data using seed scripts

2. **Authentication:** Session → JWT
   - Users must re-login
   - Update client token storage
   - Configure JWT secrets

3. **QR Code Format:** Updated structure
   - Regenerate all table QR codes
   - Update printed materials

**Step-by-Step:**

```bash
# 1. Backup existing data
npm run backup

# 2. Update dependencies
npm install

# 3. Run database migrations
npx prisma migrate deploy

# 4. Seed new data structure
npm run seed

# 5. Update environment variables
# Add: JWT_SECRET, DATABASE_URL, DIRECT_URL

# 6. Restart services
npm run start
```

### Migrating from Legacy Routes

**Old QR Codes:**
```
http://yourapp.com/table/T01
```

**New QR Codes:**
```
http://yourapp.com/qr/{restaurantId}/{tableId}
```

**Migration Script:**
```javascript
// Run in admin dashboard
const regenerateQRCodes = async () => {
  const tables = await getAllTables();
  for (const table of tables) {
    await updateTableQRCode(table.id, {
      format: 'v2',
      url: `/qr/${restaurantId}/${table.id}`
    });
  }
};
```

---

## Technical Debt Items

### High Priority

1. **Email Verification System**
   - Currently disabled in development
   - Must enable before production
   - Configure SMTP/Resend
   - **Timeline:** Before production deployment

2. **Allergen Field in Menu Items**
   - TODO comment in kitchen dashboard
   - Food safety requirement
   - Requires schema migration
   - **Timeline:** v1.2.0 (Q2 2026)

3. **Error Boundaries**
   - Add comprehensive error boundaries
   - Improve error messages
   - Better crash reporting
   - **Timeline:** v1.1.0 (Q1 2026)

### Medium Priority

1. **Dashboard Navigation**
   - Complete TODO items in admin dashboard
   - Add table detail modals
   - Improve order status updates
   - **Timeline:** v1.1.0

2. **Test Coverage**
   - Currently: "No tests yet"
   - Add unit tests
   - Add integration tests
   - Set up CI/CD testing
   - **Timeline:** v1.3.0 (Q3 2026)

3. **Code Refactoring**
   - Remove legacy comments
   - Clean up deprecated patterns
   - Improve type safety
   - **Timeline:** Ongoing

### Low Priority

1. **HTML Attribute Updates**
   - Replace deprecated `frameBorder`
   - Modernize HTML5 usage
   - **Timeline:** v2.0.0

2. **Performance Optimization**
   - Add Redis caching
   - Optimize database queries
   - Implement lazy loading
   - **Timeline:** v1.4.0 (Q4 2026)

---

## Upcoming Changes

### Planned for v1.1.0 (Q1 2026)

- ✅ Complete admin dashboard TODOs
- ✅ Add table detail navigation
- ✅ Improve order status workflow
- ⏳ Add comprehensive error boundaries
- ⏳ Performance monitoring improvements

### Planned for v1.2.0 (Q2 2026)

- 🔄 Add allergen field to menu items (schema migration)
- 🔄 Enhanced nutritional information
- 🔄 Improved kitchen filtering
- 🔄 Multi-language menu translations

### Planned for v2.0.0 (2027)

- ❌ **BREAKING:** Remove legacy `/table/:id` route
- ❌ **BREAKING:** Remove kitchen complete order function
- ✨ Microservices architecture
- ✨ GraphQL API option
- ✨ Mobile native apps (iOS/Android)
- ✨ Advanced analytics dashboard

---

## Deprecation Warnings

### How We Communicate Deprecations

1. **In-Code Warnings:**
   - Console warnings for deprecated functions
   - JSDoc `@deprecated` tags
   - Inline comments

2. **Documentation:**
   - This ARCHIVAL.md file
   - Release notes
   - API documentation

3. **Communication Channels:**
   - Email to registered administrators
   - Dashboard notifications
   - GitHub releases

### Example Deprecation Warning

```javascript
/**
 * @deprecated Since v1.0.0. Use newFunction() instead.
 * Will be removed in v2.0.0.
 */
function oldFunction() {
  console.warn('DEPRECATED: oldFunction() is deprecated. Use newFunction() instead.');
  // Legacy implementation
}
```

---

## Archive Repository

### Accessing Archived Code

**Git Branches:**
- `archive/mongodb-adapter` - Old MongoDB code
- `archive/session-auth` - Old authentication system
- `archive/v0.x` - Pre-1.0 releases

**Commands:**
```bash
# View archived branches
git branch -a | grep archive

# Access archived code
git checkout archive/mongodb-adapter

# Compare with current
git diff main archive/mongodb-adapter
```

### Documentation Archive

Historical documentation available at:
- `docs/archive/` (local)
- GitHub Wiki (old versions)
- Release tags (point-in-time snapshots)

---

## Support Matrix

### Browser Support

| Browser | Min Version | Status | EOL Date |
|---------|-------------|--------|----------|
| Chrome | 90+ | ✅ Supported | - |
| Firefox | 88+ | ✅ Supported | - |
| Safari | 14+ | ✅ Supported | - |
| Edge | 90+ | ✅ Supported | - |
| IE 11 | All | ❌ Never supported | - |

### Node.js Support

| Version | Status | EOL Date |
|---------|--------|----------|
| Node 20.x | ✅ Recommended | 2026-04-30 |
| Node 18.x | ✅ Supported | 2025-04-30 |
| Node 16.x | ⚠️ Legacy | 2024-09-11 (past EOL) |
| Node 14.x | ❌ Unsupported | 2023-04-30 (past EOL) |

### Database Support

| Database | Version | Status | Notes |
|----------|---------|--------|-------|
| PostgreSQL | 16+ | ✅ Recommended | Via Supabase |
| PostgreSQL | 14-15 | ✅ Supported | May have minor issues |
| PostgreSQL | <14 | ⚠️ Legacy | Not tested |
| MongoDB | Any | ❌ Removed | Use v0.9.0 or earlier |

---

## Contact & Support

### Reporting Deprecated Features

If you're using a deprecated feature and need extended support:

1. **Open GitHub Issue:** Use "Deprecation Support Request" template
2. **Email:** support@smartrestaurant.com
3. **Slack:** #deprecated-features channel

### Migration Assistance

For help migrating from deprecated features:

- **Documentation:** See [Migration Guides](#migration-guides)
- **Community:** GitHub Discussions
- **Professional Support:** Contact development team

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-19 | - | Comprehensive archival documentation added |
| 2025-11-15 | v1.0.0 | Initial production release, deprecated legacy routes |
| 2025-10-31 | - | Document created |

---

## Related Documents

- [Technical Debt Register](../17-maintenance/DEBT_REGISTER.md)
- [Release Notes](../13-releases/RELEASE_NOTES_TEMPLATE.md)
- [SRS Changelog](../01-product/03-SRS_CHANGELOG.md)
- [Contributing Guide](../04-dev/CONTRIBUTING.md)
