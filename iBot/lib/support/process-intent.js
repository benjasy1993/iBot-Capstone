"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var botbuilder_1 = require("botbuilder");
var issue_1 = require("../modules/jira/model/issue");
var constants_1 = require("./constants");
var phrases_1 = require("../dialogs/phrases");
var utils_1 = require("./utils");
exports.processCreateIntent = function (session, args) {
    session.privateConversationData.issueTypeName = findFirstValidIssueType(args.entities, issue_1.Issue.commonIssueTypes);
    session.privateConversationData.issueSummary = findSummary(args.entities);
    session.beginDialog(constants_1.DialogId.creation);
};
exports.processHelpIntent = function (session) {
    session.send(phrases_1.renderHelpCommand());
    session.endConversation();
};
exports.processUnknownIntent = function (session) {
    session.send(phrases_1.Phrases.unknownIntent);
    exports.processHelpIntent(session);
};
function findFirstValidIssueType(entities, issueTypeList) {
    var firstValid = issueTypeList.map(function (name) { return botbuilder_1.EntityRecognizer.findEntity(entities, name); }).reduce(function (a, b) { return a || b; });
    return firstValid ? firstValid.type : null;
}
function findSummary(entities) {
    var summaryEntity = botbuilder_1.EntityRecognizer.findEntity(entities, 'Summary');
    var rawSummary = summaryEntity ? summaryEntity.entity : null;
    return processRawSummary(rawSummary);
}
function processRawSummary(rawSummary) {
    return rawSummary ? utils_1.capitalized(rawSummary.substring(2, rawSummary.length - 2)) : null;
}
