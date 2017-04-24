"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var botbuilder_1 = require("botbuilder");
var project_1 = require("../../modules/jira/model/project");
var utils_1 = require("./support/utils");
var common_dialogs_1 = require("./support/common-dialogs");
var sprint_1 = require("../../modules/jira/model/sprint");
var phrases_1 = require("../phrases");
var getSprintsForProjectChosen = function (session, response, next) {
    var project = new project_1.Project(session.privateConversationData.project);
    session.sendTyping();
    project.getCurrentSprintsAsync()
        .then(function (sprints) {
        session.privateConversationData.sprints = sprints;
        next();
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
var selectAnSprintFromAllActiveSprints = function (session, results, next) {
    var sprints = session.privateConversationData.sprints;
    if (sprints) {
        if (sprints.length > 1) {
            botbuilder_1.Prompts.choice(session, phrases_1.Jira.Phrases.chooseSprint, sprints.map(function (s) { return s.name; }));
        }
        else if (sprints.length == 1) {
            session.privateConversationData.sprint = sprints[0];
            next();
        }
        else {
            session.send(phrases_1.Jira.Phrases.noActiveSprints);
            next();
        }
    }
    else {
        session.send(phrases_1.Jira.Phrases.noActiveSprints);
        next();
    }
};
var returnBurnDownRateAndEndConversation = function (session, results) {
    if (session.privateConversationData.sprints && session.privateConversationData.sprints.length > 0) {
        if (!session.privateConversationData.sprint) {
            var sprints = session.privateConversationData.sprints;
            session.privateConversationData.sprint = utils_1.find(sprints, results.response.entity);
        }
        var sprint = new sprint_1.Sprint(session.privateConversationData.sprint);
        session.sendTyping();
        sprint.getBurnDownRateAsync()
            .then(function (burnDownRate) {
            if (isNaN(burnDownRate)) {
                session.endConversation(phrases_1.Jira.Phrases.cannotCalculateBurnDownRate);
            }
            else {
                session.endConversation(phrases_1.Jira.renderBurnDownRate(burnDownRate));
            }
        })
            .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
    }
    else {
        session.endConversation(phrases_1.Jira.Phrases.cannotCalculateBurnDownRate);
    }
};
exports.BurnDownRateDialog = [
    common_dialogs_1.checkIfSignedIn,
    common_dialogs_1.askUserToChooseAProject,
    common_dialogs_1.findProjectBasedOnChoice,
    getSprintsForProjectChosen,
    selectAnSprintFromAllActiveSprints,
    returnBurnDownRateAndEndConversation
];
