export interface INameable {
    name?: string
}

export interface IProject extends INameable {
    expand: string,
    self: string,
    id: string,
    key: string,
    issueTypes: IIssueType[],
    avatarUrls: Object[],
    projectTypeKey: string
}

export interface IIssueType extends INameable {
    self?: string,
    id: string,
    description?: string,
    iconUrl?: string,
    subtask?: boolean,
    fields?: Object,
    avatarId?: string
}

export interface IIssues extends ISimpleMultiple {
    expand: string,
    issues: IIssue[]
}

export interface IIssue extends IIssueMetaData, IIssueInfo {
    expand?: string
}

export interface IIssueInfo {
    fields: IIssueFields
}

export interface IIssueFields {
    summary: string,
    issuetype: IIssueType,
    project: IProject,
    parent?: IIssue,
    status?: IStatus,
    priority?: IPriority,
    description?: string,
    assignee?: IUser,
    customfield_10117?: number,
    customfield_10002?: string
}

export interface IIssueMetaData {
    id: string,
    key: string,
    self: string
}

export interface ISimpleMultiple {
    maxResults: number,
    startAt: number,
    total?: number
}

export interface IMultiple<T> extends ISimpleMultiple {
    isLast: boolean,
    values?: T[]
}

export interface IBoards extends IMultiple<IBoard> {

}

export interface IBoard extends INameable {
    id: number,
    self: string,
    type: string
}

export interface ISprints extends IMultiple<ISprint> {

}

export interface ISprint extends INameable {
    id: number,
    self: number,
    state: string,
    startDate?: string,
    endDate?: string,
    completeDate?: string,
    originBoardId?: number,
    goal?: string
}

export interface IStatus {
    self: string,
    description: string,
    iconUrl: string,
    name: string,
    id: string,
    statusCategory: Object
}

export interface ITransition extends INameable {
    id: string,
    to: IStatus,
    hasScreen: boolean
}

export interface ITransitions {
    expand: string,
    transitions: ITransition[]
}

export interface IPriority extends INameable {
    self: string,
    statusColor: string,
    description: string,
    iconUrl: string,
    id: string
}

export interface IUser extends INameable {
    self: string,
    key: string,
    emailAddress: string,
    avatarUrls: Object,
    displayName: string,
    active: boolean,
    timeZone: string,
    locale: string
}