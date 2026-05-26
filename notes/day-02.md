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

## Dependency Injection

DI is the part that takes longest to internalize or understand because it looks like a magic. The trick is simpler:

- Classes declare what they need, instead of constructing it
- Container provided the instances required by the classes, by looking them up in a Map.

### Without DI

```javascript
class TasksController {
  private service = new TasksService();
}
```

It looks innocent, but problems showup later:

- How to test the controller without the real service?
- How to swap the in-memory service with database-backed one, in case we are using a DB.

Here, the issue is the controller being tighly-coupled to a specfic service or implementation

### DI way

```javascript
class TasksController {
  constructor(private readonly service: TasksService)
}
```

Here, The controller no longer constructs the service — it declares _"I need a TasksService"_ via its constructor signature. Something else is responsible for handing one in. That something is Nest's **DI container**.

### How the container actually works

At its core, the container is a **Map<token, instance>**. When Nest starts, it looks up your module graph, sees every class in providers, and registers it:

```javascript
container = {
  TasksService     → <TasksService instance>,
  LoggerService    → <LoggerService instance>,
  TasksController  → <TasksController instance>,
}
```

When it needs to construct TasksController, it reads the constructor parameter types, sees it needs a TasksService, looks up that key in the map, and passes the instance to new TasksController(...). Every dependency is resolved by token lookup.

### How Nest knows the constructor needs a particular service?

This is where decorators and TypeScript cooperate. With _emitDecoratorMetadata: true_ in your tsconfig.json, TypeScript writes constructor parameter types into a hidden metadata table on the class at compile time. Nest reads that table at runtime using the **reflect-metadata** library:

```javascript
Reflect.getMetadata('design:paramtypes', TasksController);
// → [class TasksService]
```

That's the entire mechanism. The decorator (**@Injectable()**, **@Controller()**) is the trigger that tells TypeScript _"this class participates in DI, write its types down."_ Without **emitDecoratorMetadata**, that table is empty, and Nest has no idea what to inject. This is exactly why we needed **SWC** over **esbuild** in your **Vitest** setup — esbuild doesn't emit this metadata correctly, which would silently break every test that relies on DI.
