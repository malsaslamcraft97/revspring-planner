import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task.interface';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('getAllTasks', () => {
    it('returns an empty array initially', () => {
      expect(service.getAllTasks()).toEqual([]);
    });
  });

  describe('createTask', () => {
    it('creates a task and returns it', () => {
      const dto = {
        title: 'Write Day 2 notes',
        description: 'Cover modules, DI, and decorators',
      };

      const result = service.createTask(dto);

      expect(result).toEqual({
        id: expect.any(String),
        title: dto.title,
        description: dto.description,
        status: TaskStatus.OPEN,
      });
    });

    it('persists the created task so getAllTasks returns it', () => {
      const dto = {
        title: 'Write Day 2 notes',
        description: 'Cover modules, DI, and decorators',
      };

      const created = service.createTask(dto);

      expect(service.getAllTasks()).toEqual([created]);
    });
  });

  describe('getTaskById', () => {
    it('returns the task with the matching id', () => {
      const created = service.createTask({
        title: 'Write Day 2 notes',
        description: 'Cover modules, DI, and decorators',
      });

      const result = service.getTaskById(created.id);

      expect(result).toEqual(created);
    });

    it('throws NotFoundException when no task matches the id', () => {
      expect(() => service.getTaskById('non-existent-id')).toThrow(
        NotFoundException,
      );
    });
  });
});
