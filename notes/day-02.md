# Day 02 - NestJS Fundamentals Project Setup & TDD

> In this document, I intent to write about the concepts I have studied as part of this day's learning planner

## Learning Planner

- Task Management API - Start building backend with TDD
- Learn: NestJS architecture (modules controllers services)
- Setup: Create NestJS project with CLI
- Understand: Dependency injection in NestJS
- Learn: Decorators and metadata
- Setup: Vitest for unit testing in NestJS
- Practice: TDD approach - write test first then implementation
- Exercise: Build tasks controller with GET endpoint using TDD
- Exercise: Create TasksService with business logic following TDD
- Practice: Request/response DTOs with validation
- Learn: Exception handling in NestJS
- Exercise: Write unit tests for controller and service

## 1. NestJS Architecture (3 layer)

The main difference between the Express (Most popular Node framework) vs NestJS is it's opinionated nature. Unlike Express, that lets you put everything into a single file NestJS has three-layer split: **modules organize, controllers handle HTTP, service hold logic**.

### Modules (Organizing Unit)

A module is a class decorated **_@Module()_** that groups features that are related. It declares, what's inside controllers and services and what it should export to the other modules. By default, when a new Nest app is created it has **AppModule**, later when each feature is added, then it added **TasksModule**, **AuthModule**, **UsersModule**

**Mental model:** A module is a _boundary_. Everything inside it, shares a DI (Dependancy Injection) scope. To use anything from another module, that particular module should have that item exported and we need to explicitly import the module.

The four keys in module:

```javascript
@Module({
    imports: [], // other modules that are exported that I want to use in this module
    controllers: [], // classes that handle the incoming HTTP requests
    providers: [], // injectable classes (classess, services, repositories)
    exports: [] // providers that I want to make available for others
})
```

### Controllers (the HTTP Layers)

A controller's job is simple, whenever a HTTP request is received just parse the request i.e. read the request body, parameters - query and path and call the respective service, return the response.

Ideally, controllers should be boring and shouldn't have any business logic written inside them.

```javascript
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }
}
```

The decorators do the routing:

- **@Controller('tasks')**, mounts everything under **/tasks**
- **@Get()**, handle the **GET** requests
- **@Post()**, handle the **POST** requests
- **Body()**, extracts the parsed JSON from the request

**_Note:_** The controller doesn't know about Express or Fastify underneath — Nest abstracts the HTTP layer so the same controller works regardless of platform.

### Services (Logic layers)

The services is the place where the business logic lives. They're plain classes marked with **@Injectable** decorator so that Nest can manage their lifecycle. They don't know about the HTTP, as they take the input, apply the validation logic or rules written, return the output.

This is also one of the best things that makes them easier to test, as we don't need to spin up a HTTP server to verify your validation logic.

```javascript
@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  findAll(): Task[] {
    return this.tasks;
  }

  create(dto: CreateTaskDto): Task {
    const task = { id: uuid(), ...dto, status: 'OPEN' };
    this.tasks.push(task);
    return task;
  }
}
```

### Why this split matters (3 layers)

Each layer changes for a different reasons

- Controller changes when the API contract changes (new endpoint, different request method or status code)
- Service changes when the business rules change (new validation, different workflow)
- Modules changes when the reorganization of features (split into sub-modules, new dependencies)

As all of them are separate, change to one rarely hampers others
