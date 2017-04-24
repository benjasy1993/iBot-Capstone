"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var botbuilder_1 = require("botbuilder");
var issue_1 = require("../../modules/jira/model/issue");
var utils_1 = require("./support/utils");
var common_dialogs_1 = require("./support/common-dialogs");
var constants_1 = require("../../support/constants");
var project_1 = require("../../modules/jira/model/project");
var phrases_1 = require("../phrases");
var config_1 = require("../../config");
var promptUserToChooseIssueType = function (session) {
    var project = session.privateConversationData.project;
    botbuilder_1.Prompts.choice(session, phrases_1.Jira.Phrases.promptToChooseIssueType, project.issueTypes.map(function (t) { return t.name; }));
};
var findIssueTypeOrAskForIt = function (session, results, next) {
    var project = session.privateConversationData.project;
    var issueTypeName = session.privateConversationData.issueTypeName;
    var issueType = utils_1.find(project.issueTypes, issueTypeName);
    if (issueTypeName && issueType) {
        session.privateConversationData.issuetype = issueType;
        next();
    }
    else {
        promptUserToChooseIssueType(session);
    }
};
var findIssueTypeBasedOnChoice = function (session, results, next) {
    if (!session.privateConversationData.issuetype) {
        var issueTypes = session.privateConversationData.project.issueTypes;
        var choice = results.response.entity;
        session.privateConversationData.issuetype = utils_1.find(issueTypes, choice);
    }
    next();
};
var findSummaryOrAskForIt = function (session, results, next) {
    if (session.privateConversationData.issueSummary) {
        next();
    }
    else {
        var issueType = session.privateConversationData.issuetype.name.toLowerCase();
        botbuilder_1.Prompts.text(session, phrases_1.Jira.promptUserToSummarizeIssueWithType(issueType));
    }
};
var findSummaryBasedOnChoice = function (session, results, next) {
    if (!session.privateConversationData.issueSummary) {
        session.privateConversationData.issueSummary = results.response;
    }
    next();
};
var findParentIssueIfUserChooseSubtask = function (session, results, next) {
    var issueType = session.privateConversationData.issuetype;
    if (issueType.name === issue_1.Issue.typeSubTask) {
        var project = new project_1.Project(session.privateConversationData.project);
        project.getBoardsForThisProjectAsync()
            .then(function (board) {
            session.privateConversationData.board = board;
            session.beginDialog(constants_1.DialogId.locateIssue);
        })
            .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
    }
    else {
        next();
    }
};
var askUserToEnterEpicNameIfIssueTypeIsEpic = function (session, results, next) {
    var issueType = session.privateConversationData.issuetype;
    if (issueType.name === issue_1.Issue.typeEpic) {
        botbuilder_1.Prompts.text(session, phrases_1.Jira.Phrases.pleaseEnterEpicName);
    }
    else {
        next();
    }
};
var getEpicNameIfIssueTypeIsEpic = function (session, results, next) {
    var issueType = session.privateConversationData.issuetype;
    if (issueType.name === issue_1.Issue.typeEpic) {
        session.privateConversationData.epicName = results.response;
    }
    next();
};
var askUserToConfirmIssueCreation = function (session) {
    var issueType = session.privateConversationData.issuetype.name.toLowerCase();
    var issueSummary = session.privateConversationData.issueSummary;
    botbuilder_1.Prompts.confirm(session, phrases_1.Jira.issueCreationConfirmationMessage(issueType, issueSummary));
};
var createIssueIfConfirmed = function (session, results, next) {
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
        if (issueType.name === issue_1.Issue.typeSubTask) {
            issueInfo.fields.parent = session.privateConversationData.issue;
        }
        else if (issueType.name == issue_1.Issue.typeEpic) {
            issueInfo.fields[config_1.epicNameField] = session.privateConversationData.epicName;
        }
        session.sendTyping();
        issue_1.Issue.createAsync(issueInfo).then(function (issue) {
            session.privateConversationData.issue = issue;
            session.send(phrases_1.Jira.issueCreatedMessage(issue));
            utils_1.sendInfoForIssues(session, [issue]);
            next();
        }).catch(function (error) { return utils_1.processPromiseCatch(session, error); });
    }
    else {
        session.endConversation(phrases_1.Jira.Phrases.nothingCreated);
    }
};
var askWhetherMoveIssueToCurrentSprint = function (session) {
    botbuilder_1.Prompts.confirm(session, phrases_1.Jira.Phrases.promptWhetherMoveIssueToCurrentSprint);
};
var getAllActiveSprints = function (session, results, next) {
    if (results.response) {
        var project = new project_1.Project(session.privateConversationData.project);
        project.getCurrentSprintsAsync()
            .then(function (sprints) {
            session.privateConversationData.sprints = sprints;
            next();
        })
            .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
    }
    else {
        session.privateConversationData.goToModification = true;
        session.send(phrases_1.Jira.Phrases.issueNowInBacklog);
        next();
    }
};
var selectAnSprintFromAllActiveSprints = function (session, results, next) {
    var sprints = session.privateConversationData.sprints;
    if (session.privateConversationData.goToModification) {
        next();
    }
    else {
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
    }
};
var moveIssueToCurrentSprintIfConfirmed = function (session, results, next) {
    if (session.privateConversationData.goToModification) {
        next();
    }
    else {
        if (session.privateConversationData.sprints && session.privateConversationData.sprints.length > 0) {
            if (!session.privateConversationData.sprint) {
                var sprints = session.privateConversationData.sprints;
                session.privateConversationData.sprint = utils_1.find(sprints, results.response.entity);
            }
            var issue = new issue_1.Issue(session.privateConversationData.issue);
            var sprint = session.privateConversationData.sprint;
            session.sendTyping();
            issue.moveToSprintAsync(sprint)
                .then(function () {
                session.send(phrases_1.Jira.Phrases.successfullyMoveIssueToDesiredSprint);
                next();
            })
                .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
        }
        else {
            next();
        }
    }
};
var askWhetherFurtherModifyIssue = function (session) {
    botbuilder_1.Prompts.confirm(session, phrases_1.Jira.Phrases.promptWhetherFurtherModifyIssue);
};
var beginModificationDialogIfConfirmedElseEndConversation = function (session, results) {
    if (results.response) {
        session.beginDialog(constants_1.DialogId.modifyIssue);
    }
    else {
        session.endConversation(phrases_1.Jira.Phrases.startAgain);
    }
};
exports.CreationDialog = [
    common_dialogs_1.checkIfSignedIn,
    common_dialogs_1.askUserToChooseAProject,
    common_dialogs_1.findProjectBasedOnChoice,
    findIssueTypeOrAskForIt,
    findIssueTypeBasedOnChoice,
    findSummaryOrAskForIt,
    findSummaryBasedOnChoice,
    findParentIssueIfUserChooseSubtask,
    askUserToEnterEpicNameIfIssueTypeIsEpic,
    getEpicNameIfIssueTypeIsEpic,
    askUserToConfirmIssueCreation,
    createIssueIfConfirmed,
    askWhetherMoveIssueToCurrentSprint,
    getAllActiveSprints,
    selectAnSprintFromAllActiveSprints,
    moveIssueToCurrentSprintIfConfirmed,
    askWhetherFurtherModifyIssue,
    beginModificationDialogIfConfirmedElseEndConversation
];
