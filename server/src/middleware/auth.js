import jwt from "jsonwebtoken";

export function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.full_name, email: user.email, sub_location: user.sub_location || null },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Sign in to continue." });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Your session has expired. Sign in again." });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You don't have access to this action." });
    }
    next();
  };
}
