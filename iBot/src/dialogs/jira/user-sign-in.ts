import {IDialogWaterfallStep, Prompts} from "botbuilder";
import {cookie} from "../../app";
import {
    checkIfValid,
} from "./support/common-dialogs";
import {Jira} from "../phrases";
import {Base64} from "./support/btoa"
import {jiraRequestOptions} from "../../modules/jira/support/utils"
export const promptUserForUserName: IDialogWaterfallStep = (session, results, next) => {
    if (cookie.userName.length == 0) {
        Prompts.text(session, Jira.Phrases.askUserForUserName);
    } else if (cookie.signedIn){
        session.endConversation(Jira.Phrases.alreadySignedIn);
    } else {
        next();
    }
    
};
export const storeUserName: IDialogWaterfallStep = (session, results, next) => {
    if (cookie.userName.length == 0) {
        cookie.userName = results.response;
    }
    next();
};
export const promptUserForPassword: IDialogWaterfallStep = (session) => {
    Prompts.text(session, Jira.Phrases.askUserForPassword + " for account \"" + cookie.userName + "\":");
    
};

export const storePassword: IDialogWaterfallStep = (session, results, next) => {
    cookie.password = results.response;
    var code = new Base64();
    cookie.credential = code.encode(cookie.userName + ":" + cookie.password);
    next();
};

export const promptUserForJiraUrl: IDialogWaterfallStep = (session, results, next) => {
    if (cookie.jiraUrl.length == 0) {
        Prompts.text(session, Jira.Phrases.askUserForBasicUrl);
    } else {
        next();
    }
    
};

export const storeJiraUrl: IDialogWaterfallStep = (session, results, next) => {
    if (cookie.jiraUrl.length == 0) {
        cookie.jiraUrl = results.response;
    }
    jiraRequestOptions.baseUrl = "https://" + cookie.jiraUrl + ".atlassian.net";
    jiraRequestOptions.headers = {
        'Content-Type': 'application/json',
        'Authorization': "Basic " + cookie.credential
    }//auth = "Basic " + cookie.credential;

    cookie.signedIn = true;
    next();
};


export const UserSignInDialog: IDialogWaterfallStep[] = [
    promptUserForUserName,
    storeUserName,
    promptUserForPassword,
    storePassword,
    promptUserForJiraUrl,
    storeJiraUrl,
    checkIfValid
];

