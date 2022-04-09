import pkg from "express-validator";
const { check } = pkg;
const { validationResult } = pkg;

export const signupValidator = [
  check("email").isEmail().withMessage("Email must be properly formatted"),
  check("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("password").isString().withMessage("Password must be string"),
];

export const signinValidator = [
  check("emailOrUsername").notEmpty().withMessage("Username/Email is required"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("password").isString().withMessage("Password must be string"),
];

export const isRequestValidated = (req, res, next) => {
  // * checking validation result from express validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }
  next();
};
