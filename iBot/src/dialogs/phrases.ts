import {IIssue} from "../modules/jira/jira";

export const Phrases = {
    abilities: 'You can ask me to create, move, and modify issues; query burn down rate, and many more.',
    unknownIntent: `Sorry, I don't understand.`,
    viewInBrowser: 'View in browser',
    somethingWentWrong: 'Something went wrong. Please try again.',
    contactAdmin: 'Contact the admin if the problem remain unfixed.',
    dialogCanceled: 'This dialog has been canceled, you can now start over again.'
};

export namespace Jira {
    export const Phrases = {
        chooseSprint: 'Please choose a sprint.',
        noActiveSprints: 'There are no active sprints.',
        cannotCalculateBurnDownRate: 'Cannot calculate burn down rate.',
        noRelatedIssuesFound: 'No related issues found.',
        noMatchedFieldsFound: 'No matched fields found.',
        whichProject: 'Which project?',
        whichBoard: 'Which board?',
        selectIssue: 'Select an issue.',
        selectStatus: 'Select a status.',
        selectAssignee: 'Select an assignee.',
        pleaseEnterEpicName: 'Please enter epic name',
        promptUserToEnterFieldForModification: 'What is the field you would like to modify?',
        successfullyAssigned: 'Successfully assigned issue to the user.',
        successfullyChangedStatus: 'Successfully change the status of the issue.',
        successfullySetDescription: 'Successfully set the description to the issue.',
        successfullySetPriority: 'Successfully set the priority to the issue.',
        successfullyAddComment: 'Successfully add the comment to the issue.',
        successfullyMoveIssueToDesiredSprint: 'Successfully move the issue to desired sprint.',
        allModificationsApplied: 'All the modifications has been applied to the issue above.',
        typeInKeyWordToSearchIssues: 'Type in some keywords to search related issues.',
        promptToChooseIssueType: 'What type of issue would you create?',
        promptUserToEnterDescription: `What's the description you want to give to the issue?`,
        promptUserToChoosePriority: 'Which priority do you want to set to the issue?',
        promptUserToEnterComment: `What's the comment you want to add to the issue?`,
        promptWhetherMoveIssueToCurrentSprint: 'Do you want to move this issue to current sprint?',
        issueNowInBacklog: 'The issue now lives in the backlog.',
        promptWhetherFurtherModifyIssue: 'Do you want to further modify this issue?',
        startAgain: 'No problem, you can now start again.',
        nothingCreated: 'Nothing created, you can now start again.',
        thisHasBeenDialog: 'This has been the dialog.',
        askUserForUserName: "Please enter your usename for Jira:",
        askUserForPassword: "Please enter the password",
        askUserForBasicUrl: "Please enter the url of your Jira instance:",
        notSignIn: "You are not signed in, Please Enter \"LOGIN\" to sign in.",
        signIn: "You are signed in now",
        signInFailed: "Wrong username/password/url. Please try again!",
        signOut: "You are now signed out!",
        switchAccount: "Please enter \"LOGIN\" to signin to another account",
        alreadySignedIn: "You are already signed in. If you want to switch to another account, please type \"SWITCH\""
    };

    export function renderBurnDownRate(burnDownRate: number): string {
        return `Currently, it is ${burnDownRate.toFixed(2)}%.`;
    }

    export function promptUserToSummarizeIssueWithType(issueType: string): string {
        return `Summarize the ${issueType}`;
    }

    export function issueCreationConfirmationMessage(issueType: string, issueSummary: string): string {
        return `A ${issueType} summarized as "${issueSummary}" will be created, are you sure?`;
    }

    export function issueCreatedMessage(issue: IIssue): string {
        return `Your desired ${issue.fields.issuetype.name.toLowerCase()} has been created!`;
    }
}

const examples: { [intent: string]: string | string[] } = {
    'create an issue': [
        'Create a new issue',
        'Create a new Story (Task / Bug / Epic)',
        'Create a new Story "This is the summary for the story"'
    ],
    'modify an issue': [
        'Modify issue',
        'Edit issue'
    ],
    'search for an issue': 'Search',
    'view issues assigned to an user': 'view-assign',
    'check the burn down rate': 'Burn down rate'
};

export function renderHelpCommand(): string {
    let result = 'Here is a list of all the available commands.\n\n\n\n';

    for (let intent in examples) {
        result += `To ${intent}, you can send:\n\n`;

        // BotFramework renders Markdown syntax.
        // We use * here to make example usages an `ul`.
        if (Array.isArray(examples[intent])) {
            for (let i = 0; i < examples[intent].length; i++) {
                result += `* ${examples[intent][i]}\n\n`;
            }
        } else {
            result += `* ${examples[intent]}\n\n`
        }
    }

    return result;
}