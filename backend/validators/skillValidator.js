const { body } = require("express-validator");

exports.validateSkill = [
    body("skill_name").notEmpty().withMessage("Le nom de la compétence est requis"),
    body("description").notEmpty().withMessage("La description est requise"),
    body("type").notEmpty().withMessage("Le type est requis"),
];
