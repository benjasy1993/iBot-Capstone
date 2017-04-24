import {IDialogWaterfallStep} from "botbuilder";
import {checkIfSignedIn, } from "./support/common-dialogs";
import {promptUserForPassword, storePassword} from "./user-sign-in"
import {signout} from "./user-sign-out"
import {Jira} from "../phrases";
import {cookie} from "../../app"
import {jiraRequestOptions} from "../../modules/jira/support/utils"
import {DialogId} from "../../support/constants"

export const switchAccount: IDialogWaterfallStep = (session) => {
    cookie.userName = "";
    cookie.credential = "";
    cookie.jiraUrl = "";
    cookie.signedIn = false;
    jiraRequestOptions.baseUrl = "";
    jiraRequestOptions.headers = {
        'Content-Type': 'application/json',
        'Authorization': "Basic "
    }
    session.beginDialog(DialogId.login);

};


export const SwitchAccountDialog: IDialogWaterfallStep[] = [
    switchAccount,
];