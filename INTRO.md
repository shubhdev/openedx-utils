## Getting Started
The official website for open-edx is https://open.edx.org/. This website is the first thing you should visit to get familiar with the platform.

After getting to know about what is open-edx, its history and other stuff, the main thing you have to read is the "contributing" section, especially the [architecture](https://open.edx.org/contributing-to-edx/architecture) part. You will get to know the technology stack that open edx uses, it will help you understand the changes in the repo.

After the contributing section you should look at the "Hosting" section, more precisely the [Deployment section](https://open.edx.org/deployment-options).

As described there, you can do 3 types of installations: devstack,full-stack,production
  * **Devstack** : This installation is for your local machine, to get familiar with the platform code and better understand their technology stack. In **devstack** the platform is run in debug mode. What that basically means to you is that, nothing is automated i.e no service is run on its own. you have to start the LMS service yourself, similarly for the CMS. Open-edx uses xqueues for external files submission. The code for this module is in a [separate repo](github.com/edx/xqueue). In devstack you have to install this module yourself while in fullstack and production this is done during the installation itself.

    Openedx releases stable releases from time to time. The current release is "Birch" and another release was going to be released soon.These releases are always promised to be stable.However,the devstack version is based off the head of the latest master branch of the edx-platform repo.There are many other things about devstack, like all the output is on terminal, even the confirmation mail sent on registering.
* **Fullstack** : Fullstack is basically how your platform will be in production, and is meant to test on your local machine before deploying on a production level.
* **Open edX Ubuntu 12.04 64-bit Installation** : This is the installation for production environment. Same as fullstack except its not a vagrant instance, its independent.

## Installation

For installation see the instruction on the official website.I faced some issues while installing on windows, so its recommended that you do the installation on Linux.

I recommend you to try both devstack and fullstack, it will help you get accustomed with the platform. Installing Fullstack is especially useful, it helps you understand how things are on the actual server.

The ubuntu installation is already done on the baadal server. However if you install it on your own in the future, you might face some issues due to the firewall.

It will be useful if you can watch this video : https://open.edx.org/videos/edx-hosting-architecture. You can also have a look at other videos on https://open.edx.org/videos/.

I have discussed about that issue [here](https://github.com/edx/configuration/issues/2086) along with what I did to get around them.

## Some useful links and documentation
* One of the most important are the commands to manage the platform. You can find them here https://github.com/edx/configuration/wiki/edX-Managing-the-Full-Stack. Although it says fullstack, but its same for the server installation. Please go through it once, to get an idea of what are the various management facilities you have.
* Open edx has a nice [wiki](https://github.com/edx/configuration/wiki/).
* Open edx also has google mailing lists for various topics. The ones is found most useful and active are https://groups.google.com/forum/#!forum/edx-code and https://groups.google.com/forum/#!forum/openedx-ops. Feel free to ask doubts here about any issues you face. You may also search for posts I have made by searching my name in the search box.
* Official documentation : http://edx.readthedocs.org/projects/. (Though its not thorough)
