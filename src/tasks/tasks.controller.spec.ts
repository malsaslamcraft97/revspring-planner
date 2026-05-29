import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './task.interface';
import { NotFoundException } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: {
    getAllTasks: ReturnType<typeof vi.fn>;
    getTaskById: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    tasksService = {
      getAllTasks: vi.fn(),
      getTaskById: vi.fn(),
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

  describe('getTaskById', () => {
    it('returns the task from the service', () => {
      const task: Task = {
        id: 'abc-123',
        title: 'Write Day 2 notes',
        description: 'Cover modules, DI, decorators',
        status: TaskStatus.OPEN,
      };
      tasksService.getTaskById.mockReturnValue(task);

      const result = controller.getTaskById('abc-123');

      expect(result).toEqual(task);
      expect(tasksService.getTaskById).toHaveBeenCalledWith('abc-123');
    });

    it('propagates NotFoundException thrown by the service', () => {
      tasksService.getTaskById.mockImplementation(() => {
        throw new NotFoundException('Task with id "missing" not found');
      });

      expect(() => controller.getTaskById('missing')).toThrow(
        NotFoundException,
      );
    });
  });
});
