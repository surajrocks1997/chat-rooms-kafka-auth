const express = require("express");
const router = express.Router();
const config = require("config");
const { check, validationResult } = require("express-validator");
const { User } = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
                user: {
                    id: newUser.id,
                },
            };

            jwt.sign(
                payload,
                config.get("jwtSecret"),
                {
                    expiresIn: 3600000,
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

module.exports = router;
