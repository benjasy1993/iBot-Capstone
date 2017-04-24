import {IDialogWaterfallStep} from "botbuilder";
import {processPromiseCatch, sendInfoForIssues} from "./support/utils";
import {
    checkIfSignedIn,
    askUserToChooseAnAssignee,
    askUserToChooseABoard,
    findUserBasedOnChoice,
    findBoardBasedOnChoice
} from "./support/common-dialogs";
import {Board} from "../../modules/jira/model/board";

const returnIssuesAssignedAndEndConversation: IDialogWaterfallStep = (session) => {
    const board = new Board(session.privateConversationData.board);
    const user = session.privateConversationData.user;

    session.sendTyping();
    board.getIssuesAssignedToUserAsync(user)
        .then(issues => {
            sendInfoForIssues(session, issues);
            session.endConversation();
        })
        .catch(error => processPromiseCatch(session, error));
};

export const ViewAssignDialog: IDialogWaterfallStep[] = [
    checkIfSignedIn,
    askUserToChooseAnAssignee,
    findUserBasedOnChoice,
    askUserToChooseABoard,
    findBoardBasedOnChoice,
    returnIssuesAssignedAndEndConversation
];