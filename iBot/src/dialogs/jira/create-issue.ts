import {Prompts, IDialogWaterfallStep} from "botbuilder";
import {IIssueType, IIssueInfo, IProject, ISprint} from "../../modules/jira/jira";
import {Issue} from "../../modules/jira/model/issue";
import {find, processPromiseCatch, sendInfoForIssues} from "./support/utils";
import {checkIfSignedIn, askUserToChooseAProject, findProjectBasedOnChoice} from "./support/common-dialogs";
import {DialogId} from "../../support/constants";
import {Project} from "../../modules/jira/model/project";
import {Jira} from "../phrases";
import {epicNameField} from "../../config";

const promptUserToChooseIssueType: IDialogWaterfallStep = (session) => {
    const project: IProject = session.privateConversationData.project;
    Prompts.choice(session, Jira.Phrases.promptToChooseIssueType, project.issueTypes.map(t => t.name));
};

const findIssueTypeOrAskForIt: IDialogWaterfallStep = (session, results, next) => {
    const project: IProject = session.privateConversationData.project;
    const issueTypeName = session.privateConversationData.issueTypeName;
    const issueType = find(project.issueTypes, issueTypeName);
    if (issueTypeName && issueType) {
        session.privateConversationData.issuetype = issueType;
        next();
    } else {
        promptUserToChooseIssueType(session);
    }
};

const findIssueTypeBasedOnChoice: IDialogWaterfallStep = (session, results, next) => {
    if (!session.privateConversationData.issuetype){
        const issueTypes: IIssueType[] = session.privateConversationData.project.issueTypes;
        const choice = results.response.entity;
        session.privateConversationData.issuetype = find(issueTypes, choice);
    }

    next();
};

const findSummaryOrAskForIt: IDialogWaterfallStep = (session, results, next) => {
    if (session.privateConversationData.issueSummary) {
        next();
    } else {
        const issueType = session.privateConversationData.issuetype.name.toLowerCase();
        Prompts.text(session, Jira.promptUserToSummarizeIssueWithType(issueType));
    }
};

const findSummaryBasedOnChoice: IDialogWaterfallStep = (session, results, next) => {
    if (!session.privateConversationData.issueSummary) {
        session.privateConversationData.issueSummary = results.response;
    }

    next();
};

const findParentIssueIfUserChooseSubtask: IDialogWaterfallStep = (session, results, next) => {
    const issueType: IIssueType = session.privateConversationData.issuetype;
    if (issueType.name === Issue.typeSubTask) {
        const project: Project = new Project(session.privateConversationData.project);
        project.getBoardsForThisProjectAsync()
            .then(board => {
                session.privateConversationData.board = board;
                session.beginDialog(DialogId.locateIssue);
            })
            .catch(error => processPromiseCatch(session, error));
    } else {
        next();
    }
};

const askUserToEnterEpicNameIfIssueTypeIsEpic: IDialogWaterfallStep = (session, results, next) => {
    const issueType: IIssueType = session.privateConversationData.issuetype;

    if (issueType.name === Issue.typeEpic) {
        Prompts.text(session, Jira.Phrases.pleaseEnterEpicName);
    } else {
        next();
    }
};

const getEpicNameIfIssueTypeIsEpic: IDialogWaterfallStep = (session, results, next) => {
    const issueType: IIssueType = session.privateConversationData.issuetype;

    if (issueType.name === Issue.typeEpic) {
        session.privateConversationData.epicName = results.response;
    }

    next();
};

const askUserToConfirmIssueCreation: IDialogWaterfallStep = (session) => {
    const issueType = session.privateConversationData.issuetype.name.toLowerCase();
    const issueSummary = session.privateConversationData.issueSummary;

    Prompts.confirm(session, Jira.issueCreationConfirmationMessage(issueType, issueSummary));
};

