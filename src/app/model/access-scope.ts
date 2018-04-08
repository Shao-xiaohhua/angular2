
export enum AccessScope {
    /** 默认级别. */
    Default,
    /** 完全可公开的字段. */
    Public,
    /** 内部字段，不可外部获取或显示. */
    Private,
    /** 不可外部完整显示需要屏蔽完整信息. */
    Protected
}
