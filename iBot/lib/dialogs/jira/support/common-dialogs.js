"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var botbuilder_1 = require("botbuilder");
var project_1 = require("../../../modules/jira/model/project");
var board_1 = require("../../../modules/jira/model/board");
var utils_1 = require("./utils");
var user_1 = require("../../../modules/jira/model/user");
var phrases_1 = require("../../phrases");
var app_1 = require("../../../app");
var btoa_1 = require("./btoa");
var utils_2 = require("../../../modules/jira/support/utils");
exports.askUserToChooseAProject = function (session) {
    session.sendTyping();
    project_1.Project.getAllAsync()
        .then(function (projects) {
        session.privateConversationData.projects = projects;
        botbuilder_1.Prompts.choice(session, phrases_1.Jira.Phrases.whichProject, projects.map(function (p) { return p.name; }));
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
exports.askUserToChooseABoard = function (session) {
    session.sendTyping();
    board_1.Board.getAllAsync()
        .then(function (boards) {
        session.privateConversationData.boards = boards;
        botbuilder_1.Prompts.choice(session, phrases_1.Jira.Phrases.whichBoard, boards.map(function (b) { return b.name; }));
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
exports.askUserToChooseAnAssignee = function (session) {
    session.sendTyping();
    user_1.User.getAllAsync()
        .then(function (users) {
        session.privateConversationData.users = users;
        botbuilder_1.Prompts.choice(session, phrases_1.Jira.Phrases.selectAssignee, users.map(function (u) { return u.displayName; }));
    })
        .catch(function (error) { return utils_1.processPromiseCatch(session, error); });
};
exports.findProjectBasedOnChoice = function (session, results, next) {
    var projects = session.privateConversationData.projects;
    var choice = results.response.entity;
    session.privateConversationData.project = utils_1.find(projects, choice);
    if (next) {
        next();
    }
};
exports.findBoardBasedOnChoice = function (session, results, next) {
    var boards = session.privateConversationData.boards;
    var choice = results.response.entity;
    session.privateConversationData.board = utils_1.find(boards, choice);
    if (next) {
        next();
    }
};
exports.findUserBasedOnChoice = function (session, results, next) {
    var users = session.privateConversationData.users;
    var choice = results.response.entity;
    session.privateConversationData.user = users.find(function (u) { return u.displayName == choice; });
    if (next) {
        next();
    }
};
exports.promptUserToEnterSummaryToSearchIssues = function (session) {
    botbuilder_1.Prompts.text(session, phrases_1.Jira.Phrases.typeInKeyWordToSearchIssues);
};
exports.promptUserForUserName = function (session) {
    botbuilder_1.Prompts.text(session, phrases_1.Jira.Phrases.askUserForUserName);
};
exports.storeUserName = function (session, results, next) {
    app_1.cookie.userName = results.response;
    next();
};
exports.promptUserForPassword = function (session) {
    botbuilder_1.Prompts.text(session, phrases_1.Jira.Phrases.askUserForPassword);
};
exports.storePassword = function (session, results, next) {
    app_1.cookie.password = results.response;
    var code = new btoa_1.Base64();
    app_1.cookie.credential = code.encode(app_1.cookie.userName + ":" + app_1.cookie.password);
    next();
};
exports.promptUserForJiraUrl = function (session) {
    botbuilder_1.Prompts.text(session, phrases_1.Jira.Phrases.askUserForBasicUrl);
};
exports.storeJiraUrl = function (session, results, next) {
    app_1.cookie.jiraUrl = results.response;
    utils_2.jiraRequestOptions.baseUrl = "https://" + app_1.cookie.jiraUrl;
    utils_2.jiraRequestOptions.headers = {
        'Content-Type': 'application/json',
        'Authorization': "Basic " + app_1.cookie.credential
    };
    app_1.cookie.signedIn = true;
    next();
};
exports.checkIfSignedIn = function (session, results, next) {
    if (!app_1.cookie.signedIn) {
        session.endDialog(phrases_1.Jira.Phrases.notSignIn);
    }
    else {
        next();
    }
};
exports.signout = function (session, results, next) {
    app_1.cookie.credential = "";
    app_1.cookie.jiraUrl = "";
    app_1.cookie.signedIn = false;
    session.endConversation("You are now signed out!");
};
exports.checkIfValid = function (session) {
    project_1.Project.getAllAsync()
        .then(function (projects) {
        session.privateConversationData.projects = projects;
        session.endConversation("You are signed in now!");
    })
        .catch(function (error) { return exports.wrongPassword(session); });
};
exports.wrongPassword = function (session) {
    session.endConversation("Wrong Password. Please Login again!");
    app_1.cookie.credential = "";
    app_1.cookie.jiraUrl = "";
    app_1.cookie.signedIn = false;
};
