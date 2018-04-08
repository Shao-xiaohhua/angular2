import { Mode } from './mode';
import { Type } from './type';
import { DataService } from '../service/data.service';
import { AccessScope } from './access-scope';

export class Action {

    id: string;
    name: string;
    displayAs: string;
    override: boolean;
    description: string;
    properties: Map<string, Object>;
    inherit: boolean;
    system: boolean;
    accessScope: AccessScope;
    mode: Mode;

    constructor(data: {}) {
        this.id = data['id'];
        this.name = data['name'];
        this.displayAs = data['displayAs'];
        this.override = data['override'];
        this.description = data['description'];
        this.properties = data['properties'];
        this.inherit = data['inherit'];
        this.system = data['system'];
        const m = data['mode'];
        if ('Entity' === m) {
            this.mode = Mode.Entity;
        } else if ('Collection' === m) {
            this.mode = Mode.Collection;
        }
        const as = data['accessScope'];
        if ('Default' === as) {
            this.accessScope = AccessScope.Default;
        } else if ('Private' === as) {
            this.accessScope = AccessScope.Private;
        } else if ('Protected' === as) {
            this.accessScope = AccessScope.Protected;
        } else if ('Public' === as) {
            this.accessScope = AccessScope.Public;
        }
    }

    getId(): string {
        return this.id;
    };

    getName(): string {
        return this.name;
    };

    getTypeName(): string {
        return this.id.split('@')[0];
    };

    getDisplayAs(): string {
        return this.displayAs;
    };

    getMode(): Mode {
        return this.mode;
    };
    getAccessScope(): AccessScope {
        return this.accessScope;
    };

    isInherit(): boolean {
        return this.inherit || false;
    };

    isSystem(): boolean {
        return this.system || false;
    };

    getProperties(): Map<string, Object> {
        return this.properties || new Map<string, Object>();
    };

    getProperty(propertyName): Object {
        return this.getProperties()[propertyName];
    };
}
