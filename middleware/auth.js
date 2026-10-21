const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ errore: "Token mancante" });
  }

  const token = header.split(" ")[1];
  try {
    const dati = jwt.verify(token, process.env.JWT_SECRET);
    req.utenteId = dati.id;
    next();
  } catch (err) {
    res.status(401).json({ errore: "Token non valido o scaduto" });
  }
};