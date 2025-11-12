// storage.js — stockage en mémoire (pour TP sans DB)
const data = {
  students: [],
  courses: [],
  enrollments: [], // { studentId, courseId }
};

let studentId = 1;
let courseId = 1;

// --------------------
// Fonctions CRUD
// --------------------
function list(collection) {
  return data[collection];
}

function get(collection, id) {
  return data[collection].find((item) => item.id === Number(id));
}

function create(collection, payload) {
  if (collection === 'students') {
    if (data.students.find((s) => s.email === payload.email)) {
      return { error: 'Email must be unique' };
    }
  }

  const id = collection === 'students' ? studentId++ : courseId++;
  const item = { id, ...payload };
  data[collection].push(item);
  return item; // toujours retourner l'objet créé
}

function remove(collection, id) {
  const idx = data[collection].findIndex((it) => it.id === Number(id));
  if (idx === -1) {
    return false;
  }

  // Supprimer les inscriptions liées
  if (collection === 'courses') {
    data.enrollments = data.enrollments.filter(
      (e) => e.courseId !== Number(id)
    );
  }
  if (collection === 'students') {
    data.enrollments = data.enrollments.filter(
      (e) => e.studentId !== Number(id)
    );
  }

  data[collection].splice(idx, 1);
  return true;
}

// --------------------
// Fonctions spécifiques
// --------------------
function enroll(studentId, courseId) {
  const course = get('courses', courseId);
  if (!course) {
    return { error: 'Course not found' };
  }
  const student = get('students', studentId);
  if (!student) {
    return { error: 'Student not found' };
  }

  if (
    data.enrollments.find(
      (e) =>
        e.studentId === Number(studentId) && e.courseId === Number(courseId)
    )
  ) {
    return { error: 'Student already enrolled in this course' };
  }

  data.enrollments.push({
    studentId: Number(studentId),
    courseId: Number(courseId),
  });
  return { success: true };
}

function unenroll(studentId, courseId) {
  const idx = data.enrollments.findIndex(
    (e) => e.studentId === Number(studentId) && e.courseId === Number(courseId)
  );
  if (idx === -1) {
    return { error: 'Enrollment not found' };
  }
  data.enrollments.splice(idx, 1);
  return { success: true };
}

function getStudentCourses(studentId) {
  return data.enrollments
    .filter((e) => e.studentId === Number(studentId))
    .map((e) => get('courses', e.courseId));
}

function getCourseStudents(courseId) {
  return data.enrollments
    .filter((e) => e.courseId === Number(courseId))
    .map((e) => get('students', e.studentId));
}

// --------------------
// Reset & Seed
// --------------------
function reset() {
  data.students = [];
  data.courses = [];
  data.enrollments = [];
  studentId = 1;
  courseId = 1;
}

function seed() {
  create('students', { name: 'Alice', email: 'alice@example.com' });
  create('students', { name: 'Bob', email: 'bob@example.com' });
  create('students', { name: 'Charlie', email: 'charlie@example.com' });

  create('courses', { title: 'Math', teacher: 'Mr. Smith' });
  create('courses', { title: 'Physics', teacher: 'Dr. Brown' });
  create('courses', { title: 'History', teacher: 'Ms. Clark' });
}

// --------------------
// Export
// --------------------
module.exports = {
  list,
  get,
  create,
  remove,
  reset,
  enroll,
  unenroll,
  getStudentCourses,
  getCourseStudents,
  seed,
};
