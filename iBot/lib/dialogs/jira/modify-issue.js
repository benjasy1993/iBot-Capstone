"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var botbuilder_1 = require("botbuilder");
var utils_1 = require("./support/utils");
var issue_1 = require("../../modules/jira/model/issue");
var priority_1 = require("../../modules/jira/model/priority");
var constants_1 = require("../../support/constants");
var common_dialogs_1 = require("./support/common-dialogs");
var fuzzy_search_1 = require("../../support/fuzzy-search/fuzzy-search");
var phrases_1 = require("../phrases");
var project_1 = require("../../modules/jira/model/project");
var issueModificationOptions = {
    description: {
        name: 'description',
        description: "Set issue's description."
    },
    priority: {
        name: 'priority',
        description: "Update the issue's priority."
    },
    comment: {
        name: 'comment',
        description: 'Add a comment to the issue.'
    },
    assign: {
        name: 'assign',
        description: 'Assign this issue to a user.'
    },
    status: {
        name: 'status',
        description: 'Change status of the issue.'
    },
    exit: {
        name: 'exit',
        description: 'Exit the modification process.'
    }
};
exports.askUserToChooseProjectIfNoProjectInPrivateConversationData = function (session, results, next) {
    if (!session.privateConversationData.project) {
        common_dialogs_1.askUserToChooseAProject(session, results, next);
    }
    else {
        next();
    }
};
exports.findProjectIfNoProjectInPrivateConversationData = function (session, results, next) {
    if (!session.privateConversationData.project) {
        common_dialogs_1.findProjectBasedOnChoice(session, results, next);
    }
    else {
        next();
    }
};
exports.locateIssueFromSummaryGiven = function (session, results, next) {
    var summary = results.response;
    var project = new project_1.Project(session.privateConversationData.project);
    session.sendTyping();
    project.getIssuesAsync()
        .then(function (issues) {
        var matched = issues.filter(function (issue) { return fuzzy_search_1.fuzzySearch(summary, issue.fields.summary); });
        if (matched.length == 0) {
            session.endConversation(phrases_1.Jira.Phrases.noRelatedIssuesFound);
        }
        else if (matched.length == 1) {
            session.privateConversationData.issue = matched[0];
            next();
        }
        else {
            session.privateConversationData.issues = matched;
            next();
        }
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
exports.chooseOneFromAmbiguousIssues = function (session, results, next) {
    if (session.privateConversationData.issues) {
        var issues = session.privateConversationData.issues;
        botbuilder_1.Prompts.choice(session, phrases_1.Jira.Phrases.selectIssue, issues.map(function (i) { return i.fields.summary; }));
    }
    else {
        next();
    }
};
exports.findExactIssue = function (session, results, next) {
    if (!session.privateConversationData.issue) {
        var issues = session.privateConversationData.issues;
        var choice_1 = results.response.entity;
        session.privateConversationData.issue = issues.find(function (i) { return i.fields.summary == choice_1; });
    }
    next();
};
exports.finishIssueLocating = function (session) {
    if (session.privateConversationData.issue) {
        session.endDialog();
    }
    else {
        session.endConversation(phrases_1.Jira.Phrases.noRelatedIssuesFound);
    }
};
exports.locateIssueIfNoIssueInPrivateConversationData = function (session, results, next) {
    if (!session.privateConversationData.issue) {
        session.beginDialog(constants_1.DialogId.locateIssue);
    }
    else {
        next();
    }
};
var promptUserToEnterFieldForModification = function (session) {
    botbuilder_1.Prompts.text(session, phrases_1.Jira.Phrases.promptUserToEnterFieldForModification);
};
var beginCorrespondingConversationBasedOnChoice = function (session, results) {
    var response = results.response.toLowerCase();
    var choice = issueModificationOptions[response];
    switch (choice) {
        case issueModificationOptions.description:
            session.beginDialog(constants_1.DialogId.setIssueDescription);
            break;
        case issueModificationOptions.priority:
            session.beginDialog(constants_1.DialogId.setIssuePriority);
            break;
        case issueModificationOptions.comment:
            session.beginDialog(constants_1.DialogId.addCommentToIssue);
            break;
        case issueModificationOptions.assign:
            session.beginDialog(constants_1.DialogId.assignIssue);
            break;
        case issueModificationOptions.status:
            session.beginDialog(constants_1.DialogId.transition);
            break;
        case issueModificationOptions.exit:
            session.endConversation(phrases_1.Jira.Phrases.startAgain);
            break;
        default:
            session.send(phrases_1.Jira.Phrases.noMatchedFieldsFound);
            session.send(renderOptionListAsMarkDown());
            session.replaceDialog(constants_1.DialogId.modifyIssue);
            break;
    }
};
function renderOptionListAsMarkDown() {
    var result = 'Available keywords are in bold: \n\n';
    for (var option in issueModificationOptions) {
        var modificationOption = issueModificationOptions[option];
        result += "* **" + modificationOption.name + "**: " + modificationOption.description + "\n\n";
    }
    return result;
}
var promptUserToEnterIssueDescription = function (session) {
    botbuilder_1.Prompts.text(session, phrases_1.Jira.Phrases.promptUserToEnterDescription);
};
var getDescriptionAndSetItToTheIssue = function (session, results, next) {
    var description = results.response;
    var issue = new issue_1.Issue(session.privateConversationData.issue);
    session.sendTyping();
    issue.updateDescriptionAsync(description)
        .then(function () {
        session.send(phrases_1.Jira.Phrases.successfullySetDescription);
        next();
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
var getPrioritiesAndAskTheUserToChooseOne = function (session) {
    session.sendTyping();
    priority_1.Priority.getAllAsync()
        .then(function (priorities) {
        session.privateConversationData.priorities = priorities;
        var priorityOptions = priorities.map(function (p) { return p.name; });
        botbuilder_1.Prompts.choice(session, phrases_1.Jira.Phrases.promptUserToChoosePriority, priorityOptions);
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
var getPriorityFromChoiceThenSetItToIssue = function (session, results, next) {
    var choice = results.response.entity;
    var priorities = session.privateConversationData.priorities;
    var priority = utils_1.find(priorities, choice);
    var issue = new issue_1.Issue(session.privateConversationData.issue);
    session.sendTyping();
    issue.updatePriorityAsync(priority)
        .then(function () {
        session.send(phrases_1.Jira.Phrases.successfullySetPriority);
        next();
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
var promptUserToEnterComment = function (session) {
    botbuilder_1.Prompts.text(session, phrases_1.Jira.Phrases.promptUserToEnterComment);
};
var getCommentAndAddItToTheIssue = function (session, results, next) {
    var comment = results.response;
    var issue = new issue_1.Issue(session.privateConversationData.issue);
    issue.addCommentAsync(comment)
        .then(function () {
        session.send(phrases_1.Jira.Phrases.successfullyAddComment);
        next();
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
var assignIssueToAssigneeChosen = function (session, results, next) {
    var issue = new issue_1.Issue(session.privateConversationData.issue);
    var user = session.privateConversationData.user;
    session.sendTyping();
    issue.assignToUserAsync(user)
        .then(function () {
        session.send(phrases_1.Jira.Phrases.successfullyAssigned);
        next();
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
var promptUserToChooseAStatusToPerformTransition = function (session) {
    var issue = new issue_1.Issue(session.privateConversationData.issue);
    session.sendTyping();
    issue.getAllTransitionsAsync()
        .then(function (transitions) {
        session.privateConversationData.transitions = transitions;
        botbuilder_1.Prompts.choice(session, phrases_1.Jira.Phrases.selectStatus, transitions.map(function (t) { return t.name; }));
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
var getTransitionFromChoiceAndPerformTransition = function (session, results, next) {
    var transitions = session.privateConversationData.transitions;
    var choice = results.response.entity;
    var transition = utils_1.find(transitions, choice);
    var issue = new issue_1.Issue(session.privateConversationData.issue);
    session.sendTyping();
    issue.performTransitionAsync(transition)
        .then(function () {
        session.send(phrases_1.Jira.Phrases.successfullyChangedStatus);
        next();
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
var askForConfirmationToMakeMoreModifications = function (session) {
    botbuilder_1.Prompts.confirm(session, phrases_1.Jira.Phrases.promptWhetherFurtherModifyIssue);
};
var makeFurtherModificationsIfConfirmed = function (session, results) {
    if (results.response) {
        session.replaceDialog(constants_1.DialogId.modifyIssue);
    }
    else {
        issue_1.Issue.fromKeyAsync(session.privateConversationData.issue.key)
            .then(function (issue) {
            utils_1.sendInfoForIssues(session, [issue]);
            session.endConversation(phrases_1.Jira.Phrases.allModificationsApplied);
        })
            .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
    }
};
exports.LocateIssueDialog = [
    common_dialogs_1.checkIfSignedIn,
    exports.askUserToChooseProjectIfNoProjectInPrivateConversationData,
    exports.findProjectIfNoProjectInPrivateConversationData,
    common_dialogs_1.promptUserToEnterSummaryToSearchIssues,
    exports.locateIssueFromSummaryGiven,
    exports.chooseOneFromAmbiguousIssues,
    exports.findExactIssue,
    exports.finishIssueLocating
];
exports.ModifyIssueDialog = [
    common_dialogs_1.checkIfSignedIn,
    exports.locateIssueIfNoIssueInPrivateConversationData,
    promptUserToEnterFieldForModification,
    beginCorrespondingConversationBasedOnChoice,
    askForConfirmationToMakeMoreModifications,
    makeFurtherModificationsIfConfirmed
];
exports.SetDescriptionDialog = [
    common_dialogs_1.checkIfSignedIn,
    promptUserToEnterIssueDescription,
    getDescriptionAndSetItToTheIssue
];
exports.SetPriorityDialog = [
    common_dialogs_1.checkIfSignedIn,
    getPrioritiesAndAskTheUserToChooseOne,
    getPriorityFromChoiceThenSetItToIssue
];
exports.AddCommentDialog = [
    common_dialogs_1.checkIfSignedIn,
    promptUserToEnterComment,
    getCommentAndAddItToTheIssue
];
exports.AssignIssueDialog = [
    common_dialogs_1.checkIfSignedIn,
    common_dialogs_1.askUserToChooseAnAssignee,
    common_dialogs_1.findUserBasedOnChoice,
    assignIssueToAssigneeChosen
];
exports.TransitionDialog = [
    common_dialogs_1.checkIfSignedIn,
    promptUserToChooseAStatusToPerformTransition,
    getTransitionFromChoiceAndPerformTransition
];
