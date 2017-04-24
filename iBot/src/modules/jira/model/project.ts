import {IBoard, IIssue, IIssues, IIssueType, IProject, ISprint, ISprints} from "../jira";
import {jiraGetJsonAsync} from "../support/utils";
import {JiraUrl} from "../support/url";
import {Board} from "./board";
import {Issue} from "./issue";

export class Project implements IProject {
    expand: string;
    self: string;
    id: string;
    key: string;
    issueTypes: IIssueType[];
    name: string;
    avatarUrls: Object[];
    projectTypeKey: string;

    constructor(project: IProject) {
        Object.assign(this, project);
    }

    async getBoardsForThisProjectAsync(): Promise<IBoard[]> {
        return await Board.getAllForProjectAsync(this);
    }

    async getCurrentSprintsAsync(): Promise<ISprint[]> {
        const boardsForThisProject = await this.getBoardsForThisProjectAsync();
        const scrumBoards = boardsForThisProject.filter(b => b.type == Board.typeScrum);
        if (scrumBoards && scrumBoards.length > 0) {
            const board = scrumBoards[0];
            const sprints = await jiraGetJsonAsync<ISprints>(`${JiraUrl.board}/${board.id}/sprint?state=active`);
            return sprints.values;
        } else {
            return null;
        }
    }

    async getIssuesAsync(): Promise<IIssue[]> {
        const issues = await jiraGetJsonAsync<IIssues>(`${JiraUrl.search}/?jql=project=${this.key}&maxResults=-1&fields=fields=${Issue.interestedFields.join(',')}`);
        return issues.issues
    }

    static async getAllAsync(): Promise<IProject[]> {
        return await jiraGetJsonAsync<IProject[]>(`${JiraUrl.project}/?expand=issueTypes`);
    }
}