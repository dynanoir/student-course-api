const coursesController = require('../../src/controllers/coursesController');
const storage = require('../../src/services/storage');

jest.mock('../../src/services/storage');

describe('coursesController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // -------------------------------
  // listCourses
  // -------------------------------
  test('listCourses should return paginated courses', () => {
    storage.list.mockReturnValue([
      { id: 1, title: 'Math', teacher: 'John' },
      { id: 2, title: 'Physics', teacher: 'Jane' },
      { id: 3, title: 'History', teacher: 'Paul' },
    ]);

    req.query = { page: 1, limit: 2 };
    coursesController.listCourses(req, res);
    expect(res.json).toHaveBeenCalledWith({
      courses: [
        { id: 1, title: 'Math', teacher: 'John' },
        { id: 2, title: 'Physics', teacher: 'Jane' },
      ],
      total: 3,
    });
  });

  test('listCourses should filter by title and teacher', () => {
    storage.list.mockReturnValue([
      { id: 1, title: 'Math', teacher: 'John' },
      { id: 2, title: 'Physics', teacher: 'Jane' },
    ]);
    req.query = { title: 'Math', teacher: 'John' };
    coursesController.listCourses(req, res);
    expect(res.json).toHaveBeenCalledWith({
      courses: [{ id: 1, title: 'Math', teacher: 'John' }],
      total: 1,
    });
  });

  // -------------------------------
  // getCourse
  // -------------------------------
  test('getCourse should return course and students', () => {
    req.params.id = '1';
    storage.get.mockReturnValue({ id: 1, title: 'Math' });
    storage.getCourseStudents.mockReturnValue([{ id: 1, name: 'Alice' }]);

    coursesController.getCourse(req, res);
    expect(res.json).toHaveBeenCalledWith({
      course: { id: 1, title: 'Math' },
      students: [{ id: 1, name: 'Alice' }],
    });
  });

  test('getCourse should return 404 if not found', () => {
    req.params.id = '99';
    storage.get.mockReturnValue(undefined);

    coursesController.getCourse(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Course not found' });
  });

  // -------------------------------
  // createCourse
  // -------------------------------
  test('createCourse should return 400 if fields missing', () => {
    req.body = { title: '' };
    coursesController.createCourse(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'title and teacher required',
    });
  });

  test('createCourse should create a course', () => {
    req.body = { title: 'New Course', teacher: 'Prof X' };
    const mockCreated = { id: 1, title: 'New Course', teacher: 'Prof X' };
    storage.create.mockReturnValue(mockCreated);

    coursesController.createCourse(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockCreated);
  });

  // -------------------------------
  // deleteCourse
  // -------------------------------
  test('deleteCourse should return 204 on success', () => {
    req.params.id = '1';
    storage.remove.mockReturnValue(true);
    coursesController.deleteCourse(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test('deleteCourse should return 404 if not found', () => {
    req.params.id = '1';
    storage.remove.mockReturnValue(false);
    coursesController.deleteCourse(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Course not found' });
  });

  test('deleteCourse should return 400 if remove returns error', () => {
    req.params.id = '1';
    storage.remove.mockReturnValue({ error: 'linked students exist' });
    coursesController.deleteCourse(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'linked students exist' });
  });

  // -------------------------------
  // updateCourse
  // -------------------------------
  test('updateCourse should return 404 if course not found', () => {
    req.params.id = '5';
    storage.get.mockReturnValue(undefined);
    coursesController.updateCourse(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Course not found' });
  });

  test('updateCourse should return 400 if title already exists', () => {
    req.params.id = '1';
    const course = { id: 1, title: 'Old' };
    storage.get.mockReturnValue(course);
    storage.list.mockReturnValue([
      { id: 1, title: 'Old' },
      { id: 2, title: 'NewTitle' },
    ]);
    req.body = { title: 'NewTitle' };

    coursesController.updateCourse(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Course title must be unique',
    });
  });

  test('updateCourse should modify title and teacher', () => {
    req.params.id = '1';
    const course = { id: 1, title: 'Old', teacher: 'A' };
    storage.get.mockReturnValue(course);
    storage.list.mockReturnValue([course]);
    req.body = { title: 'New', teacher: 'B' };

    coursesController.updateCourse(req, res);
    expect(course.title).toBe('New');
    expect(course.teacher).toBe('B');
    expect(res.json).toHaveBeenCalledWith(course);
  });
});
