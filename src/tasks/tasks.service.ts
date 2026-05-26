import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Task, TaskStatus } from './task.interface';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  createTask(dto: { title: string; description: string }): Task {
    const task: Task = {
      id: randomUUID(),
      title: dto.title,
      description: dto.description,
      status: TaskStatus.OPEN,
    };
    this.tasks.push(task);
    return task;
  }
}
