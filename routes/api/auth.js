const express = require("express");
const router = express.Router();
const config = require("config");
const { check, validationResult } = require("express-validator");
const { User } = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");

// @route   GET     api/auth
// @desc    Get Logged-In User
// @access  Private
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ["password"] },
        });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   GET     api/auth/validateToken
// @desc    Get Logged-In User
// @access  Public
router.get("/validateToken", async (req, res) => {
    const token = req.header("x-auth-token");

    if (!token) {
        return res.status(401).json({ msg: "No Token, Authentication Denied" });
    }

    try {
        const decoded = jwt.verify(token, config.get("jwtSecret"));

        res.status(200).json({ msg: "Token is Valid" });
    } catch (err) {
        res.status(401).json({ msg: "Token is not Valid" });
    }
});

// @route   POST     api/auth
// @desc    Login/Authenticate User and Get Token
// @access  public
router.post(
    "/",
    [
        check("email", "Please Include a valid Email").isEmail(),
        check("password", "Password is required").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ where: { email } });

            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Invalid Credentials" }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Invalid Credentials" }] });
            }

            const payload = {
                id: user.id,
            };

            jwt.sign(
                payload,
                config.get("jwtSecret"),
                {
                    expiresIn: 3600,
                    subject: email,
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
);

// @route   POST     api/auth/user
// @desc    Register User
// @access  public
router.post(
    "/user",
    [
        check("name", "Please Include a Name").not().isEmpty(),
        check("email", "Include a Valid Email").isEmail(),
        check(
            "password",
            "Please Enter password with 6 or more character"
        ).isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { name, email, password } = req.body;

            let userAlreadyPresent = await User.findOne({ where: { email } });
            if (userAlreadyPresent) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "User Already Exists" }] });
            }

            const salt = await bcrypt.genSalt(10);
            let pass = await bcrypt.hash(password, salt);

            const newUser = await User.create({ name, email, password: pass });

            const payload = {
                id: newUser.id,
            };

            jwt.sign(
                payload,
                config.get("jwtSecret"),
                {
                    expiresIn: 3600,
                    subject: email,
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({ id: newUser.id, token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
);

module.exports = router;
