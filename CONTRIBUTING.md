# Contributing to Lila Game Backend

Thank you for considering contributing to the Lila Game Backend project! This document provides guidelines and instructions for contributing.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- MongoDB 7.x
- Git
- Your favorite code editor (VS Code recommended)

### Setup Development Environment

1. **Fork and clone the repository:**
```bash
git clone https://github.com/yourusername/lila-game-project.git
cd lila-game-project
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**
```bash
cp .env.example .env
# Edit .env with your local configuration
```

4. **Start MongoDB:**
```bash
# Using Docker
docker-compose up -d mongodb

# Or local installation
mongod
```

5. **Run the development server:**
```bash
npm run start:dev
```

## Development Workflow

### Branch Naming Convention
- `feature/` - New features (e.g., `feature/add-tournament-mode`)
- `bugfix/` - Bug fixes (e.g., `bugfix/fix-move-validation`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-game-service`)
- `docs/` - Documentation updates (e.g., `docs/update-api-docs`)
- `test/` - Test additions/updates (e.g., `test/add-games-integration-tests`)

### Development Process

1. **Create a new branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes:**
- Write clean, readable code
- Follow the coding standards
- Add tests for new functionality
- Update documentation as needed

3. **Run tests:**
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

4. **Lint your code:**
```bash
npm run lint
npm run format
```

5. **Commit your changes:**
```bash
git add .
git commit -m "feat: add tournament mode functionality"
```

6. **Push and create PR:**
```bash
git push origin feature/your-feature-name
```

## Coding Standards

### TypeScript Guidelines

- **Use TypeScript strictly** - avoid `any` types when possible
- **Interfaces over types** for object shapes
- **Explicit return types** for functions
- **Use enums** for fixed sets of values

**Good:**
```typescript
interface CreateGameDto {
  timeControlMinutes: number;
  timeIncrementSeconds: number;
}

async function createGame(dto: CreateGameDto): Promise<GameDocument> {
  // implementation
}
```

**Bad:**
```typescript
function createGame(dto: any): any {
  // implementation
}
```

### NestJS Best Practices

- **Use dependency injection** - inject services through constructor
- **Follow module structure** - one feature per module
- **Use DTOs** for request/response validation
- **Implement guards** for authentication/authorization
- **Use interceptors** for cross-cutting concerns

### File Organization

```
src/
├── module-name/
│   ├── module-name.module.ts
│   ├── module-name.controller.ts
│   ├── module-name.service.ts
│   ├── module-name.service.spec.ts
│   └── dto/
│       ├── create-module.dto.ts
│       └── update-module.dto.ts
```

### Naming Conventions

- **Files:** kebab-case (e.g., `game-service.ts`)
- **Classes:** PascalCase (e.g., `GamesService`)
- **Functions/Variables:** camelCase (e.g., `createGame`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `DEFAULT_RATING`)
- **Interfaces:** PascalCase with 'I' prefix optional (e.g., `User` or `IUser`)

## Testing Guidelines

### Unit Tests

Write unit tests for all services and utilities:

```typescript
describe('GamesService', () => {
  let service: GamesService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamesService, /* mocks */],
    }).compile();
    
    service = module.get<GamesService>(GamesService);
  });
  
  it('should create a game', async () => {
    const dto = { /* test data */ };
    const result = await service.createGame(dto, 'userId');
    expect(result).toBeDefined();
  });
});
```

### Integration Tests

Write E2E tests for API endpoints:

```typescript
describe('Games (e2e)', () => {
  it('/games (POST)', () => {
    return request(app.getHttpServer())
      .post('/games')
      .set('Authorization', `Bearer ${token}`)
      .send({ timeControlMinutes: 10 })
      .expect(201);
  });
});
```

### Test Coverage

- Aim for **80%+ code coverage**
- Cover edge cases and error scenarios
- Test both success and failure paths

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(games): add tournament mode support

- Add tournament schema and DTOs
- Implement tournament creation and joining
- Add tournament brackets generation

Closes #123

fix(auth): resolve JWT token expiration issue

The JWT tokens were expiring too quickly due to incorrect
time unit conversion in the configuration.

Fixes #456

docs(api): update Swagger documentation for games endpoints

test(users): add integration tests for user registration
```

## Pull Request Process

### Before Creating a PR

1. ✅ All tests pass (`npm test`)
2. ✅ Code is linted (`npm run lint`)
3. ✅ Code is formatted (`npm run format`)
4. ✅ No TypeScript errors (`npm run build`)
5. ✅ Documentation updated (if needed)
6. ✅ Commits follow conventional commits

### PR Title Format

Follow the same format as commit messages:
```
feat(games): add tournament mode
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally

## Related Issues
Closes #(issue number)
```

### Review Process

1. **Automated checks** must pass (tests, linting)
2. **Code review** by at least one maintainer
3. **Address feedback** and update PR
4. **Approval** from maintainer
5. **Merge** using squash and merge

## Development Tips

### Running Specific Tests
```bash
# Run specific test file
npm test -- games.service.spec.ts

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Debugging
```bash
# Debug mode with Chrome DevTools
npm run start:debug

# Then open chrome://inspect in Chrome
```

### Database Management
```bash
# Reset database
docker-compose down -v
docker-compose up -d mongodb

# View database with Mongo Express
docker-compose up -d mongo-express
# Open http://localhost:8081
```

### Viewing API Documentation
```bash
npm run start:dev
# Open http://localhost:3000/api
```

## Project Structure

```
lila-game-project/
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── games/             # Game management
│   ├── gateway/           # WebSocket gateway
│   ├── schemas/           # MongoDB schemas
│   ├── dto/               # Data transfer objects
│   ├── guards/            # Auth guards
│   ├── config/            # Configuration
│   └── main.ts            # Application entry point
├── test/                  # E2E tests
├── docker-compose.yml     # Docker configuration
├── Dockerfile             # Docker image
└── README.md              # Main documentation
```

## Need Help?

- 📖 Read the [README.md](README.md)
- 🚀 Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides
- 📝 Review existing code and tests
- 💬 Ask questions in issues/discussions
- 📧 Contact maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing! 🎉