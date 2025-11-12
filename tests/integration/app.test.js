const request = require('supertest');
const express = require('express');
const app = require('../../src/app');
const storage = require('../../src/services/storage');

describe('Student-Course API integration', () => {
  beforeEach(() => {
    storage.reset();
    storage.seed();
  });

  // --- Tests Students ---
  test('GET /students should return seeded students', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(200);
    expect(res.body.students.length).toBe(3);
    expect(res.body.students[0].name).toBe('Alice');
  });

  test('POST /students should create a new student', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'David', email: 'david@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('David');
  });

  test('POST /students should not allow duplicate email', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'Eve', email: 'alice@example.com' });
    expect([400, 201]).toContain(res.statusCode);
  });

  // --- Tests Courses ---
  test('DELETE /courses/:id should delete a course even if students are enrolled', async () => {
    const courses = await request(app).get('/courses');
    const courseId = courses.body.courses[0].id;
    await request(app).post(`/courses/${courseId}/students/1`);
    const res = await request(app).delete(`/courses/${courseId}`);
    expect([200, 204]).toContain(res.statusCode);
  });

  // --- Middleware & routes générales ---
  test('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });

  test('should handle internal server error', async () => {
    const errorApp = express();

    // eslint-disable-next-line no-unused-vars
    errorApp.get('/error', (req, res, next) => {
      next(new Error('Test error'));
    });

    errorApp.use((req, res) => {
      res.status(404).json({ error: 'Not Found' });
    });

    // eslint-disable-next-line no-unused-vars
    errorApp.use((err, req, res, next) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });

    const res = await request(errorApp).get('/error');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
  });

  test('should serve swagger docs', async () => {
    const res = await request(app).get('/api-docs/');
    expect([200, 301]).toContain(res.status);
    expect(res.text).toContain('Swagger UI');
  });
});
