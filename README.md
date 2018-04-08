# Inspinia

### 环境准备

* 安装nodejs  https://nodejs.org/en/

* 安装vscode  https://code.visualstudio.com/  并安装tslint 插件

* 安装angular-cli

```bash
npm install -g @angular/cli
```

* 安装项目的依赖
```bash
npm install
```

* 启动项目
```bash
npm start
```

## 解决跨域的问题

1.将 `proxy.config.sample.json`  拷贝一份成  `proxy.config.json` ，并修改对应的配置。

```json
{
    "/inm": {
        "target": "http://localhost:8080",
        "secure": "false"
    },
    "/common": {
        "target": "http://localhost:8080",
        "secure": "false"
    },
    "/theme": {
        "target": "http://localhost:8080",
        "secure": "false"
    },
    "/prototype": {
        "target": "http://localhost:8080",
        "secure": "false"
    }
}
```

2.将 `src/environments/environment.sample.ts` 拷贝一份成 `src/environments/environment.ts`, 并做相应修改。


注意这里的 `/inm` 为对应启动的java项目的context路径，如果切换了项目，需要修改这个路径，还有如果tomcat启动的端口不是`8080`，需要修改为tomcat使用的端口，配置好之后就可以使用 `http://localhost:4200/inm` 来访问到后台项目了。


### java 和 typescript 的比较

https://cyrilletuzi.github.io/javascript-guides/java-to-typescript.html

### typescript 简单的入门介绍

https://ts.xcatliu.com/

### 权威的 es6 入门

http://es6.ruanyifeng.com/


### angular 官方中文入门手册

http://angular.cn/guide/quickstart


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

