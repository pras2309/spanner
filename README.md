# Spanner CRM

Internal ABM Platform for managing segments, companies, and contacts.

## Prerequisites

- **Python 3.12+**
- **Node.js 18+**
- **Docker & Docker Compose** (optional, for containerized deployment)

## Setup Instructions

### 1. Backend Setup

#### macOS (Homebrew)
```bash
# Install Python 3.12 if not already installed
brew install python@3.12

# Create and activate virtual environment
cd backend
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env  # Update DATABASE_URL and SECRET_KEY
```

#### Ubuntu
```bash
# Install Python 3.12
sudo apt update
sudo apt install python3.12 python3.12-venv python3-pip

# Create and activate virtual environment
cd backend
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env  # Update DATABASE_URL and SECRET_KEY
```

#### Database Initialization
```bash
# Seed the database with mock data
PYTHONPATH=. python3 -m app.seed
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Development Mode

1. **Start Backend:**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### Using Docker Compose

```bash
docker-compose up --build
```

The application will be available at `http://localhost`.

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL/SQLite, APScheduler
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **DevOps:** Docker, Nginx
