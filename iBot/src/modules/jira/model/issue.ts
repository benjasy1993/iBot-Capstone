import {
    IIssue,
    IIssueFields,
    IIssueMetaData,
    IPriority,
    ITransition,
    IUser,
    ITransitions,
    ISprint,
    IIssueInfo, IIssues
} from "../jira";
import {JiraUrl} from "../support/url";
import {jiraGetJsonAsync, jiraPostJsonAsync, jiraPutAsync, jiraPostAsync} from "../support/utils";
import {expectedTimeField} from "../../../config";

export class Issue implements IIssue {
    static commonIssueTypes = ['Task', 'Story', 'Epic', 'Bug'];
    static interestedFields = [
        'project',
        'summary',
        'description',
        'issuetype',
        'status',
        'assignee',
        'priority',
        expectedTimeField
    ];

    static typeSubTask = 'Sub-task';
    static typeEpic = 'Epic';

    id: string;
    key: string;
    self: string;
    fields: IIssueFields;

    constructor(issue: IIssue) {
        Object.assign(this, issue);
    }

    async updateDescriptionAsync(description: string): Promise<void> {
        const putBody = `{"update": {"description": [{"set": "${description}"}]}}`;
        await jiraPutAsync(`${JiraUrl.issue}/${this.key}`, {body: putBody});
    }

    async updatePriorityAsync(priority: IPriority): Promise<void> {
        const putBody = `{"update": {"priority": [{"set": {"id": "${priority.id}"}}]}}`;
        await jiraPutAsync(`${JiraUrl.issue}/${this.key}`, {body: putBody})
    }

    async performTransitionAsync(transition: ITransition): Promise<void> {
        const postBody = `{"transition": {"id": "${transition.id}"}}`;
        await jiraPostAsync(`${JiraUrl.issue}/${this.key}/transitions`, {body: postBody});
    }

    async addCommentAsync(comment: string): Promise<void> {
        const postBody = `{"body": "${comment}"}`;
        await jiraPostAsync(`${JiraUrl.issue}/${this.key}/comment`, {body: postBody});
    }

    async assignToUserAsync(user: IUser): Promise<void> {
        const putBody = `{"fields": {"assignee": {"name": "${user.name}"}}}`;
        await jiraPutAsync(`${JiraUrl.issue}/${this.key}`, {body: putBody});
    }

    async getAllTransitionsAsync(): Promise<ITransition[]> {
        const transitions = await jiraGetJsonAsync<ITransitions>(`${JiraUrl.issue}/${this.key}/transitions`);
        return transitions.transitions;
    }

    async moveToSprintAsync(sprint: ISprint): Promise<void> {
        const postBody = `{"issues": ["${this.key}"]}`;

        await jiraPostAsync(`${JiraUrl.sprint}/${sprint.id}/issue`, {body: postBody});
    }

    static async fromKeyAsync(key: string): Promise<IIssue> {
        return await jiraGetJsonAsync<IIssue>(`${JiraUrl.issue}/${key}/?fields=${Issue.interestedFields.join(',')}`);
    }

    static async searchIssueBySummaryAsync(summary: string): Promise<IIssue[]> {
        const issues: IIssues = await jiraGetJsonAsync<IIssues>(`${JiraUrl.search}/?jql=summary~"${summary}"&maxResults=10&fields=${Issue.interestedFields.join(',')}`)
        return issues.issues
    }

    static async createAsync(issueInfo: IIssueInfo): Promise<IIssue> {
        const issueMetadata = await jiraPostJsonAsync<IIssueMetaData>(JiraUrl.issue, {body: JSON.stringify(issueInfo)});
        return await Issue.fromKeyAsync(issueMetadata.key);
    }

    static calculateSumOfEstimate(issues: IIssue[]): number {
        if (issues && issues.length > 0) {
            return issues.map(i => i.fields[expectedTimeField]).reduce(Issue.sum);
        } else {
            return 0;
        }
    }

    private static sum(a: number, b: number): number {
        return Issue.numberOf(a) + Issue.numberOf(b);
    }

    private static numberOf(num: number): number {
        return num ? num : 0;
    }
}