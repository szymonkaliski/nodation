#Nodation

Nodation is experimental take on creating music using graphs. Online version is availble on heroku: [http://nodation.herokuapp.com](http://nodation.herokuapp.com)

Nodation was created during my two week residency at [Fabrica](http://fabrica.it) in February 2014.

Note that this is just an experiment, and was only tested in Safari 7, and Chrome 32.

##Installation

Nodation requires working `node` and `mongodb`. In order to run project you need:

1. `npm install` to get all node dependencies
2. `grunt build` to get all frontend dependencies, and copy them in right places
3. `grunt run` to run project and watch for changes

##Usage

* To create playing node, click anywhere on the screen.
* To connect nodes, hover over one of them, and drag line to another one.
* To remove nodes, drag them to bottom red part of the screen.
* You can save your creations, and share output URL.
