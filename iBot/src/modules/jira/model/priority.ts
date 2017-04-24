import {IPriority} from "../jira";
import {jiraGetJsonAsync} from "../support/utils";
import {JiraUrl} from "../support/url";

export class Priority implements IPriority {
    self: string;
    statusColor: string;
    description: string;
    iconUrl: string;
    name: string;
    id: string;

    static async getAllAsync(): Promise<IPriority[]> {
        return await jiraGetJsonAsync<IPriority[]>(JiraUrl.priority);
    }
}