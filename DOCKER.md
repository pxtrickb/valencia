# Docker Setup

This document explains how to build and run the Valencia Next.js application using Docker.

## Prerequisites

- Docker installed and running
- Docker Compose (optional, but recommended)

## Quick Start

### Using Docker Compose (Recommended)

1. Create a `.env` file in the project root with required environment variables:
```env
DB_FILE_NAME=./src/db/local.db
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

2. Build and run the container:
```bash
docker-compose up -d
```

3. The application will be available at `http://localhost:3000`

### Using Docker directly

1. Build the image:
```bash
docker build -t valencia:latest .
```

2. Create necessary directories:
```bash
mkdir -p data usercontent/images
```

3. Run the container:
```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/usercontent:/app/usercontent \
  -e DB_FILE_NAME=/app/data/local.db \
  -e BETTER_AUTH_SECRET=your-secret-key-here \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  --name valencia \
  valencia:latest
```

## Database Initialization

If this is the first time running the application, you may need to initialize the database:

1. Access the container:
```bash
docker exec -it valencia sh
```

2. Run database migrations (if needed):
```bash
npm run db:push
```

3. Seed the database (optional):
```bash
npm run db:seed
```

Alternatively, you can run these commands directly:
```bash
docker exec -it valencia npm run db:push
docker exec -it valencia npm run db:seed
```

## Persistent Data

The following directories are mounted as volumes to persist data:

- `./data` - SQLite database files
- `./usercontent` - User-uploaded images

## Environment Variables

Required environment variables:

- `DB_FILE_NAME` - Path to the SQLite database file (should be `/app/data/local.db` in Docker)
- `BETTER_AUTH_SECRET` - Secret key for authentication (generate a random string)
- `BETTER_AUTH_URL` - Base URL of your application

Optional environment variables:

- `NODE_ENV` - Set to `production` for production builds
- `PORT` - Port to run the server on (default: 3000)

## Stopping the Container

```bash
# Using Docker Compose
docker-compose down

# Using Docker directly
docker stop valencia
docker rm valencia
```

## Viewing Logs

```bash
# Using Docker Compose
docker-compose logs -f

# Using Docker directly
docker logs -f valencia
```

## Rebuilding the Image

After making changes to the code:

```bash
# Using Docker Compose
docker-compose build --no-cache

# Using Docker directly
docker build --no-cache -t valencia:latest .
```

## Troubleshooting

### Database file not found

Ensure the `data` directory exists and has proper permissions:
```bash
mkdir -p data
chmod 755 data
```

### Permission errors

If you encounter permission errors with mounted volumes, you may need to adjust permissions:
```bash
sudo chown -R $USER:$USER data usercontent
```

### Port already in use

If port 3000 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3001 to any available port
```