const createIssueIfConfirmed: IDialogWaterfallStep = (session, results, next) => {
    if (results.response) {
        const project = session.privateConversationData.project;
        const summary = session.privateConversationData.issueSummary;
        const issueType: IIssueType = session.privateConversationData.issuetype;

        const issueInfo: IIssueInfo = {
            fields: {
                project: project,
                summary: summary,
                issuetype: issueType
            }
        };

        if (issueType.name === Issue.typeSubTask) {
            issueInfo.fields.parent = session.privateConversationData.issue;
        } else if (issueType.name == Issue.typeEpic) {
            issueInfo.fields[epicNameField] = session.privateConversationData.epicName;
        }

        session.sendTyping();
        Issue.createAsync(issueInfo).then(issue => {
            session.privateConversationData.issue = issue;

            session.send(Jira.issueCreatedMessage(issue));
            sendInfoForIssues(session, [issue]);

            next();
        }).catch(error => processPromiseCatch(session, error));
    } else {
        session.endConversation(Jira.Phrases.nothingCreated);
    }
};

const askWhetherMoveIssueToCurrentSprint: IDialogWaterfallStep = (session) => {
    Prompts.confirm(session, Jira.Phrases.promptWhetherMoveIssueToCurrentSprint);
};

const getAllActiveSprints: IDialogWaterfallStep = (session, results, next) => {
    if (results.response) {
        const project = new Project(session.privateConversationData.project);
        project.getCurrentSprintsAsync()
            .then(sprints => {
                session.privateConversationData.sprints = sprints;
                next();
            })
            .catch(error => processPromiseCatch(session, error));
    } else {
        session.privateConversationData.goToModification = true;
        session.send(Jira.Phrases.issueNowInBacklog);
        next();
    }
};

const selectAnSprintFromAllActiveSprints: IDialogWaterfallStep = (session, results, next) => {
    const sprints: ISprint[] = session.privateConversationData.sprints;

    if (session.privateConversationData.goToModification) {
        next();
    } else {
        if (sprints) {
            if (sprints.length > 1) {
                Prompts.choice(session, Jira.Phrases.chooseSprint, sprints.map(s => s.name));
            } else if (sprints.length == 1) {
                session.privateConversationData.sprint = sprints[0];
                next();
            } else {
                session.send(Jira.Phrases.noActiveSprints);
                next();
            }
        } else {
            session.send(Jira.Phrases.noActiveSprints);
            next();
        }
    }
};

const moveIssueToCurrentSprintIfConfirmed: IDialogWaterfallStep = (session, results, next) => {
    if (session.privateConversationData.goToModification) {
        next();
    } else {
        if (session.privateConversationData.sprints && session.privateConversationData.sprints.length > 0) {
            if (!session.privateConversationData.sprint) {
                const sprints: ISprint[] = session.privateConversationData.sprints;
                session.privateConversationData.sprint = find(sprints, results.response.entity);
            }

            const issue: Issue = new Issue(session.privateConversationData.issue);
            const sprint: ISprint = session.privateConversationData.sprint;

            session.sendTyping();
            issue.moveToSprintAsync(sprint)
                .then(() => {
                    session.send(Jira.Phrases.successfullyMoveIssueToDesiredSprint);
                    next();
                })
                .catch(error => processPromiseCatch(session, error));
        } else {
            next();
        }
    }
};

const askWhetherFurtherModifyIssue: IDialogWaterfallStep = (session) => {
    Prompts.confirm(session, Jira.Phrases.promptWhetherFurtherModifyIssue);
};

const beginModificationDialogIfConfirmedElseEndConversation: IDialogWaterfallStep = (session, results) => {
    if (results.response) {
        session.beginDialog(DialogId.modifyIssue);
    } else {
        session.endConversation(Jira.Phrases.startAgain);
    }
};

export const CreationDialog: IDialogWaterfallStep[] = [
    checkIfSignedIn,
    askUserToChooseAProject,
    findProjectBasedOnChoice,
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
