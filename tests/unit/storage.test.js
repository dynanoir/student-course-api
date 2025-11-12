const storage = require('../../src/services/storage');

beforeEach(() => {
  storage.reset();
  storage.seed();
});

describe('Storage Service - Compact Tests', () => {
  test('student creation, duplication, deletion, and listing', () => {
    // List initial students
    const initialStudents = storage.list('students');
    expect(initialStudents.length).toBe(3);
    expect(initialStudents[0].name).toBe('Alice');

    // Create new student
    const newStudent = storage.create('students', {
      name: 'David',
      email: 'david@example.com',
    });
    expect(newStudent.name).toBe('David');
    expect(storage.list('students').length).toBe(4);

    // Duplicate email check
    const dupStudent = storage.create('students', {
      name: 'Eve',
      email: 'alice@example.com',
    });
    expect(dupStudent.error).toBe('Email must be unique');

    // Delete a student
    const deleted = storage.remove('students', initialStudents[0].id);
    expect(deleted).toBe(true);
    expect(storage.list('students').length).toBe(3); // 4 - 1 = 3
  });

  test('course creation, duplicate titles allowed, enrollments, and unenrollments', () => {
    // Create duplicate course title
    const duplicateCourse = storage.create('courses', {
      title: 'Math',
      teacher: 'Someone',
    });
    expect(duplicateCourse.title).toBe('Math');

    // Enroll students
    const students = storage.list('students');
    const course = storage.list('courses')[0];
    storage.enroll(students[0].id, course.id);
    storage.enroll(students[1].id, course.id);
    storage.enroll(students[2].id, course.id);
    const extraStudent = storage.create('students', {
      name: 'Extra',
      email: 'extra@example.com',
    });
    const enrollResult = storage.enroll(extraStudent.id, course.id);
    expect(enrollResult.success).toBe(true);
    expect(storage.getCourseStudents(course.id).length).toBe(4);

    // Check student courses and course students
    expect(storage.getStudentCourses(students[0].id)[0].id).toBe(course.id);
    expect(storage.getCourseStudents(course.id)[0].id).toBe(students[0].id);

    // Unenroll a student
    const unenrollResult = storage.unenroll(students[0].id, course.id);
    expect(unenrollResult.success).toBe(true);
    expect(storage.getCourseStudents(course.id).length).toBe(3);

    // Unenroll non-enrolled student
    const failUnenroll = storage.unenroll(students[0].id, course.id);
    expect(failUnenroll.error).toBe('Enrollment not found');
  });
});
