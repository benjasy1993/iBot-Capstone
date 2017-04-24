"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./support/utils");
var common_dialogs_1 = require("./support/common-dialogs");
var board_1 = require("../../modules/jira/model/board");
var returnIssuesAssignedAndEndConversation = function (session) {
    var board = new board_1.Board(session.privateConversationData.board);
    var user = session.privateConversationData.user;
    session.sendTyping();
    board.getIssuesAssignedToUserAsync(user)
        .then(function (issues) {
        utils_1.sendInfoForIssues(session, issues);
        session.endConversation();
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
exports.ViewAssignDialog = [
    common_dialogs_1.checkIfSignedIn,
    common_dialogs_1.askUserToChooseAnAssignee,
    common_dialogs_1.findUserBasedOnChoice,
    common_dialogs_1.askUserToChooseABoard,
    common_dialogs_1.findBoardBasedOnChoice,
    returnIssuesAssignedAndEndConversation
];
