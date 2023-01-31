import { Database } from './database.js';
import { randomUUID } from 'node:crypto';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      if (!search) {
        const tasks = database.select('tasks')

        return res.end(JSON.stringify(tasks))
      }

      const tasks = database.select('tasks', {
        title: search,
        description: search,
      })

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      database.insert('tasks', task)

      return res.writeHead(201).end();
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const taskExists = database.select('tasks', { id })

      if (taskExists) {
        database.delete('tasks', id)
      }

      return res.writeHead(204).end();
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      const [task] = database.select('tasks', { id })

      if(task) {
        database.update('tasks', id, {
          ...task,
          title: title || task.title,
          description: description || task.description,
          updated_at: new Date(),
        })
      }

      return res.writeHead(204).end();
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (task && !task.completed_at) {
        database.update('tasks', id, { ...task, completed_at: new Date() })
      }

      if (task && task.completed_at) {
        database.update('tasks', id, { ...task, completed_at: null })
      }

      return res.writeHead(204).end();
    }
  },
]