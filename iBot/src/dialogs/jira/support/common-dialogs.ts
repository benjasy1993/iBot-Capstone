import {IDialogWaterfallStep, Prompts} from "botbuilder";
import {Project} from "../../../modules/jira/model/project";
import {Board} from "../../../modules/jira/model/board";
import {processPromiseCatch, find} from "./utils";
import {User} from "../../../modules/jira/model/user";
import {IProject, IBoard, IUser} from "../../../modules/jira/jira";
import {Jira} from "../../phrases";
import {cookie} from "../../../app"
import {jiraRequestOptions} from "../../../modules/jira/support/utils"
export const askUserToChooseAProject: IDialogWaterfallStep = (session) => {
    session.sendTyping();
    Project.getAllAsync()
        .then((projects) => {
            session.privateConversationData.projects = projects;
            Prompts.choice(session, Jira.Phrases.whichProject, projects.map(p => p.name));
        })
        .catch(error => processPromiseCatch(session, error));
};

export const askUserToChooseABoard: IDialogWaterfallStep = (session) => {
    session.sendTyping();

    Board.getAllAsync()
        .then(boards => {
            session.privateConversationData.boards = boards;
            Prompts.choice(session, Jira.Phrases.whichBoard, boards.map(b => b.name));
        })
        .catch(error => processPromiseCatch(session, error));
};

export const askUserToChooseAnAssignee: IDialogWaterfallStep = (session) => {
    session.sendTyping();

    User.getAllAsync()
        .then(users => {
            session.privateConversationData.users = users;

            Prompts.choice(session, Jira.Phrases.selectAssignee, users.map(u => u.displayName));
        })
        .catch(error => processPromiseCatch(session, error));
};

export const findProjectBasedOnChoice: IDialogWaterfallStep = (session, results, next) => {
    const projects: IProject[] = session.privateConversationData.projects;
    const choice = results.response.entity;

    session.privateConversationData.project = find(projects, choice);

    if (next) {
        next();
    }
};

export const findBoardBasedOnChoice: IDialogWaterfallStep = (session, results, next) => {
    const boards: IBoard[] = session.privateConversationData.boards;
    const choice = results.response.entity;

    session.privateConversationData.board = find(boards, choice);

    if (next) {
        next();
    }
};

export const findUserBasedOnChoice: IDialogWaterfallStep = (session, results, next) => {
    const users: IUser[] = session.privateConversationData.users;
    const choice = results.response.entity;

    session.privateConversationData.user = users.find(u => u.displayName == choice);

    if (next) {
        next();
    }
};

export const promptUserToEnterSummaryToSearchIssues: IDialogWaterfallStep = (session) => {
    Prompts.text(session, Jira.Phrases.typeInKeyWordToSearchIssues);
};


export const checkIfSignedIn: IDialogWaterfallStep = (session, results, next) => {
    if (!cookie.signedIn) {
        session.endDialog(Jira.Phrases.notSignIn);
    } else {
        next();
    }
};


export const checkIfValid: IDialogWaterfallStep = (session) => {
    Project.getAllAsync()
        .then((projects) => {
            session.privateConversationData.projects = projects;
            session.endConversation(Jira.Phrases.signIn);
            cookie.justPass = false;
        })
        .catch(error => wrongPassword(session));
};

export const wrongPassword: IDialogWaterfallStep = (session) => {
    session.endConversation(Jira.Phrases.signInFailed);
    if (!cookie.justPass) {
        cookie.userName = "";
        cookie.jiraUrl = "";
    }
    
    cookie.credential = "";
    cookie.signedIn = false;
};

