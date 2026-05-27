import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './task.interface';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: {
    getAllTasks: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    tasksService = {
      getAllTasks: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: tasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  describe('getAllTasks', () => {
    it('returns the tasks from the service', () => {
      const tasks: Task[] = [
        {
          id: 'abc-123',
          title: 'Write Day 2 notes',
          description: 'Cover modules, DI, decorators',
          status: TaskStatus.OPEN,
        },
      ];
      tasksService.getAllTasks.mockReturnValue(tasks);

      const result = controller.getAllTasks();

      expect(result).toEqual(tasks);
      expect(tasksService.getAllTasks).toHaveBeenCalledTimes(1);
    });
  });
});
