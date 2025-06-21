const { body } = require("express-validator");

const reviewValidator = [
  body("skill_id").isInt().withMessage("skill_id doit être un entier"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("La note doit être entre 1 et 5"),
  body("comment").isString().notEmpty().withMessage("Le commentaire est requis")
];

module.exports = reviewValidator;
