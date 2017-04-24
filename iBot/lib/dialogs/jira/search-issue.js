"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./support/utils");
var common_dialogs_1 = require("./support/common-dialogs");
var issue_1 = require("../../modules/jira/model/issue");
var getMatchedIssuesAndReturnResult = function (session, results) {
    var summary = results.response;
    session.sendTyping();
    issue_1.Issue.searchIssueBySummaryAsync(summary)
        .then(function (issues) {
        utils_1.sendInfoForIssues(session, issues);
        session.endConversation();
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
exports.SearchDialog = [
    common_dialogs_1.checkIfSignedIn,
    common_dialogs_1.promptUserToEnterSummaryToSearchIssues,
    getMatchedIssuesAndReturnResult
];
