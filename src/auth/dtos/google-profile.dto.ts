export class GoogleProfile {
    id: string;
    displayName: string;
    name: { familyName: string, givenName: string };
    emails: { value: string, type: string }[];
    photos: { value: string }[];
}