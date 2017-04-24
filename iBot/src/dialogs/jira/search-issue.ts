import {IDialogWaterfallStep} from "botbuilder";
import {Board} from "../../modules/jira/model/board";
import {sendInfoForIssues, processPromiseCatch} from "./support/utils";
import {
    checkIfSignedIn,
    askUserToChooseABoard,
    findBoardBasedOnChoice,
    promptUserToEnterSummaryToSearchIssues
} from "./support/common-dialogs";
import {fuzzySearch} from "../../support/fuzzy-search/fuzzy-search";
import {Issue} from "../../modules/jira/model/issue";

const getMatchedIssuesAndReturnResult: IDialogWaterfallStep = (session, results) => {
    const summary = results.response;

    session.sendTyping();
    Issue.searchIssueBySummaryAsync(summary)
        .then(issues => {
            sendInfoForIssues(session, issues);
            session.endConversation();
        })
        .catch(error => processPromiseCatch(session, error));
};

export const SearchDialog: IDialogWaterfallStep[] = [
    checkIfSignedIn,
    promptUserToEnterSummaryToSearchIssues,
    getMatchedIssuesAndReturnResult
];