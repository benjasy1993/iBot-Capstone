"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var botbuilder_1 = require("botbuilder");
var create_issue_1 = require("../dialogs/jira/create-issue");
var search_issue_1 = require("../dialogs/jira/search-issue");
var burn_down_rate_1 = require("../dialogs/jira/burn-down-rate");
var view_assign_1 = require("../dialogs/jira/view-assign");
var user_sign_in_1 = require("../dialogs/jira/user-sign-in");
var user_sign_out_1 = require("../dialogs/jira/user-sign-out");
var modify_issue_1 = require("../dialogs/jira/modify-issue");
var process_intent_1 = require("./process-intent");
var phrases_1 = require("../dialogs/phrases");
var constants_1 = require("./constants");
var config_1 = require("../config");
var delete_issue_1 = require("../dialogs/jira/delete-issue");
var dialogMappings = [
    { id: constants_1.DialogId.creation, dialog: create_issue_1.CreationDialog },
    { id: constants_1.DialogId.burnDownRate, dialog: burn_down_rate_1.BurnDownRateDialog },
    { id: constants_1.DialogId.search, dialog: search_issue_1.SearchDialog },
    { id: constants_1.DialogId.transition, dialog: modify_issue_1.TransitionDialog },
    { id: constants_1.DialogId.viewAssign, dialog: view_assign_1.ViewAssignDialog },
    { id: constants_1.DialogId.assignIssue, dialog: modify_issue_1.AssignIssueDialog },
    { id: constants_1.DialogId.locateIssue, dialog: modify_issue_1.LocateIssueDialog },
    { id: constants_1.DialogId.modifyIssue, dialog: modify_issue_1.ModifyIssueDialog },
    { id: constants_1.DialogId.setIssueDescription, dialog: modify_issue_1.SetDescriptionDialog },
    { id: constants_1.DialogId.setIssuePriority, dialog: modify_issue_1.SetPriorityDialog },
    { id: constants_1.DialogId.addCommentToIssue, dialog: modify_issue_1.AddCommentDialog },
    { id: constants_1.DialogId.login, dialog: user_sign_in_1.UserSignInDialog },
    { id: constants_1.DialogId.signout, dialog: user_sign_out_1.UserSignOutDialog },
    { id: constants_1.DialogId.deleteIssue, dialog: delete_issue_1.DeleteDialog }
];
var intentMappings = [
    { intent: config_1.LUISIntents.help, dialog: process_intent_1.processHelpIntent },
    { intent: config_1.LUISIntents.create, dialog: process_intent_1.processCreateIntent },
    { intent: /^view-assign$/, dialog: constants_1.DialogId.viewAssign },
    { intent: config_1.LUISIntents.modify, dialog: constants_1.DialogId.modifyIssue },
    { intent: config_1.LUISIntents.search, dialog: constants_1.DialogId.search },
    { intent: config_1.LUISIntents.queryBurnDownRate, dialog: constants_1.DialogId.burnDownRate },
    { intent: /^LOGIN$/, dialog: constants_1.DialogId.login },
    { intent: /^LOGOUT$/, dialog: constants_1.DialogId.signout },
    { intent: /^DELETE$/, dialog: constants_1.DialogId.deleteIssue }
];
function configure(bot) {
    loadDialogs(bot);
    mapIntents(bot);
    bot.on('conversationUpdate', function (message) {
        if (message.membersAdded) {
            message.membersAdded
                .filter(function (m) { return m.id !== message.address.bot.id; })
                .map(function (m) { return m.name || '' + ' (Id: ' + m.id + ')'; })
                .forEach(function (name) {
                var reply = new botbuilder_1.Message()
                    .address(message.address)
                    .text("Hi, " + name + ". " + phrases_1.Phrases.abilities);
                bot.send(reply);
            });
        }
    });
}
exports.default = configure;
;
function loadDialogs(bot) {
    for (var i = 0; i < dialogMappings.length; i++) {
        var mapping = dialogMappings[i];
        bot.dialog(mapping.id, mapping.dialog)
            .cancelAction('cancelAction', phrases_1.Phrases.dialogCanceled, { matches: /^CANCEL$/ });
    }
}
function mapIntents(bot) {
    var intentDialog = new botbuilder_1.IntentDialog({ recognizers: [new botbuilder_1.LuisRecognizer(process.env.LUIS_MODEL_URL)] });
    intentDialog.onDefault(process_intent_1.processUnknownIntent);
    for (var i = 0; i < intentMappings.length; i++) {
        var mapping = intentMappings[i];
        intentDialog.matches(mapping.intent, mapping.dialog);
    }
    bot.dialog('/', intentDialog);
}
