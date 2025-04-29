const jwt = require('jsonwebtoken');
const JWT_SECRET = 'mi_secreto_super_seguro'; // (mismo secreto usado en users.js)

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'No hay token, acceso denegado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;  // Aquí guardamos los datos del usuario en la request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token no válido' });
  }
};

const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
};

const soloClient = (req, res, next) => {
  if (req.usuario.rol !== 'client') {
    return res.status(403).json({ error: 'Acceso solo para clientes' });
  }
  next();
};

module.exports = {
  verificarToken,
  soloAdmin,
  soloClient
};