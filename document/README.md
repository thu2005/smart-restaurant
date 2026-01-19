# Documentation - Smart Restaurant QR Ordering System

Welcome to the comprehensive documentation for the Smart Restaurant QR Ordering System.

## 📚 Documentation Structure

This documentation is organized into the following sections:

### 📖 [SETUP.md](../docs/04-dev/SETUP.md)
**Complete setup and installation guide**
- Prerequisites and requirements
- Backend environment configuration
- Frontend environment configuration
- Supabase database setup
- Database schema push and migrations
- Seed data initialization
- Running the application (dev & production)
- Troubleshooting common issues

**👉 Start here if you're setting up the project for the first time!**

---

### 🔌 [APIs.md](../docs/02-api/APIs.md)
**Comprehensive API documentation**
- Base URL and authentication
- All API endpoints organized by feature:
  - Authentication (register, login, OAuth, password reset)
  - User Management
  - Restaurant Management
  - Table Management
  - Menu Management (categories, items, modifiers)
  - Cart Management
  - Order Management
  - Kitchen Management
  - Payment Management
  - Reports & Analytics
  - Review Management
- Request/response examples for each endpoint
- Error handling
- Notes for extending the API

**👉 Use this for API integration and endpoint reference!**

---

### 🗄️ [DATABASE.md](../docs/03-architecture/DATABASE_STRUCTURE.md) | [ER_DIAGRAM.md](../docs/03-architecture/ER_DIAGRAM.md) | [DATABASE_IMPORT_GUIDE.md](../docs/03-architecture/DATABASE_IMPORT_GUIDE.md)
**Database schema and design documentation**
- Entity Relationship Diagram (ERD)
- Complete database schema
- Detailed table descriptions
- Column specifications and constraints
- Relationships (One-to-Many, One-to-One, Many-to-Many)
- Indexes and performance optimization
- Enum types
- Database migration guidelines

**👉 Reference this for database structure and relationships!**

---

### 🏗️ [ARCHITECTURE.md](../docs/03-architecture/ARCHITECTURE.md)
**System architecture overview**
- High-level architecture diagram
- Technology stack (Frontend, Backend, Database)
- Frontend architecture (React, Redux, routing)
- Backend architecture (Express, layers, middleware)
- Database architecture (Prisma ORM, multi-tenancy)
- Authentication & authorization flow
- Order processing flow (with sequence diagrams)
- Real-time communication (Socket.IO)
- Deployment architecture
- Security considerations
- Scalability considerations

**👉 Read this for understanding the overall system design!**

---
### 🏗️ [DEPLOYMENT_GUIDE.md](../docs/05-infra/DEPLOYMENT_GUIDE.md)
- Overview of cloud-native/serverless deployment
- Production architecture diagram and explanation
- Backend deployment on Render (auto deploy, migrations, health checks)
- Frontend deployment on Vercel (auto deploy, build, CDN)
- Database setup and management with Supabase
- Environment variable configuration for all services
- CI/CD pipeline details (GitHub triggers, auto deploy)
- Post-deployment verification steps
- Monitoring and logging (Prometheus, Grafana Metrics)
- Troubleshooting common deployment issues
---
## 🎯 Quick Navigation

### For Developers
1. **First time setup?** → Start with [SETUP.md](../docs/04-dev/SETUP.md)
2. **Integrating with API?** → Go to [API.md](../docs/02-api/APIs.md)
3. **Database queries?** → Check [DATABASE.md](../docs/03-architecture/DATABASE_STRUCTURE.md)
4. **Understanding architecture?** → Read [ARCHITECTURE.md](../docs/03-architecture/ARCHITECTURE.md)

### For Project Managers
- System overview: [ARCHITECTURE.md](../docs/03-architecture/ARCHITECTURE.md)
- Feature capabilities: [API.md](../docs/02-api/APIs.md)
- Data model: [DATABASE.md](../docs/03-architecture/DATABASE_STRUCTURE.md)

### For DevOps/Deployment
- Setup guide: [SETUP.md](../docs/04-dev/SETUP.md)
- Architecture: [ARCHITECTURE.md](../docs/03-architecture/ARCHITECTURE.md) (see Deployment section)

---

## 📝 Important Notes

### User Guide
**Note**: User guide documentation has been intentionally omitted as the project is still under active development and features may change. User-facing documentation will be created once the application stabilizes.

### API Documentation Maintenance
The [API.md](../docs/02-api/APIs.md) file is structured for easy extension. When adding new endpoints:
- Follow the existing template format
- Include request/response examples
- Document authentication requirements
- Add to the appropriate section

### Database Changes
When modifying the database schema:
1. Update `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Update [DATABASE.md](../docs/03-architecture/DATABASE_STRUCTURE.md) accordingly
4. Update ERD diagram if relationships change

---

## 🔗 Related Resources

- **Live API Documentation**: `http://localhost:5000/api-docs` (Swagger UI)
- **Prisma Studio**: `npx prisma studio` (Visual database browser)
- **Backend README**: `../backend/README.md`
- **Frontend README**: `../frontend/README.md`

---

## 🤝 Contributing to Documentation

When contributing to this documentation:
- Keep explanations clear and concise
- Include code examples where helpful
- Use diagrams (Mermaid) for complex flows
- Maintain consistent formatting
- Update the relevant sections when features change

---

## 📧 Support

For questions or issues:
- Check the troubleshooting section in [SETUP.md](../docs/04-dev/SETUP.md)
- Review the relevant documentation section
- Check existing issues in the project repository
