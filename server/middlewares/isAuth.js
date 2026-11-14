import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
    try {
        let { token } = req.cookies;

        // If no token exists, return 401 Unauthorized (not 400 Bad Request)
        if (!token) {
            return res.status(401).json({ message: "User does not have a token" });
        }

        // Verify the token (jwt.verify throws an error automatically if it's invalid/expired)
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

        // Attach userId to req (NOT res) and move to the next function
        req.userId = verifyToken.userId;
        next();

    } catch (error) {
        // If token verification fails, it will drop here
        return res.status(401).json({ message: `Invalid or expired token: ${error.message}` });
    }
};

export default isAuth;