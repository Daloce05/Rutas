class AuthController {
  login(req, res) {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'admin') {
      return res.json({ success: true, message: 'Acceso autorizado', user: { username: 'admin' } });
    }

    return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }
}

module.exports = new AuthController();
