from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Global configuration
CORS_ORIGINS = ["*"]
API_TITLE = "Build Yourself API"
API_DESCRIPTION = "API for building your customs"
API_VERSION = "0.1.0"

def _create_app():
    """Create and configure FastAPI application"""
    app = FastAPI(
        title=API_TITLE,
        description=API_DESCRIPTION,
        version=API_VERSION
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    return app

def _register_routers(app: FastAPI):
    """Register API routers"""
    try:
        from bike.api import router as bike_router
        app.include_router(bike_router, prefix="/bike", tags=["Bike"])
    except ImportError:
        pass
    
    try:
        from auth.api import router as auth_router
        app.include_router(auth_router,  prefix="/auth", tags=["Authentication"])
    except ImportError:
        pass

app = _create_app()
_register_routers(app)

@app.get("/")
def root():
    return {"message": "Welcome to the Build Yourself API!"}

@app.get("/health")
def health_check():
    """Health check endpoint for Docker and load balancers"""
    return {
        "status": "healthy",
        "service": "Build Yourself API",
        "version": API_VERSION,
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check for all services"""
    try:
        from .dependencies import check_database_health, check_redis_health, check_session_manager_health
        
        health_status = {
            "status": "healthy",
            "service": "Build Yourself API",
            "version": API_VERSION,
            "timestamp": "2024-01-01T00:00:00Z",
            "services": {}
        }
        
        # Check database health
        try:
            health_status["services"]["database"] = check_database_health()
        except Exception as e:
            health_status["services"]["database"] = {"status": "unhealthy", "error": str(e)}
            health_status["status"] = "degraded"
        
        # Check Redis health
        try:
            health_status["services"]["redis"] = check_redis_health()
        except Exception as e:
            health_status["services"]["redis"] = {"status": "unhealthy", "error": str(e)}
            health_status["status"] = "degraded"
        
        # Check session manager health
        try:
            health_status["services"]["session_manager"] = check_session_manager_health()
        except Exception as e:
            health_status["services"]["session_manager"] = {"status": "unhealthy", "error": str(e)}
            health_status["status"] = "degraded"
        
        return health_status
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "Build Yourself API",
            "version": API_VERSION,
            "timestamp": "2024-01-01T00:00:00Z",
            "error": f"Health check failed: {str(e)}"
        }