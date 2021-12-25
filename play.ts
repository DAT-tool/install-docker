import * as LOG from "@dat/lib/log";
import * as ARG from "@dat/lib/argvs";
import * as IN from "@dat/lib/input";
import * as ENV from "@dat/lib/env";
import * as GIT from "@dat/lib/git";
import * as DOCKER from "@dat/lib/docker";
import * as OS from "@dat/lib/os";
import * as APT from "@dat/lib/apt";
import * as SET from "@dat/lib/settings";
import * as PLAY from "@dat/lib/play";
import * as path from 'path';
import * as fs from 'fs';
import { platform } from "os";


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
      {
         name: 'install-docker-compose',
         description: 'install docker-compose',
         alias: 'ic',
         implement: async () => await installDockerCompose(),
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
   // =>check docker installed
   if (await OS.checkCommand('docker -v', 'Docker version', '')) {
      LOG.success('docker installed!');
      return true;
   }
   // =>if with tor
   if (ARG.hasArgv('with-tor') && !await runTor()) return false;
   let torsocks = '';
   if (ARG.hasArgv('with-tor')) torsocks = 'torsocks';
   // console.log(ARG.hasArgv('with-tor'))
   // =>if linux
   if (platform() === 'linux') {
      // =>detect disto
      let distro = OS.linuxDistribution();
      // =>if debian based
      if (distro.name === 'ubuntu' || distro.name === 'debian') {
         // LOG.info('removing old versions ...');
         // await APT.FIXME:
         LOG.info('Setting up the repository ...');
         await APT.install(['apt-get install', 'curl', 'privoxy', 'gnupg', 'ca-certificates', 'lsb-release']);
         LOG.info('adding Docker official GPG key ...');
         await OS.shell(`${torsocks} curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --batch --yes --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg`);
         //FIXME:
         // await APT.gnupg('https://download.docker.com/linux/ubuntu/gpg');
         LOG.info('adding Docker repository ...');
         await OS.shell(`echo \
         "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
         $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`);
         //FIXME:
         // await APT.addRepository('https://download.docker.com/linux/ubuntu', ['stable']);
         LOG.info('updating apt sources ...');
         await OS.shell(`sudo ${torsocks} apt-get update`);
         LOG.info('updating apt sources ...');
         await OS.shell(`sudo ${torsocks} apt-get install -y docker-ce docker-ce-cli containerd.io docker-ce-rootless-extras`);
         // =>check docker installed
         if (await OS.checkCommand('docker -v', 'Docker version', '')) {
            LOG.success('docker installed!');
            return true;
         }

      } else {
         //FIXME:
         LOG.error('can not install docker on linux ' + distro.name);
         return false;
      }
   }
   else {
      //FIXME:
      LOG.error('can not install docker on ' + platform());
      return false;
   }

   return true;
}
/************************************* */
export async function installDockerCompose() {
   // =>check docker installed
   if (await OS.checkCommand('docker-compose -v', 'docker-compose version ', '')) {
      LOG.success('docker-compose installed!');
      return true;
   }
   // =>if with tor
   if (ARG.hasArgv('with-tor') && !await runTor()) return false;
   let torsocks = '';
   if (ARG.hasArgv('with-tor')) torsocks = 'torsocks';

   // =>if linux
   if (platform() === 'linux') {
      // =>detect disto
      let distro = OS.linuxDistribution();
      // =>if debian based
      if (distro.name === 'ubuntu' || distro.name === 'debian') {
         // await APT.FIXME:
         LOG.info('Setting up the repository ...');
         await OS.shell(`sudo ${torsocks} curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`);
         //FIXME:
         await OS.shell(`sudo chmod +x /usr/local/bin/docker-compose`);
         await OS.shell(`sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose`);
         // =>check docker installed
         if (await OS.checkCommand('docker-compose -v', 'docker-compose version ', '')) {
            LOG.success('docker-compose installed!');
            return true;
         }

      } else {
         //FIXME:
         LOG.error('can not install docker-compose on linux ' + distro.name);
         return false;
      }
   }
   else {
      //FIXME:
      LOG.error('can not install docker-compose on ' + platform());
      return false;
   }
   return true;
}
/************************************* */
/************************************* */
export async function runTor() {
   // =>FIXME: git clone : too many argvs
   // let gitPlayDirPath = path.join(await OS.cwd(), '.dat', 'plays');
   // fs.mkdirSync(gitPlayDirPath, { recursive: true });
   if (!fs.existsSync(path.join(await OS.cwd(), 'run-tor'))) {
      await GIT.clone({ cloneUrl: 'https://github.com/DAT-tool/run-tor', depth: 1 });
   }
   let res = await PLAY.play('run-tor');
   // console.log('dgdf', res)
   if (res !== 0) return false;
   return true;
}