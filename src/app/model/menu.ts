
export class Menu {
    id: string;
    name: string;
    description: string;
    icon: string;
    action: string;
    type: string;
    enabled: boolean;
    visible: boolean;
    // 是否需要reload,比如登录之后就需要reload菜单的数据
    reloadRequired = false;
    children: Array<Menu>;

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.icon = data.icon;
        this.action = data.action;
        if (this.action && this.action.startsWith('#')) {
            this.action = this.action.substring(1, this.action.length);
        } else if (this.action && this.action.startsWith('business:')) {
            this.action = '/business/' + this.action.substring(9);
        }
        this.type = data.type;
        this.enabled = data.enabled;
        this.visible = data.visible;
        this.children = new Array<Menu>();
        if (data.childNodes) {
            data.childNodes.forEach(childData => {
                const childMenu = new Menu(childData);
                this.children.push(childMenu);
            });
        }
    }
}
