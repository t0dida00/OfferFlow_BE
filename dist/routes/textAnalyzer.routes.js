"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const textAnalyzer_controller_1 = require("../controllers/textAnalyzer.controller");
const router = (0, express_1.Router)();
router.post('/analyzer', textAnalyzer_controller_1.analyze);
exports.default = router;
