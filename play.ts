import * as LOG from "@dat/lib/log";
import * as ARG from "@dat/lib/argvs";
import * as IN from "@dat/lib/input";
import * as ENV from "@dat/lib/env";
import * as GIT from "@dat/lib/git";
import * as DOCKER from "@dat/lib/docker";
import * as OS from "@dat/lib/os";
import * as TEM from "@dat/lib/template";
import * as SET from "@dat/lib/settings";
import * as PLAY from "@dat/lib/play";
import * as path from 'path';
import * as fs from 'fs';


type CommandName = 'install-docker' | 'install-docker-compose';
type CommandArgvName = 'with-tor'
/************************************* */
export async function main(): Promise<number> {
   // LOG.clear();
   // await SET.showStatistics();
   // =>define argvs of script
   let res = await ARG.define<CommandName, CommandArgvName>([
      {
         name: 'install-docker',
         description: 'install docker',
         alias: 'i',
         implement: async () => await installDocker(),
         argvs: [
            {
               name: 'with-tor',
               alias: 'tor',
               type: 'boolean',
               description: 'install with tor proxy',
            },
         ],
      },
   ]);
   if (!res) return 1;

   return 0;
}

/************************************* */
export async function installDocker() {
   // =>if with tor
   if (ARG.hasArgv('with-tor') && !await runTor()) return false;
   console.log(ARG.hasArgv('with-tor'))

   return true;
}

/************************************* */
/************************************* */
export async function runTor() {
   // =>FIXME: git clone : too many argvs
   // let gitPlayDirPath = path.join(await OS.cwd(), '.dat', 'plays');
   // fs.mkdirSync(gitPlayDirPath, { recursive: true });
   if (!fs.existsSync(path.join(await OS.cwd(), 'run-tor')) {
      await GIT.clone({cloneUrl: 'https://github.com/DAT-tool/run-tor', depth: 1});
   }
   let res = await PLAY.play('run-tor');
   // console.log('dgdf', res)
   if (res !== 0) return false;
   return true;
}