export interface Notification {
    title: string;
    message: string;
    type: "all" | "user";
    targetUser?: string;
    icon?: string;
    link?: string;
    createdBy?: string;
    readBy: string[];
    createdAt?: Date;
    updatedAt?: Date;
}