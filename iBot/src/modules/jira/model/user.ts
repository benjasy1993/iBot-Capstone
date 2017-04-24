import {IUser} from "../jira";
import {jiraGetJsonAsync} from "../support/utils";

export class User implements IUser {
    self: string;
    key: string;
    name: string;
    emailAddress: string;
    avatarUrls: Object;
    displayName: string;
    active: boolean;
    timeZone: string;
    locale: string;

    static async getAllAsync(): Promise<IUser[]> {
        return await jiraGetJsonAsync<IUser[]>('/rest/api/2/user/search?username=%');
    }
}