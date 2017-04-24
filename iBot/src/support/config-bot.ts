import {Dialog, IDialogWaterfallStep, IIdentity, IntentDialog, LuisRecognizer, Message, UniversalBot} from "botbuilder";
import {CreationDialog} from "../dialogs/jira/create-issue";
import {SearchDialog} from "../dialogs/jira/search-issue";
import {BurnDownRateDialog} from "../dialogs/jira/burn-down-rate";
import {ViewAssignDialog} from "../dialogs/jira/view-assign";
import {UserSignInDialog} from "../dialogs/jira/user-sign-in";
import {UserSignOutDialog} from "../dialogs/jira/user-sign-out";
import {SwitchAccountDialog} from "../dialogs/jira/switch_account";
import {
    AddCommentDialog,
    AssignIssueDialog,
    LocateIssueDialog,
    ModifyIssueDialog,
    SetDescriptionDialog,
    SetPriorityDialog,
    TransitionDialog,
} from "../dialogs/jira/modify-issue";
import {processCreateIntent, processHelpIntent, processUnknownIntent} from "./process-intent";
import {Phrases} from "../dialogs/phrases";
import {DialogId} from "./constants";
import {LUISIntents} from "../config";

interface IDialogMapping {
    id: string,
    dialog: Dialog | IDialogWaterfallStep | IDialogWaterfallStep[]
}

const dialogMappings: IDialogMapping[] = [
    {id: DialogId.creation, dialog: CreationDialog},
    {id: DialogId.burnDownRate, dialog: BurnDownRateDialog},
    {id: DialogId.search, dialog: SearchDialog},
    {id: DialogId.transition, dialog: TransitionDialog},
    {id: DialogId.viewAssign, dialog: ViewAssignDialog},
    {id: DialogId.assignIssue, dialog: AssignIssueDialog},
    {id: DialogId.locateIssue, dialog: LocateIssueDialog},
    {id: DialogId.modifyIssue, dialog: ModifyIssueDialog},
    {id: DialogId.setIssueDescription, dialog: SetDescriptionDialog},
    {id: DialogId.setIssuePriority, dialog: SetPriorityDialog},
    {id: DialogId.addCommentToIssue, dialog: AddCommentDialog},
    {id: DialogId.login, dialog: UserSignInDialog},
    {id: DialogId.signout, dialog: UserSignOutDialog},
    {id: DialogId.switch, dialog: SwitchAccountDialog}
];

interface IIntentMapping {
    intent: RegExp | string,
    dialog: string | IDialogWaterfallStep[] | IDialogWaterfallStep
}

const intentMappings: IIntentMapping[] = [
    {intent: LUISIntents.help, dialog: processHelpIntent},
    {intent: LUISIntents.create, dialog: processCreateIntent},
    {intent: /^view-assign$/, dialog: DialogId.viewAssign},
    {intent: LUISIntents.modify, dialog: DialogId.modifyIssue},
    {intent: LUISIntents.search, dialog: DialogId.search},
    {intent: LUISIntents.queryBurnDownRate, dialog: DialogId.burnDownRate},
    {intent: /^LOGIN$/, dialog: DialogId.login},
    {intent: /^LOGOUT$/, dialog: DialogId.signout},
    {intent: /^SWITCH$/, dialog: DialogId.switch}
];

export default function configure(bot: UniversalBot) {
    loadDialogs(bot);
    mapIntents(bot);

    bot.on('conversationUpdate', message => {
        if (message.membersAdded) {
            message.membersAdded
                .filter((m: IIdentity) => m.id !== message.address.bot.id) // Filter out the bot.
                .map((m: IIdentity) => m.name || '' + ' (Id: ' + m.id + ')') // Get the user's name, or use its id.
                .forEach((name: string) => {
                    const reply = new Message()
                        .address(message.address)
                        .text(`Hi, ${name}. ${Phrases.abilities}`);
                    bot.send(reply);
                });
        }
    });
};

function loadDialogs(bot: UniversalBot): void {
    for (let i = 0; i < dialogMappings.length; i++) {
        const mapping = dialogMappings[i];
        bot.dialog(mapping.id, mapping.dialog)
            .endConversationAction('cancelAction', Phrases.dialogCanceled, {matches: /^CANCEL$/});

    }
}

function mapIntents(bot: UniversalBot): void {
    const intentDialog = new IntentDialog({recognizers: [new LuisRecognizer(process.env.LUIS_MODEL_URL)]});
    intentDialog.onDefault(processUnknownIntent);

    for (let i = 0; i < intentMappings.length; i++) {
        const mapping = intentMappings[i];
        intentDialog.matches(mapping.intent, mapping.dialog);
    }

    bot.dialog('/', intentDialog);
}