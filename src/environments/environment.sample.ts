// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  menuName: 'notarization',
  operatorMenuName: 'operator', // 事项操作菜单名称
  serverUrl: 'http://10.110.25.140:4200/inm',
  restServiceUrl: 'http://10.110.25.140:4200/inm/service/rest/',
  ctxpath: 'http://10.110.25.140:4200',
  clientUrl: 'http://10.110.25.140:8081', // 申请人端的页面地址
  machineUrl: 'http://127.0.0.1:8080',
  case_type_id: '784dea4b4e724649bc65f6cea8b474ed'
};
