# Release Notes Template & Release Process

## Table of Contents
- [Release Notes Template](#release-notes-template)
- [Release Process](#release-process)
- [Version Numbering](#version-numbering)
- [Deployment Checklist](#deployment-checklist)
- [Rollback Procedures](#rollback-procedures)

---

## Release Notes Template

### Format

```markdown
# Release v{MAJOR}.{MINOR}.{PATCH} - {Release Name}

**Release Date**: {YYYY-MM-DD}  
**Release Type**: Major | Minor | Patch | Hotfix  
**Status**: Planned | In Progress | Released  

## Summary

{Brief overview of this release - 2-3 sentences}

## Highlights

- {Major new feature}
- {Significant improvement}
- {Important fix}

## What's New

### Features

#### {Feature Name}
- **Description**: {What does this feature do?}
- **User Impact**: {How does this benefit users?}
- **Documentation**: {Link to docs}
- **Related Issues**: #{issue_number}

### Improvements

#### {Improvement Name}
- **Description**: {What was improved?}
- **Before**: {Previous behavior}
- **After**: {New behavior}
- **Performance Impact**: {If applicable}

### Bug Fixes

#### {Bug Title}
- **Issue**: {What was the problem?}
- **Fix**: {How was it resolved?}
- **Affected Users**: {Who was impacted?}
- **Related Issues**: #{issue_number}

## Technical Changes

### Backend
- {Change 1}
- {Change 2}

### Frontend
- {Change 1}
- {Change 2}

### Database
- **Migrations**: {Yes/No}
- **Schema Changes**: {List changes if any}
- **Backward Compatible**: {Yes/No}

### Dependencies
- **Upgraded**: {package@version → package@new_version}
- **Added**: {new_package@version}
- **Removed**: {removed_package}

## Breaking Changes

**{Breaking Change Title}**
- **What Changed**: {Description}
- **Migration Path**: {How to update}
- **Deadline**: {When old API will be removed}

## Deprecations

**{Deprecated Feature}**
- **Reason**: {Why is it being deprecated?}
- **Alternative**: {What should users use instead?}
- **Timeline**: Deprecated in v{X.Y.Z}, removed in v{A.B.C}

## Security Updates

**{Security Issue}**
- **Severity**: Critical | High | Medium | Low
- **Description**: {What was the vulnerability?}
- **Fix**: {How was it patched?}
- **CVE**: {CVE-YYYY-XXXXX if applicable}

## Known Issues

- {Known issue 1 with workaround}
- {Known issue 2 with planned fix}

## Upgrade Instructions

### For Restaurant Owners

1. {Step 1}
2. {Step 2}

### For Developers

```bash
# Backend
cd backend
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart smart-restaurant-api

# Frontend
cd frontend
git pull origin main
npm install
npm run build
pm2 restart smart-restaurant-frontend
```

## Performance Metrics

- **API Response Time**: {Before → After}
- **Database Queries**: {Optimized queries count}
- **Bundle Size**: {Before → After}
- **Memory Usage**: {Before → After}

## Testing

- Unit Tests: {Pass rate}
- Integration Tests: {Pass rate}
- E2E Tests: {Pass rate}
- Manual Testing: {Completed scenarios}

## Contributors

- {Name} (@{github_username})
- {Name} (@{github_username})

## Resources

- [Full Changelog](https://github.com/org/repo/compare/v{old}...v{new})
- [Documentation](https://docs.example.com/v{version})
- [Migration Guide](./MIGRATION_v{version}.md)
```

---

## Example Release Notes

# Release v1.2.0 - Kitchen Display System Enhancement

**Release Date**: 2026-01-25  
**Release Type**: Minor  
**Status**: Released  

## Summary

This release introduces major improvements to the Kitchen Display System (KDS) with item-level status tracking, enhanced real-time notifications, and performance optimizations for high-traffic restaurants.

## Highlights

- Item-level cooking status tracking in KDS
- 40% faster order list rendering with virtualization
- Fixed WebSocket connection drops during peak hours

## What's New

### Features

#### Item-Level Status Tracking
- **Description**: Kitchen staff can now mark individual items as "cooking" or "ready" instead of entire orders
- **User Impact**: Better coordination for multi-course meals and different cooking stations
- **Documentation**: [KDS Guide](../10-user/STAFF_KDS_GUIDE.md#item-level-status-tracking)
- **Related Issues**: #145, #178

#### Enhanced Push Notifications
- **Description**: Added sound alerts and desktop notifications for new orders
- **User Impact**: Kitchen staff no longer miss orders during busy periods
- **Documentation**: [Notification Settings](../10-user/STAFF_KDS_GUIDE.md#notifications)

### Improvements

#### Order List Performance
- **Description**: Implemented React virtualization for large order lists
- **Before**: Page freezes with 50+ active orders
- **After**: Smooth scrolling with 200+ orders
- **Performance Impact**: 40% faster initial render, 60% less memory usage

#### WebSocket Reliability
- **Description**: Improved WebSocket reconnection logic
- **Before**: Connection drops required page refresh
- **After**: Automatic reconnection with exponential backoff

### Bug Fixes

#### Order Status Sync Issue
- **Issue**: Kitchen status updates not reflecting in waiter dashboard
- **Fix**: Added transaction-based status updates with optimistic locking
- **Affected Users**: All restaurants during peak hours
- **Related Issues**: #234

#### Timer Display Bug
- **Issue**: Elapsed time timer showing negative values after midnight
- **Fix**: Corrected timezone handling in timer calculation
- **Related Issues**: #256

## Technical Changes

### Backend
- Added `itemStatus` field to OrderItem model
- Implemented WebSocket heartbeat mechanism (30s interval)
- Optimized database queries with composite indexes
- Added Prometheus metrics for WebSocket connections

### Frontend
- Upgraded React to v18.2.0
- Implemented react-window for virtualized lists
- Added Web Notification API integration
- Refactored Socket.IO event handlers

### Database
- **Migrations**: Yes
- **Schema Changes**: Added `itemStatus` column to `order_items` table
- **Backward Compatible**: Yes

```sql
-- Migration: 20260120_add_item_status
ALTER TABLE order_items ADD COLUMN itemStatus VARCHAR(20) DEFAULT 'queued';
CREATE INDEX idx_order_items_status ON order_items(itemStatus);
```

### Dependencies
- **Upgraded**: react@18.2.0, socket.io-client@4.6.1
- **Added**: react-window@1.8.10, react-notifications-component@4.0.1
- **Removed**: None

## Breaking Changes

None in this release.

## Deprecations

None in this release.

## Security Updates

None in this release.

## Known Issues

- Desktop notifications require user permission (prompt on first visit)
- Order timer may show slight delay (< 1s) during high CPU usage

## Upgrade Instructions

### For Restaurant Owners

1. No action required - auto-deployed to all restaurants
2. Kitchen staff may see permission prompt for desktop notifications (click "Allow")
3. Existing orders will show "queued" status for all items

### For Developers

```bash
# Backend
cd backend
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart smart-restaurant-api

# Frontend
cd frontend
git pull origin main
npm install
npm run build
pm2 restart smart-restaurant-frontend
```

## Performance Metrics

- **API Response Time (P95)**: 480ms → 320ms
- **Database Queries**: Optimized 15 queries with indexes
- **Bundle Size**: 2.1MB → 1.9MB (gzip)
- **Memory Usage**: 180MB → 110MB average

## Testing

- Unit Tests: 98% pass (342/349)
- Integration Tests: 100% pass (87/87)
- E2E Tests: 95% pass (38/40)
- Manual Testing: 25 scenarios completed

## Contributors

- @johndoe - Item-level status tracking
- @janedoe - WebSocket reliability improvements
- @alexsmith - Performance optimizations

## Resources

- [Full Changelog](https://github.com/smart-restaurant/app/compare/v1.1.0...v1.2.0)
- [Documentation](https://docs.smartrestaurant.com/v1.2.0)
- [Migration Guide](./MIGRATION_v1.2.0.md)

---

## Release Process

### 1. Planning Phase

**Timeline**: 2-4 weeks before release

**Activities:**
- Define release scope and goals
- Create GitHub milestone for release
- Assign issues to milestone
- Create release branch: `release/v{MAJOR}.{MINOR}.{PATCH}`

**Checklist:**
- [ ] Release scope defined
- [ ] Milestone created
- [ ] Issues assigned
- [ ] Release branch created
- [ ] Stakeholders notified

### 2. Development Phase

**Timeline**: During sprint(s)

**Activities:**
- Develop features/fixes
- Write tests (unit, integration, E2E)
- Update documentation
- Code reviews and merge to release branch

**Checklist:**
- [ ] All features implemented
- [ ] Test coverage > 80%
- [ ] Documentation updated
- [ ] Code reviews completed
- [ ] No critical bugs remaining

### 3. Testing Phase

**Timeline**: 1 week before release

**Activities:**
- Run full test suite
- Manual QA testing
- Performance testing
- Security scanning
- Staging deployment

**Checklist:**
- [ ] All tests passing
- [ ] QA sign-off received
- [ ] Performance benchmarks met
- [ ] Security scan clean
- [ ] Staging deployment successful

### 4. Pre-Release Phase

**Timeline**: 2-3 days before release

**Activities:**
- Finalize release notes
- Update changelog
- Tag release candidate: `v{MAJOR}.{MINOR}.{PATCH}-rc.{N}`
- Deploy to staging
- Final stakeholder review

**Checklist:**
- [ ] Release notes written
- [ ] Changelog updated
- [ ] RC tagged
- [ ] Staging verified
- [ ] Stakeholder approval

### 5. Release Phase

**Timeline**: Release day

**Activities:**
- Merge release branch to main
- Tag release: `v{MAJOR}.{MINOR}.{PATCH}`
- Deploy to production
- Monitor metrics
- Publish release notes

**Checklist:**
- [ ] Release branch merged
- [ ] Tag created
- [ ] Production deployed
- [ ] Smoke tests passed
- [ ] Metrics normal
- [ ] Release notes published
- [ ] Users notified

### 6. Post-Release Phase

**Timeline**: 1-3 days after release

**Activities:**
- Monitor error rates and performance
- Address hotfix issues
- Gather user feedback
- Update project board
- Retrospective meeting

**Checklist:**
- [ ] No critical issues reported
- [ ] Metrics stable
- [ ] User feedback collected
- [ ] Retrospective completed
- [ ] Lessons learned documented

---

## Version Numbering

**Format**: `v{MAJOR}.{MINOR}.{PATCH}`

**Semantic Versioning:**

| Version Type | When to Increment | Example |
|--------------|-------------------|----------|
| **MAJOR** | Breaking changes, major features | 1.0.0 → 2.0.0 |
| **MINOR** | New features, backward compatible | 1.2.0 → 1.3.0 |
| **PATCH** | Bug fixes, small improvements | 1.2.3 → 1.2.4 |
| **Hotfix** | Critical bug fix, deployed immediately | 1.2.3 → 1.2.4 |

**Pre-release Tags:**
- `v{X.Y.Z}-alpha.{N}`: Early testing version
- `v{X.Y.Z}-beta.{N}`: Feature-complete, testing phase
- `v{X.Y.Z}-rc.{N}`: Release candidate, final testing

**Examples:**
- `v1.0.0` - Initial release
- `v1.1.0` - Added KDS item-level tracking
- `v1.1.1` - Fixed WebSocket reconnection bug
- `v2.0.0` - Major UI redesign (breaking changes)
- `v1.2.0-rc.1` - Release candidate for v1.2.0

---

## Deployment Checklist

### Pre-Deployment

**Code Quality:**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage > 80%
- [ ] Linting passes (no errors)
- [ ] Type checking passes (TypeScript)
- [ ] Security scan clean (npm audit, Snyk)

**Database:**
- [ ] Migrations tested on staging
- [ ] Backup created
- [ ] Rollback script prepared
- [ ] Data migration tested (if applicable)

**Configuration:**
- [ ] Environment variables updated
- [ ] Feature flags configured
- [ ] API keys rotated (if needed)
- [ ] CORS settings verified

**Documentation:**
- [ ] API docs updated (Swagger)
- [ ] User guides updated
- [ ] Migration guide written (if breaking changes)
- [ ] Runbook updated

**Communication:**
- [ ] Stakeholders notified (24h advance)
- [ ] Maintenance window scheduled (if needed)
- [ ] Support team briefed
- [ ] Customer communication drafted

### Deployment Steps

**Backend Deployment:**
```bash
# 1. SSH to production server
ssh user@production-server

# 2. Navigate to project
cd /var/www/smart-restaurant/backend

# 3. Pull latest code
git fetch origin
git checkout v{X.Y.Z}

# 4. Install dependencies
npm ci --only=production

# 5. Run database migrations
npx prisma migrate deploy

# 6. Build application
npm run build

# 7. Restart service
pm2 restart smart-restaurant-api

# 8. Verify health
curl http://localhost:5001/health
```

**Frontend Deployment:**
```bash
# 1. SSH to production server
ssh user@production-server

# 2. Navigate to project
cd /var/www/smart-restaurant/frontend

# 3. Pull latest code
git fetch origin
git checkout v{X.Y.Z}

# 4. Install dependencies
npm ci --only=production

# 5. Build for production
npm run build

# 6. Deploy build (Vercel/Netlify or copy to nginx)
cp -r dist/* /var/www/html/

# 7. Clear CDN cache (if applicable)
# cloudflare purge cache or similar
```

### Post-Deployment

**Verification:**
- [ ] Homepage loads
- [ ] API health check passes
- [ ] Database connectivity confirmed
- [ ] WebSocket connections working
- [ ] Payment gateway reachable
- [ ] Smoke test suite passes

**Monitoring:**
- [ ] Error rate normal (< 1%)
- [ ] Response time acceptable (< 500ms P95)
- [ ] CPU usage stable
- [ ] Memory usage stable
- [ ] Database connections stable

**Communication:**
- [ ] Deployment status announced
- [ ] Release notes published
- [ ] Support team on standby
- [ ] Monitor user feedback

---

## Rollback Procedures

### When to Rollback

**Critical Issues:**
- Error rate > 5%
- Payment processing failures
- Database corruption
- Security vulnerability exploited
- Complete system outage

**Non-Critical Issues:**
- Minor bugs (can be hotfixed)
- Performance degradation < 20%
- UI glitches

### Rollback Steps

**Backend Rollback:**
```bash
# 1. SSH to production
ssh user@production-server
cd /var/www/smart-restaurant/backend

# 2. Checkout previous version
git checkout v{PREVIOUS_VERSION}

# 3. Reinstall dependencies
npm ci --only=production

# 4. Rollback database (if migration was breaking)
npx prisma migrate rollback

# 5. Rebuild
npm run build

# 6. Restart
pm2 restart smart-restaurant-api

# 7. Verify
curl http://localhost:5001/health
```

**Frontend Rollback:**
```bash
# 1. Revert to previous build
cp -r /var/www/backups/frontend-v{PREVIOUS_VERSION}/* /var/www/html/

# 2. Clear CDN cache
# cloudflare purge

# 3. Verify
curl https://app.smartrestaurant.com
```

**Database Rollback:**
```bash
# If migration needs rollback
npx prisma migrate rollback

# If data needs restoration (EXTREME CASE)
pg_restore -U postgres -d smart_restaurant /backups/pre_deploy_backup.sql
```

### Post-Rollback

**Actions:**
1. Verify system stability
2. Notify stakeholders of rollback
3. Create incident report
4. Schedule post-mortem
5. Plan hotfix or re-release

**Communication Template:**
```
Subject: [INCIDENT] Deployment Rollback - v{X.Y.Z}

Team,

We have rolled back the v{X.Y.Z} deployment due to {reason}.

Current Status:
- System: Stable on v{PREVIOUS_VERSION}
- Users: No data loss
- Impact: {duration} downtime / {affected_users} users affected

Next Steps:
- Root cause analysis: {date/time}
- Fix planned: {ETA}
- Re-deployment: {date/time}

Please monitor {metrics} closely.

{Your Name}
```

---

## Release Cadence

**Regular Releases:**
- **Major**: Every 6-12 months
- **Minor**: Every 4-6 weeks
- **Patch**: As needed (weekly if bugs)
- **Hotfix**: Immediate (critical bugs)

**Release Windows:**
- **Preferred**: Tuesday or Wednesday, 10:00 AM - 2:00 PM
- **Avoid**: Friday, weekends, holidays, peak hours

---
