"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var botbuilder_1 = require("botbuilder");
var config_1 = require("../../../config");
var phrases_1 = require("../../phrases");
var constants_1 = require("../../../support/constants");
function sendInfoForIssues(session, issues) {
    if (issues.length > 0) {
        sendHeroCards(session, issues);
    }
    else {
        sendNotFoundInfo(session);
    }
}
exports.sendInfoForIssues = sendInfoForIssues;
function processPromiseCatch(session, error) {
    console.log(error);
    session.send(phrases_1.Phrases.somethingWentWrong);
    session.send(phrases_1.Phrases.contactAdmin);
    session.endConversation();
}
exports.processPromiseCatch = processPromiseCatch;
function find(list, name) {
    return list.find(function (e) { return e.name == name; });
}
exports.find = find;
function sendHeroCards(session, issues) {
    var message = new botbuilder_1.Message().attachmentLayout(botbuilder_1.AttachmentLayout.carousel);
    message.attachments(issues.map(function (issue) { return makeHeroCard(session, issue); }));
    session.send(message);
}
function sendNotFoundInfo(session) {
    session.send(phrases_1.Jira.Phrases.noRelatedIssuesFound);
}
function makeHeroCard(session, issue) {
    var type = issue.fields.issuetype.name;
    var priority = issue.fields.priority.name;
    var status = issue.fields.status.name;
    var description = issue.fields.description ? issue.fields.description : 'No description.';
    var card = new botbuilder_1.HeroCard()
        .title("[" + issue.key + "] " + issue.fields.summary)
        .subtitle("Type: " + type + ". Priority: " + priority + ". Status: " + status)
        .text(description)
        .buttons([botbuilder_1.CardAction.openUrl(session, config_1.Url.jiraBaseUrl + "/browse/" + issue.key, phrases_1.Phrases.viewInBrowser)]);
    if (session.message.source != constants_1.Channel.skype) {
        card.images([botbuilder_1.CardImage.create(session, issue.fields.priority.iconUrl)]);
    }
    return card;
}
