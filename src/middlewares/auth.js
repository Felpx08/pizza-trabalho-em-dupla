const jwt = require('jsonwebtoken'); 

function autenticar(req, res, next) { // Middleware de autenticação
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  if (!token) { // Verifica se o token foi fornecido
    return res.status(401).json({ erro: 'Token não fornecido. Faça login.' });
  }

  try { // Tenta verificar o token
    const payload  = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario    = payload;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = autenticar; // Exporta o middleware de autenticação
