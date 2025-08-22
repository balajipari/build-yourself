# 🚀 Build Yourself

A modern web application for creating and managing custom vehicle projects using AI.

## ✨ **Features**

- 🔐 **Google OAuth Authentication**
- 🚗 **Project Management** (bikes, cars, trucks, boats, aircraft)
- 🤖 **AI-Powered Generation** (OpenAI integration)
- 💾 **Database Storage** with automatic migrations
- 🖼️ **Image Storage** (base64)
- 💬 **Conversation History** for project resumption
- ⭐ **Favorites System**
- 🔍 **Advanced Search & Filtering**

## 🚀 **Quick Start**

**Everything you need is in one place:** [📖 Complete Deployment Guide](docs/DEPLOYMENT_GUIDE.md)

### **TL;DR (5 minutes)**
```bash
# 1. Clone the repo
git clone <your-repo>
cd build-yourself

# 2. Set up environment
cp env.template .env
# Edit .env with your API keys

# 3. Start everything (with auto-build)
docker-compose -f docker-compose.dev.yml up --build -d

# 4. Open http://localhost:5173

**💡 Pro Tip**: Use `--build` flag to automatically rebuild containers when you make code changes!
```

## 🛠️ **Tech Stack**

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python + SQLAlchemy
- **Database**: PostgreSQL
- **Cache**: Redis
- **AI**: OpenAI API
- **Auth**: Google OAuth + JWT
- **Deployment**: Docker + Docker Compose

## 📚 **Documentation**

- **[🚀 Complete Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Everything you need to know
- **[🔧 API Documentation](backend/PROJECT_MANAGEMENT_README.md)** - Backend API details

## 🔑 **Required API Keys**

- **Google OAuth**: For user authentication
- **OpenAI API**: For AI-powered project generation

## 🐳 **Docker Services**

- **PostgreSQL**: Database with auto-migrations
- **Redis**: Session caching
- **Backend**: FastAPI server
- **Frontend**: React development server

## 🆘 **Need Help?**

1. **Check the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** first
2. **Check logs**: `docker-compose -f docker-compose.dev.yml logs`
3. **Verify config**: `docker-compose -f docker-compose.dev.yml config`
4. **Rebuild if needed**: `docker-compose -f docker-compose.dev.yml up --build -d`

## 📝 **License**

[Your License Here]

---

**Ready to build?** Check out the [📖 Complete Deployment Guide](docs/DEPLOYMENT_GUIDE.md)!
