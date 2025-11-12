const storage = require('../services/storage');

/**
 * Liste des cours avec filtrage et pagination
 */
exports.listCourses = (req, res) => {
  let courses = storage.list('courses');
  const { title, teacher, page = 1, limit = 10 } = req.query;

  // Filtrage
  if (title) {
    courses = courses.filter((c) => c.title.includes(title));
  }
  if (teacher) {
    courses = courses.filter((c) => c.teacher.includes(teacher));
  }

  // Pagination sécurisée
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const start = (pageNum - 1) * limitNum;
  const paginated = courses.slice(start, start + limitNum);

  res.json({ courses: paginated, total: courses.length });
};

/**
 * Récupérer un cours et ses étudiants
 */
exports.getCourse = (req, res) => {
  const courseId = Number(req.params.id);
  const course = storage.get('courses', courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const students = storage.getCourseStudents(courseId);
  return res.json({ course, students });
};

/**
 * Créer un cours
 */
exports.createCourse = (req, res) => {
  const { title, teacher } = req.body;
  if (!title || !teacher) {
    return res.status(400).json({ error: 'title and teacher required' });
  }

  const created = storage.create('courses', { title, teacher });
  return res.status(201).json(created);
};

/**
 * Supprimer un cours
 */
exports.deleteCourse = (req, res) => {
  const courseId = Number(req.params.id);
  const result = storage.remove('courses', courseId);

  if (result === false) {
    return res.status(404).json({ error: 'Course not found' });
  }
  if (result && result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(204).send();
};

/**
 * Mettre à jour un cours
 */
exports.updateCourse = (req, res) => {
  const courseId = Number(req.params.id);
  const course = storage.get('courses', courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const { title, teacher } = req.body;

  // Vérifier unicité du titre
  if (
    title &&
    storage.list('courses').find((c) => c.title === title && c.id !== course.id)
  ) {
    return res.status(400).json({ error: 'Course title must be unique' });
  }

  if (title) {
    course.title = title;
  }
  if (teacher) {
    course.teacher = teacher;
  }

  return res.json(course);
};
