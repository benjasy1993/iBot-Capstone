import {IBoard, IBoards, IIssue, IIssues, IUser, IProject} from "../jira";
import {jiraGetJsonAsync} from "../support/utils";
import {JiraUrl} from "../support/url";
import {Issue} from "./issue";
import {jiraRequestOptions} from "../support/utils"

export class Board implements IBoard {
    id: number;
    self: string;
    name: string;
    type: string;

    static typeScrum = 'scrum';
    static typeKanban = 'kanban';

    constructor(board: IBoard) {
        Object.assign(this, board);
    }

    async getIssuesAsync(): Promise<IIssue[]> {
        const response = await jiraGetJsonAsync<IIssues>(`${JiraUrl.board}/${this.id}/issue?fields=${Issue.interestedFields.join(',')}`);
        return response.issues;
    }

    async getIssuesAssignedToUserAsync(user: IUser): Promise<IIssue[]> {
        const issues = await this.getIssuesAsync();
        return issues.filter(issue => issue.fields.assignee && issue.fields.assignee.key === user.key)
    }

    static async getAllAsync(): Promise<IBoard[]> {
        const response = await jiraGetJsonAsync<IBoards>(JiraUrl.board);
        return response.values;
    }

    static async getAllForProjectAsync(project: IProject): Promise<IBoard[]> {
        const response = await jiraGetJsonAsync<IBoards>(`${JiraUrl.board}/?projectKeyOrId=${project.key}`);
        return response.values;
    }
}