"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var common_dialogs_1 = require("./support/common-dialogs");
exports.UserSignInDialog = [
    common_dialogs_1.promptUserForUserName,
    common_dialogs_1.storeUserName,
    common_dialogs_1.promptUserForPassword,
    common_dialogs_1.storePassword,
    common_dialogs_1.promptUserForJiraUrl,
    common_dialogs_1.storeJiraUrl,
    common_dialogs_1.checkIfValid
];
