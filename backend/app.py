from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers from modules (bike, car, house, etc.)
try:
    from bike.api import router as bike_router
except ImportError:
    bike_router = None

app = FastAPI(
    title="Build Yourself API",
    description="API for building your customs",
    version="0.1.0"
)

# CORS middleware (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers for each module
if bike_router:
    app.include_router(bike_router, prefix="/bike", tags=["Bike"])
# Future: app.include_router(car_router, prefix="/car", tags=["Car"])
# Future: app.include_router(house_router, prefix="/house", tags=["House"])

@app.get("/")
def root():
    return {"message": "Welcome to the Build Yourself API!"}