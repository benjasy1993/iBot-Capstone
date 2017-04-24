import {IDialogWaterfallStep} from "botbuilder";
import {cookie} from "../../app";
import {Jira} from "../phrases";


export const signout: IDialogWaterfallStep = (session, results, next) => {
    cookie.credential = "";
    cookie.signedIn = false;
    cookie.justPass = true;
    session.endConversation(Jira.Phrases.signOut);
};

export const UserSignOutDialog: IDialogWaterfallStep[] = [
    signout
];

