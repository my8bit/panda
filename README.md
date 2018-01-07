# 8 Bit PandaJS
A retro-style panda platformer game. This is fork re-written on JavaScript.

I was impressed of the original game written by Bruno but my knowledge of LUA is almost zero but I know a bit of JavaScript. Luckily, thanks to [@nesbox](https://github.com/nesbox/) the [TIC-80](https://github.com/nesbox/TIC-80) is supported both LUA and JavaScript so I decide to re-write this game and call my remake - _8 Bit PandaJS_.

Refactoring is still in progress and some functionality still not work correctly. Please feel free to contribute and enjoy the coding!

You can now play original version here: **[btcocode.com/panda](http://btcocode.com/panda)**

Copyright &copy; 2017 Bruno Oliveira - brunotc@gmail.com

Copyright &copy; 2018 Ihor Pavlenko


![Title screen](https://github.com/btco/panda/blob/master/images/2x/title.png?raw=true)

8 Bit Panda is a classic platformer for the [TIC-80](http://tic.computer)
fantasy console. You can move, run, jump and get powerups. It has 17 levels
distributed across 6 major areas (isles).

You can play original game online here:
 * **[btcocode.com/panda](http://btcocode.com/panda)**
 * [TIC-80 site](https://tic.computer/play?cart=188)
 * [itch.io page](https://btco.itch.io/8-bit-panda)

![World map screen](https://github.com/btco/panda/blob/master/images/2x/world.png?raw=true)

Each isle has its distinct look and feel, with different challenges and
enemies:

![Gameplay screenshot 1](https://github.com/btco/panda/blob/master/images/2x/play1.png?raw=true)

![Gameplay screenshot 2](https://github.com/btco/panda/blob/master/images/2x/play2.png?raw=true)

![Gameplay screenshot 3](https://github.com/btco/panda/blob/master/images/2x/play3.png?raw=true)

![Gameplay screenshot 4](https://github.com/btco/panda/blob/master/images/2x/play4.png?raw=true)

![Gameplay screenshot 5](https://github.com/btco/panda/blob/master/images/2x/play5.png?raw=true)

![Gameplay screenshot 6](https://github.com/btco/panda/blob/master/images/2x/play6.png?raw=true)

The originally source code was written in LUA but was complytelly re-written to JavaScript by [@my8bit](https://github.com/my8bit)

The game art was entirely created using the TIC-80 editor, including music.

If you'd like to know more details about how the game works and the development process, [this article](https://medium.com/@btco_code/writing-a-platformer-for-the-tic-80-virtual-console-6fa737abe476) may interest you.

# How to build and run:

In order to run the game you need to clone the repo. And run 

```
cd source
npm install
npm run build
npm run tic:js
```


# How to develop:

The source file is minified by Babel to fill the tic80 requirements of code byte size.
Also, there is a configuration that adds the comment with script type to minified code in order to configure tic80 for interpreting the JavaScript. For development purpose, running scripts configure Babel and tic80 to watch changes.

```
cd source
npm install
npm run build:watch
```

This will compile and try to autofix eslint errors in source and will trigger Babel watch in panda.js file

`npm run tic:js`

This command will run tic80 and inject compiled file panda.min.js

If you wnat you can save it in panda.tic file using `save` command inside tic80

If you need to run LUA version included to cartrige run:

`npm run tic:lua`


# License

This software is distributed under the Apache License, version 2.0.

    Copyright (c) 2017 Bruno Oliveira,
    Copyright (c) 2018 Ihor Pavlenko

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

