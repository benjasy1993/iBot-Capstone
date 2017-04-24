import {ISprint, IIssues, IIssue} from "../jira";
import {jiraGetJsonAsync} from "../support/utils";
import {JiraUrl} from "../support/url";
import {Issue} from "./issue";

export class Sprint implements ISprint {
    id: number;
    self: number;
    state: string;
    name: string;

    constructor(sprint: ISprint) {
        Object.assign(this, sprint);
    }

    async getIssuesAsync(): Promise<IIssue[]> {
        const issues = await jiraGetJsonAsync<IIssues>(`${JiraUrl.sprint}/${this.id}/issue/?fields=${Issue.interestedFields.join(',')}`);
        return issues.issues;
    }

    async getBurnDownRateAsync(): Promise<number> {
        const issues = await this.getIssuesAsync();

        const totalEstimateTime = Issue.calculateSumOfEstimate(issues);
        const doneEstimate = Issue.calculateSumOfEstimate(issues.filter(i => i.fields.status.name == 'Done'));

        if (totalEstimateTime == 0) {
            return NaN;
        } else {
            return (doneEstimate / totalEstimateTime) * 100;
        }
    }
}