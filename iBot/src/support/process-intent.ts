import {EntityRecognizer, IDialogWaterfallStep, IEntity} from "botbuilder";
import {Issue} from "../modules/jira/model/issue";
import {DialogId} from "./constants";
import {Phrases, renderHelpCommand} from "../dialogs/phrases";
import {capitalized} from "./utils";

export const processCreateIntent: IDialogWaterfallStep = (session, args) => {
    session.privateConversationData.issueTypeName = findFirstValidIssueType(args.entities, Issue.commonIssueTypes);
    session.privateConversationData.issueSummary = findSummary(args.entities);

    session.beginDialog(DialogId.creation);
};

export const processHelpIntent: IDialogWaterfallStep = (session) => {
    session.send(renderHelpCommand());
    session.endConversation();
};

export const processUnknownIntent: IDialogWaterfallStep = (session) => {
    session.send(Phrases.unknownIntent);
    processHelpIntent(session);
};

/**
 * Returns the first valid issue type in a string.
 * Returns null if there are none.
 *
 * Examples:
 *  1. [null, null, null, null] -> null
 *  2. [null, {Story}, null, null] -> 'Story'
 *  3. [null, {Task}, {Story}, null] -> 'Task'
 *
 * @param entities the entities from args.
 * @param issueTypeList A list of all valid issue type names.
 * @returns {string|null}
 */
function findFirstValidIssueType(entities: IEntity[], issueTypeList: string[]): string|null {
    const firstValid = issueTypeList.map(name => EntityRecognizer.findEntity(entities, name)).reduce((a, b) => a || b);
    return firstValid ? firstValid.type : null;
}

function findSummary(entities: IEntity[]): string|null {
    const summaryEntity = EntityRecognizer.findEntity(entities, 'Summary');
    const rawSummary = summaryEntity ? summaryEntity.entity : null;

    return processRawSummary(rawSummary)
}

/**
 * Removes the quotation mark and space at the front and end of a String, then capitalize the content.
 *
 * Since LUIS chops sentence into words.
 * Summary entity in 'Create in progress Story "This is the summary"' will be returned as `" this is the summary "`.
 *
 * This function will make the summary returned from LUIS easier to the eye.
 *
 * @param rawSummary the summary returned from LUIS.
 * @returns {string|null}
 */
function processRawSummary(rawSummary: string): string|null {
    return rawSummary ? capitalized(rawSummary.substring(2, rawSummary.length - 2)) : null;
}
