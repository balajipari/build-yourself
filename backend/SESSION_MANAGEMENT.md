# Redis-Based Session Management

This document explains how Build Yourself API uses Redis for efficient user session management instead of PostgreSQL.

## 🚀 **Why Redis for Sessions?**

### **Performance Benefits:**
- **In-Memory Storage**: Redis stores sessions in RAM, making operations extremely fast
- **TTL Support**: Built-in expiration handling with automatic cleanup
- **High Throughput**: Can handle millions of session operations per second
- **Low Latency**: Sub-millisecond response times for session operations

### **Scalability Benefits:**
- **Horizontal Scaling**: Redis Cluster for distributed session storage
- **Memory Efficiency**: Only stores active sessions, not historical data
- **Load Distribution**: Sessions can be distributed across multiple Redis nodes
- **Real-time Operations**: Perfect for live session management

### **Operational Benefits:**
- **Automatic Cleanup**: Expired sessions are automatically removed
- **Session Tracking**: Monitor active sessions per user
- **Easy Debugging**: Simple key-value structure for troubleshooting
- **Backup & Recovery**: Redis persistence options for data safety

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI       │    │   Redis         │    │   PostgreSQL    │
│   Application   │◄──►│   Sessions      │    │   User Data     │
│                 │    │   & Cache       │    │   & Projects    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow:**
1. **User Login**: Creates session in Redis with TTL
2. **Request Processing**: Validates session from Redis
3. **Session Updates**: Extends TTL on each access
4. **User Logout**: Removes session from Redis
5. **Automatic Cleanup**: Redis removes expired sessions

## 📊 **Session Data Structure**

### **Session Keys:**
```
session:{session_id} = {
    "user_id": "uuid",
    "user_data": {
        "id": "uuid",
        "email": "user@example.com",
        "username": "username",
        "full_name": "Full Name",
        "role": "user"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "last_accessed": "2024-01-01T00:00:00Z"
}
```

### **User Sessions Tracking:**
```
user_sessions:{user_id} = Set of active session IDs
```

### **Key Patterns:**
- **Session Data**: `session:{session_id}`
- **User Sessions**: `user_sessions:{user_id}`
- **TTL**: Automatic expiration (configurable)

## 🔧 **Configuration**

### **Environment Variables:**
```bash
# Redis Connection
REDIS_URL=redis://redis:6379

# Session Configuration
SESSION_TTL=3600                    # Session lifetime in seconds (1 hour)
SESSION_CLEANUP_INTERVAL=300        # Cleanup interval in seconds (5 minutes)
```

### **Redis Configuration:**
```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
```

## 🛠️ **Usage Examples**

### **1. Creating a Session:**
```python
from backend.dependencies import get_session_manager

@app.post("/login")
async def login(login_data: LoginRequest):
    session_manager = get_session_manager()
    
    # Authenticate user (implement your logic)
    user_data = authenticate_user(login_data)
    
    # Create session in Redis
    session_id = session_manager.create_session(
        user_id=user_data["id"],
        user_data=user_data
    )
    
    return {"session_id": session_id, "user_data": user_data}
```

### **2. Protecting Endpoints:**
```python
from backend.dependencies import get_current_user

@app.get("/protected")
async def protected_endpoint(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hello {current_user['username']}!"}
```

### **3. Optional Authentication:**
```python
from backend.dependencies import get_optional_user

@app.get("/public")
async def public_endpoint(current_user: Optional[dict] = Depends(get_optional_user)):
    if current_user:
        return {"message": f"Welcome back, {current_user['username']}!"}
    return {"message": "Welcome, guest!"}
```

### **4. Session Management:**
```python
@app.get("/sessions/active")
async def get_active_sessions(current_user: dict = Depends(get_current_user)):
    session_manager = get_session_manager()
    active_sessions = session_manager.get_user_active_sessions(current_user["id"])
    return {"active_sessions": active_sessions}
```

## 🔒 **Security Features**

### **Session Security:**
- **UUID Generation**: Cryptographically secure session IDs
- **TTL Enforcement**: Automatic session expiration
- **User Isolation**: Sessions are isolated per user
- **Access Control**: Session validation on each request

