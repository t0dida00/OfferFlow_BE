"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gmail_controller_1 = require("../controllers/gmail.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.jwtAuthMiddleware, gmail_controller_1.getRecentEmails);
exports.default = router;
