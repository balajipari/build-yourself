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