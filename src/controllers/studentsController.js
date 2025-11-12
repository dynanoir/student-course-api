const storage = require('../services/storage');

/**
 * Liste des étudiants avec filtrage et pagination
 */
exports.listStudents = (req, res) => {
  let students = storage.list('students');
  const { name, email, page = 1, limit = 10 } = req.query || {}; // ✅ safe si undefined

  if (name) {
    students = students.filter((st) => st.name.includes(name));
  }
  if (email) {
    students = students.filter((st) => st.email.includes(email));
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const start = (pageNum - 1) * limitNum;
  const paginated = students.slice(start, start + limitNum);

  res.json({ students: paginated, total: students.length });
};

/**
 * Récupérer un étudiant
 */
exports.getStudent = (req, res) => {
  const id = Number(req.params.id);
  const student = storage.get('students', id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const courses = storage.getStudentCourses(id);
  res.json({ student, courses });
};

/**
 * Créer un étudiant
 */
exports.createStudent = (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email required' });
  }

  if (storage.list('students').some((s) => s.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const created = storage.create('students', { name, email });
  res.status(201).json(created);
};

/**
 * Supprimer un étudiant
 */
exports.deleteStudent = (req, res) => {
  const id = Number(req.params.id);
  const result = storage.remove('students', id);

  if (result === false) {
    return res.status(404).json({ error: 'Student not found' });
  }
  if (result && result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(204).send();
};

/**
 * Mettre à jour un étudiant
 */
exports.updateStudent = (req, res) => {
  const id = Number(req.params.id);
  const student = storage.get('students', id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const { name, email } = req.body;

  if (
    email &&
    storage
      .list('students')
      .some((s) => s.email === email && s.id !== student.id)
  ) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  if (name) {
    student.name = name;
  }
  if (email) {
    student.email = email;
  }

  res.json(student);
};
