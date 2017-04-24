"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./support/utils");
var common_dialogs_1 = require("./support/common-dialogs");
var modify_issue_1 = require("./modify-issue");
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
var deleteIssue = function (session, results, next) {
    if (results.response) {
        var project = session.privateConversationData.project;
        var summary = session.privateConversationData.issueSummary;
        var issueType = session.privateConversationData.issuetype;
        var issueInfo = {
            fields: {
                project: project,
                summary: summary,
                issuetype: issueType
            }
        };
        session.sendTyping();
        issue_1.Issue.deleteAsync(issueInfo).then(function (issue) {
            session.privateConversationData.issue = issue;
            session.send("Issue deleted successfully!");
            utils_1.sendInfoForIssues(session, [issue]);
            next();
        }).catch(function (error) { return utils_1.processPromiseCatch(session, error); });
    }
    else {
        session.endConversation("Delete failed");
    }
};
exports.DeleteDialog = [
    common_dialogs_1.checkIfSignedIn,
    modify_issue_1.locateIssueIfNoIssueInPrivateConversationData,
    deleteIssue
];
