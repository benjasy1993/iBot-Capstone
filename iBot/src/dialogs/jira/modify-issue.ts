import {IDialogWaterfallStep, Prompts} from "botbuilder";
import {find, processPromiseCatch, sendInfoForIssues} from "./support/utils";
import {Issue} from "../../modules/jira/model/issue";
import {Priority} from "../../modules/jira/model/priority";
import {IIssue, IPriority, ITransition} from "../../modules/jira/jira";
import {DialogId} from "../../support/constants";
import {
    checkIfSignedIn,
    askUserToChooseABoard,
    askUserToChooseAnAssignee, askUserToChooseAProject,
    findBoardBasedOnChoice, findProjectBasedOnChoice,
    findUserBasedOnChoice,
    promptUserToEnterSummaryToSearchIssues
} from "./support/common-dialogs";
import {fuzzySearch} from "../../support/fuzzy-search/fuzzy-search";
import {Jira} from "../phrases";
import {Project} from "../../modules/jira/model/project";

interface IIssueModificationOption {
    name: string,
    description: string
}

const issueModificationOptions: { [option: string]: IIssueModificationOption } = {
    description : {
        name: 'description',
        description: `Set issue's description.`
    },
    priority: {
        name: 'priority',
        description: `Update the issue's priority.`
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

export const askUserToChooseProjectIfNoProjectInPrivateConversationData: IDialogWaterfallStep = (session, results, next) => {
    if (!session.privateConversationData.project) {
        askUserToChooseAProject(session, results, next);
    } else {
        next();
    }
};

export const findProjectIfNoProjectInPrivateConversationData: IDialogWaterfallStep = (session, results, next) => {
    if (!session.privateConversationData.project) {
        findProjectBasedOnChoice(session, results, next);
    } else {
        next();
    }
};

const locateIssueFromSummaryGiven: IDialogWaterfallStep = (session, results, next) => {
    const summary = results.response;
    const project: Project = new Project(session.privateConversationData.project);

    session.sendTyping();
    project.getIssuesAsync()
        .then(issues => {
            const matched = issues.filter(issue => fuzzySearch(summary, issue.fields.summary));
            if (matched.length == 0) {
                session.endConversation(Jira.Phrases.noRelatedIssuesFound);
            } else if (matched.length == 1) {
                session.privateConversationData.issue = matched[0];
                next();
            } else {
                session.privateConversationData.issues = matched;
                next();
            }
        })
        .catch(error => processPromiseCatch(session, error));
};

const chooseOneFromAmbiguousIssues: IDialogWaterfallStep = (session, results, next) => {
    if (session.privateConversationData.issues) {
        const issues: IIssue[] = session.privateConversationData.issues;
        Prompts.choice(session, Jira.Phrases.selectIssue, issues.map(i => i.fields.summary));
    } else {
        next();
    }
};

const findExactIssue: IDialogWaterfallStep = (session, results, next) => {
    if (!session.privateConversationData.issue) {
        const issues: IIssue[] = session.privateConversationData.issues;
        const choice: string = results.response.entity;

        session.privateConversationData.issue = issues.find(i => i.fields.summary == choice);
    }

    next();
};

const finishIssueLocating: IDialogWaterfallStep = (session) => {
    if (session.privateConversationData.issue) {
        session.endDialog();
    } else {
        session.endConversation(Jira.Phrases.noRelatedIssuesFound);
    }
};

const locateIssueIfNoIssueInPrivateConversationData: IDialogWaterfallStep = (session, results, next) => {
    if (!session.privateConversationData.issue) {
        session.beginDialog(DialogId.locateIssue);
    } else {
        next();
    }
};

const promptUserToEnterFieldForModification: IDialogWaterfallStep = (session) => {
    Prompts.text(session, Jira.Phrases.promptUserToEnterFieldForModification);
};

const beginCorrespondingConversationBasedOnChoice: IDialogWaterfallStep = (session, results) => {
    const response = results.response.toLowerCase();
    const choice = issueModificationOptions[response];

    switch (choice) {
        case issueModificationOptions.description:
            session.beginDialog(DialogId.setIssueDescription);
            break;
        case issueModificationOptions.priority:
            session.beginDialog(DialogId.setIssuePriority);
            break;
        case issueModificationOptions.comment:
            session.beginDialog(DialogId.addCommentToIssue);
            break;
        case issueModificationOptions.assign:
            session.beginDialog(DialogId.assignIssue);
            break;
        case issueModificationOptions.status:
            session.beginDialog(DialogId.transition);
            break;
        case issueModificationOptions.exit:
            session.endConversation(Jira.Phrases.startAgain);
            break;
        default:
            session.send(Jira.Phrases.noMatchedFieldsFound);
            session.send(renderOptionListAsMarkDown());
            session.replaceDialog(DialogId.modifyIssue);
            break;
    }
};

function renderOptionListAsMarkDown(): string {
    let result = 'Available keywords are in bold: \n\n';

    for (let option in issueModificationOptions) {
        const modificationOption = issueModificationOptions[option];
        result += `* **${modificationOption.name}**: ${modificationOption.description}\n\n`;
    }

    return result;
}

const promptUserToEnterIssueDescription: IDialogWaterfallStep = (session) => {
    Prompts.text(session, Jira.Phrases.promptUserToEnterDescription);
};

const getDescriptionAndSetItToTheIssue: IDialogWaterfallStep = (session, results, next) => {
    const description = results.response;
    const issue = new Issue(session.privateConversationData.issue);

    session.sendTyping();
    issue.updateDescriptionAsync(description)
        .then(() => {
            session.send(Jira.Phrases.successfullySetDescription);
            next();
        })
        .catch(error => processPromiseCatch(session, error));
};

const getPrioritiesAndAskTheUserToChooseOne: IDialogWaterfallStep = (session) => {
    session.sendTyping();
    Priority.getAllAsync()
        .then(priorities => {
            session.privateConversationData.priorities = priorities;
            const priorityOptions = priorities.map(p => p.name);
            Prompts.choice(session, Jira.Phrases.promptUserToChoosePriority, priorityOptions);
        })
        .catch(error => processPromiseCatch(session, error));
};

const getPriorityFromChoiceThenSetItToIssue: IDialogWaterfallStep = (session, results, next) => {
    const choice = results.response.entity;
    const priorities: IPriority[] = session.privateConversationData.priorities;
    const priority = find(priorities, choice);
    const issue = new Issue(session.privateConversationData.issue);

    session.sendTyping();
    issue.updatePriorityAsync(priority)
        .then(() => {
            session.send(Jira.Phrases.successfullySetPriority);
            next();
        })
        .catch(error => processPromiseCatch(session, error));
};

const promptUserToEnterComment: IDialogWaterfallStep = (session) => {
    Prompts.text(session, Jira.Phrases.promptUserToEnterComment);
};

const getCommentAndAddItToTheIssue: IDialogWaterfallStep = (session, results, next) => {
    const comment = results.response;
    const issue = new Issue(session.privateConversationData.issue);

    issue.addCommentAsync(comment)
        .then(() => {
            session.send(Jira.Phrases.successfullyAddComment);
            next();
        })
        .catch(error => processPromiseCatch(session, error));
};

const assignIssueToAssigneeChosen: IDialogWaterfallStep = (session, results, next) => {
    const issue = new Issue(session.privateConversationData.issue);
    const user = session.privateConversationData.user;

    session.sendTyping();
    issue.assignToUserAsync(user)
        .then(() => {
            session.send(Jira.Phrases.successfullyAssigned);
            next();
        })
        .catch(error => processPromiseCatch(session, error));
};

const promptUserToChooseAStatusToPerformTransition: IDialogWaterfallStep = (session) => {
    const issue: Issue = new Issue(session.privateConversationData.issue);

    session.sendTyping();
    issue.getAllTransitionsAsync()
        .then(transitions => {
            session.privateConversationData.transitions = transitions;

            Prompts.choice(session, Jira.Phrases.selectStatus, transitions.map(t => t.name));
        })
        .catch(error => processPromiseCatch(session, error));
};

const getTransitionFromChoiceAndPerformTransition: IDialogWaterfallStep = (session, results, next) => {
    const transitions: ITransition[] = session.privateConversationData.transitions;
    const choice = results.response.entity;

    const transition = find(transitions, choice);
    const issue: Issue = new Issue(session.privateConversationData.issue);

    session.sendTyping();
    issue.performTransitionAsync(transition)
        .then(() => {
            session.send(Jira.Phrases.successfullyChangedStatus);
            next();
        })
        .catch(error => processPromiseCatch(session, error));
};

const askForConfirmationToMakeMoreModifications: IDialogWaterfallStep = (session) => {
    Prompts.confirm(session, Jira.Phrases.promptWhetherFurtherModifyIssue);
};

const makeFurtherModificationsIfConfirmed: IDialogWaterfallStep = (session, results) => {
    if (results.response) {
        session.replaceDialog(DialogId.modifyIssue);
    } else {
        Issue.fromKeyAsync(session.privateConversationData.issue.key)
            .then(issue => {
                sendInfoForIssues(session, [issue]);
                session.endConversation(Jira.Phrases.allModificationsApplied);
            })
            .catch(error => processPromiseCatch(session, error));
    }
};

export const LocateIssueDialog: IDialogWaterfallStep[] = [
    checkIfSignedIn,
    askUserToChooseProjectIfNoProjectInPrivateConversationData,
    findProjectIfNoProjectInPrivateConversationData,
    promptUserToEnterSummaryToSearchIssues,
    locateIssueFromSummaryGiven,
    chooseOneFromAmbiguousIssues,
    findExactIssue,
    finishIssueLocating
];

export const ModifyIssueDialog: IDialogWaterfallStep[] = [
    checkIfSignedIn,
    locateIssueIfNoIssueInPrivateConversationData,
    promptUserToEnterFieldForModification,
    beginCorrespondingConversationBasedOnChoice,
    askForConfirmationToMakeMoreModifications,
    makeFurtherModificationsIfConfirmed
];

export const SetDescriptionDialog: IDialogWaterfallStep[] = [
    checkIfSignedIn,
    promptUserToEnterIssueDescription,
    getDescriptionAndSetItToTheIssue
];

export const SetPriorityDialog: IDialogWaterfallStep[] = [
    checkIfSignedIn,
    getPrioritiesAndAskTheUserToChooseOne,
    getPriorityFromChoiceThenSetItToIssue
];

export const AddCommentDialog: IDialogWaterfallStep[] = [
    checkIfSignedIn,
    promptUserToEnterComment,
    getCommentAndAddItToTheIssue
];

export const AssignIssueDialog: IDialogWaterfallStep[] = [
    checkIfSignedIn,
    askUserToChooseAnAssignee,
    findUserBasedOnChoice,
    assignIssueToAssigneeChosen
];

export const TransitionDialog: IDialogWaterfallStep[] = [
    checkIfSignedIn,
    promptUserToChooseAStatusToPerformTransition,
    getTransitionFromChoiceAndPerformTransition
];
