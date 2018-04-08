
export class Entity {
    id?: string;
    parentId?: string;
    typeId?: string;
    creator?: string;
    modifier?: string;
    dateCreated?: Date;
    dateModified?: Date;
    parent?: Entity;
    properties: Object = {};
    $displays: Object = {};
}