### **Redis Security:**
- **Network Isolation**: Redis runs in Docker network
- **No External Access**: Redis only accessible from backend
- **Memory Limits**: Configurable memory limits
- **LRU Eviction**: Automatic cleanup of old data

## 📈 **Performance Monitoring**

### **Health Checks:**
```bash
# Basic health check
GET /health

# Detailed health check
GET /health/detailed

# Session-specific health
GET /auth/health/sessions
```

### **Session Statistics:**
```python
# Get session stats
stats = session_manager.get_session_stats()
# Returns: {"total_sessions": 150, "total_users": 45, "session_ttl_seconds": 3600}
```

### **Redis Monitoring:**
```bash
# Connect to Redis container
docker exec -it build_yourself_redis redis-cli

# Monitor Redis operations
MONITOR

# Get Redis info
INFO

# Check memory usage
INFO memory
```

## 🚨 **Error Handling**

### **Common Scenarios:**
1. **Redis Connection Failed**: Returns 503 Service Unavailable
2. **Session Expired**: Returns 401 Unauthorized
3. **Invalid Session**: Returns 401 Unauthorized
4. **Redis Memory Full**: Automatic cleanup and LRU eviction

### **Fallback Strategies:**
- **Graceful Degradation**: API continues working without sessions
- **Automatic Retry**: Connection retry logic
- **Health Monitoring**: Continuous health checks
- **Alerting**: Monitor Redis health status

## 🔄 **Migration from PostgreSQL**

### **Benefits of Migration:**
- **Performance**: 10-100x faster session operations
- **Scalability**: Better horizontal scaling
- **Memory Efficiency**: Only active sessions in memory
- **Operational**: Simpler backup and maintenance

### **Migration Steps:**
1. **Deploy Redis**: Add Redis to Docker Compose
2. **Update Code**: Use new session manager
3. **Test**: Verify session functionality
4. **Monitor**: Watch performance improvements
5. **Cleanup**: Remove old session tables

## 📚 **Best Practices**

### **Session Design:**
- **Minimal Data**: Store only essential user information
- **TTL Strategy**: Balance security vs user experience
- **Cleanup**: Regular cleanup of expired sessions
- **Monitoring**: Track session metrics and performance

### **Redis Configuration:**
- **Memory Limits**: Set appropriate memory limits
- **Persistence**: Enable AOF for data durability
- **Backup**: Regular Redis data backups
- **Monitoring**: Use Redis monitoring tools

### **Error Handling:**
- **Graceful Fallbacks**: Handle Redis failures gracefully
- **Retry Logic**: Implement connection retry mechanisms
- **Health Checks**: Regular Redis health monitoring
- **Alerting**: Set up alerts for Redis issues

## 🧪 **Testing**

### **Unit Tests:**
```python
def test_session_creation():
    session_manager = RedisSessionManager(mock_redis_client)
    session_id = session_manager.create_session("user123", {"name": "Test"})
    assert session_id is not None
    assert session_manager.get_session(session_id) is not None
```

### **Integration Tests:**
```python
def test_login_creates_session():
    response = client.post("/auth/login", json={"email": "test@example.com", "password": "password"})
    assert response.status_code == 200
    assert "session_id" in response.json()
```

### **Load Tests:**
```python
def test_session_performance():
    # Test creating 1000 sessions
    start_time = time.time()
    for i in range(1000):
        session_manager.create_session(f"user{i}", {"name": f"User{i}"})
    end_time = time.time()
    assert (end_time - start_time) < 1.0  # Should complete in under 1 second
```

## 🔮 **Future Enhancements**

### **Planned Features:**
- **Session Analytics**: Track user behavior patterns
- **Multi-Device Support**: Manage sessions across devices
- **Session Sharing**: Temporary session sharing capabilities
- **Advanced TTL**: Dynamic TTL based on user activity

### **Scalability Improvements:**
- **Redis Cluster**: Distributed session storage
- **Session Replication**: Cross-region session availability
- **Load Balancing**: Intelligent session distribution
- **Caching Layers**: Multi-level caching strategies

This Redis-based session management system provides a robust, scalable, and performant solution for user authentication while maintaining security and operational simplicity.
