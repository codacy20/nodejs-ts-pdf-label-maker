# PDF Label Maker

A TypeScript-based Node.js application for generating shipping label PDFs using templates.

## Features

- RESTful API endpoint for label generation
- Multi-language support (English and Dutch)
- PDF generation using Puppeteer
- Template-based HTML rendering 
- Docker support for easy deployment
- Comprehensive monitoring and health checks
- Dependency injection using InversifyJS
- TypeScript for type safety

## Architecture

The application follows a clean architecture approach with:

- **Dependency Injection**: Using InversifyJS for loose coupling and better testability
- **Service-oriented design**: Clear separation of concerns with dedicated services
- **Controller-Service pattern**: Controllers handle HTTP requests, services contain business logic
- **Repository pattern**: For data access abstraction (when applicable)
- **Middleware approach**: For cross-cutting concerns like logging and error handling

## Prerequisites

- Node.js 20 or higher
- pnpm package manager

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd nodejs-ts-pdf-label-maker/functions
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```

## Development

To start the development server:

```bash
pnpm run dev
```

To build and start the application:

```bash
pnpm run build
pnpm start
```

The server will start on port 3000 by default, or the port specified in the PORT environment variable.

## API Endpoints

- **Generate Label**
  - `POST /get-label` - Generate a shipping label PDF
    ```json
    {
      "return_address": {
        "company": "Example Company",
        "address": "123 Example Street",
        "zip_code": "12345",
        "city": "Example City",
        "country": "Example Country"
      },
      "order": "ORDER123",
      "name": "John Doe",
      "language": "en"
    }
    ```

- **Health Checks**
  - `GET /health` - Get application health status and metrics
  - `GET /health/liveness` - Kubernetes liveness probe endpoint
  - `GET /health/readiness` - Kubernetes readiness probe endpoint

## Postman Collection

The project includes a Postman collection for easy API testing. You can find it at the root of the project:

```
postman-collection.json
```

Import this file into Postman to test all API endpoints with pre-configured requests.

## Docker Support

The project includes Docker and docker-compose support for containerization. 

To build and run using docker-compose:

```bash
docker-compose up --build
```

Or to build and run manually:

```bash
docker build -t pdf-label-maker .
docker run -p 3000:3000 -v $(pwd)/../assets:/app/assets pdf-label-maker
```

## Project Structure

```
src/
├── config/             # Application configuration
├── constants/          # Constants and symbols
├── health/             # Health check endpoints
├── pdf/                # PDF generation logic
├── shipping-label/     # Label generation service and controller
└── utils/              # Utility functions and services
assets/                 # Templates and static assets
```

## Future Improvements

- **Input/Output Validation**: Add schema validation using Zod to ensure data integrity
- **Testing**: Implement comprehensive unit, integration, and e2e tests, leveraging dependency injection for easier mocking
  - Currently, only ShippingLabelService has tests implemented
  - Need to add tests for all controllers, services, and utilities
  - Aim for high test coverage across all components
- **API Documentation**: Add Swagger/OpenAPI documentation
- **Caching**: Implement caching mechanism for frequently used data
- **Internationalization**: Expand language support beyond English and Dutch
