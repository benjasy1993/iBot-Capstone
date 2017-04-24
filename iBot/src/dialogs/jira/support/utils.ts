import {HeroCard, Session, CardAction, Message, AttachmentLayout, CardImage} from "botbuilder";
import {Url} from "../../../config";
import {IIssue, INameable} from "../../../modules/jira/jira";
import {Phrases, Jira} from "../../phrases";
import {Channel} from "../../../support/constants";
import {cookie} from "../../../app"
export function sendInfoForIssues(session: Session, issues: IIssue[]): void {
    if (issues.length > 0) {
        sendHeroCards(session, issues);
    } else {
        sendNotFoundInfo(session);
    }
}

export function processPromiseCatch(session: Session, error: any): void {
    console.log(error);

    session.send(Phrases.somethingWentWrong);
    session.send(Phrases.contactAdmin);

    session.endConversation();
}

export function find<T extends INameable>(list: T[], name: string): T|undefined {
    return list.find(e => e.name == name);
}

function sendHeroCards(session: Session, issues: IIssue[]): void {
    const message = new Message().attachmentLayout(AttachmentLayout.carousel);
    message.attachments(issues.map(issue => makeHeroCard(session, issue)));

    session.send(message);
}

function sendNotFoundInfo(session: Session): void {
    session.send(Jira.Phrases.noRelatedIssuesFound);
}

function makeHeroCard(session: Session, issue: IIssue): HeroCard {
    const type = issue.fields.issuetype.name;
    const priority = issue.fields.priority.name;
    const status = issue.fields.status.name;

    const description = issue.fields.description ? issue.fields.description : 'No description.';

    const card = new HeroCard()
        .title(`[${issue.key}] ${issue.fields.summary}`)
        .subtitle(`Type: ${type}. Priority: ${priority}. Status: ${status}`)
        .text(description)
        .buttons([CardAction.openUrl(session, `${Url.jiraBaseUrl}/browse/${issue.key}`, Phrases.viewInBrowser)]);

    if (session.message.source != Channel.skype) {
        card.images([CardImage.create(session, issue.fields.priority.iconUrl)]);
    }

    return card;
}
