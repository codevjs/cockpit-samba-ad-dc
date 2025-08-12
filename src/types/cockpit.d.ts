declare module 'cockpit' {
  interface ScriptOptions {
    superuser?: boolean;
    err?: string;
  }

  interface CockpitModule {
    script(command: string, options?: ScriptOptions): Promise<string>;
  }

  const cockpit: CockpitModule;
  export default cockpit;
}
