import {IDialogWaterfallStep, Prompts} from "botbuilder";
import {Project} from "../../modules/jira/model/project";
import {processPromiseCatch, find} from "./support/utils";
import {checkIfSignedIn, askUserToChooseAProject, findProjectBasedOnChoice} from "./support/common-dialogs";
import {ISprint} from "../../modules/jira/jira";
import {Sprint} from "../../modules/jira/model/sprint";
import {Jira} from "../phrases";

const getSprintsForProjectChosen: IDialogWaterfallStep = (session, response, next) => {
    const project = new Project(session.privateConversationData.project);

    session.sendTyping();
    project.getCurrentSprintsAsync()
        .then(sprints => {
            session.privateConversationData.sprints = sprints;
            next();
        })
        .catch(error => processPromiseCatch(session, error));
};

const selectAnSprintFromAllActiveSprints: IDialogWaterfallStep = (session, results, next) => {
    const sprints: ISprint[] = session.privateConversationData.sprints;

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
};

const returnBurnDownRateAndEndConversation: IDialogWaterfallStep = (session, results) => {
    if (session.privateConversationData.sprints && session.privateConversationData.sprints.length > 0) {
        if (!session.privateConversationData.sprint) {
            const sprints: ISprint[] = session.privateConversationData.sprints;
            session.privateConversationData.sprint = find(sprints, results.response.entity);
        }

        const sprint: Sprint = new Sprint(session.privateConversationData.sprint);

        session.sendTyping();
        sprint.getBurnDownRateAsync()
            .then(burnDownRate => {
                if (isNaN(burnDownRate)) {
                    session.endConversation(Jira.Phrases.cannotCalculateBurnDownRate);
                } else {
                    session.endConversation(Jira.renderBurnDownRate(burnDownRate));
                }
            })
            .catch(error => processPromiseCatch(session, error));
    } else {
        session.endConversation(Jira.Phrases.cannotCalculateBurnDownRate);
    }
};

export const BurnDownRateDialog: IDialogWaterfallStep[] = [
    checkIfSignedIn,
    askUserToChooseAProject,
    findProjectBasedOnChoice,
    getSprintsForProjectChosen,
    selectAnSprintFromAllActiveSprints,
    returnBurnDownRateAndEndConversation
];