const jwt = require("jsonwebtoken");

var JWTAuthMiddleware = function(req, res, next) {
    console.log(
        "\n-----[JWT MiddleWare] JWT Middleware " +
        req.url +
        "  ip= " +
        req.connection.remoteAddress
    );
    if (req.url.includes("NFT")) {
        next();
        return;
    }
    const token = req.headers.token;
    if (!token || token === "" || token.includes("object")) {
        console.log("[JWT MiddleWare] No token found");
        res.status(401).send("Unauthorized: Token not found ");
    } else {
        console.log("[JWT MiddleWare] token found");
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(401).send("Unauthorized: Invalid token");
            } else {
                console.log(
                    "[JWT MiddleWare] user is autherised " +
                    JSON.stringify(decoded)
                );
                req.headers.authUser = decoded;
                next();
            }
        });
    }
};
module.exports = {
    JWTAuthMiddleware
};