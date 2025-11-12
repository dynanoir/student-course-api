const studentsController = require('../../src/controllers/studentsController');
const storage = require('../../src/services/storage');

jest.mock('../../src/services/storage');

describe('studentsController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // -------------------------------
  // listStudents
  // -------------------------------
  test('listStudents should return all students', () => {
    const mockStudents = [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ];
    storage.list.mockReturnValue(mockStudents);

    studentsController.listStudents(req, res);

    expect(res.json).toHaveBeenCalledWith({
      students: mockStudents,
      total: mockStudents.length,
    });
  });

  // -------------------------------
  // getStudent
  // -------------------------------
  test('getStudent should return student with courses or 404 if not found', () => {
    const mockStudent = { id: 1, name: 'Alice', email: 'alice@example.com' };
    const mockCourses = [{ id: 10, title: 'Math' }];
    storage.get.mockReturnValue(mockStudent);
    storage.getStudentCourses.mockReturnValue(mockCourses);

    studentsController.getStudent(req, res);
    expect(res.json).toHaveBeenCalledWith({
      student: mockStudent,
      courses: mockCourses,
    });

    // Cas 404
    storage.get.mockReturnValue(undefined);
    studentsController.getStudent(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Student not found' });
  });

  // -------------------------------
  // createStudent
  // -------------------------------
  test('createStudent should validate, prevent duplicates, or create student', () => {
    // Validation
    req.body = { name: '', email: '' };
    studentsController.createStudent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'name and email required' });

    // Duplicate email
    storage.list.mockReturnValue([{ id: 1, email: 'dup@example.com' }]);
    req.body = { name: 'Bob', email: 'dup@example.com' };
    studentsController.createStudent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email already exists' });

    // Successful creation
    storage.list.mockReturnValue([]);
    const mockCreated = { id: 2, name: 'Bob', email: 'bob@example.com' };
    storage.create.mockReturnValue(mockCreated);
    req.body = { name: 'Bob', email: 'bob@example.com' };
    studentsController.createStudent(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockCreated);
  });

  // -------------------------------
  // updateStudent
  // -------------------------------
  test('updateStudent should update fields, handle duplicates or 404', () => {
    const mockStudent = { id: 1, name: 'Old', email: 'old@example.com' };
    storage.get.mockReturnValue(mockStudent);
    storage.list.mockReturnValue([mockStudent]);

    // Successful update
    req.params.id = '1';
    req.body = { name: 'New', email: 'new@example.com' };
    studentsController.updateStudent(req, res);
    expect(mockStudent.name).toBe('New');
    expect(mockStudent.email).toBe('new@example.com');
    expect(res.json).toHaveBeenCalledWith(mockStudent);

    // Duplicate email
    storage.list.mockReturnValue([
      { id: 2, email: 'dup@example.com' },
      mockStudent,
    ]);
    req.body = { email: 'dup@example.com' };
    studentsController.updateStudent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email already exists' });

    // Student not found
    storage.get.mockReturnValue(undefined);
    studentsController.updateStudent(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Student not found' });
  });

  // -------------------------------
  // deleteStudent
  // -------------------------------
  test('deleteStudent should delete or return 404', () => {
    storage.remove.mockReturnValue(true);
    req.params.id = '1';
    studentsController.deleteStudent(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();

    storage.remove.mockReturnValue(false);
    studentsController.deleteStudent(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Student not found' });
  });
});
