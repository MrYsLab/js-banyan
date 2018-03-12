#!/usr/bin/env node

/**
 Copyright (c) 2017, 2018 Alan Yorinks All right reserved.

 This file is part of JavaScript-Banyan.

 JavaScript Banyan is free software; you can redistribute it and/or
 modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 Version 3 as published by the Free Software Foundation; either
 or (at your option) any later version.
 This library is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU AFFERO GENERAL PUBLIC LICENSE
 along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

 backplane.js
 */

const zmq = require('zmq');
const ip = require('ip');


class BackPlane {
    /**
     *  This is the Banyan backplane. It must be started before any other Banyan component.
     *  The two port parameters are from the point of view of a Banyan Component. That is,
     *  the component publishes on the pubPort (the backplane listens on this port)
     *  and the component subscribes to messages on the subPort (the backplane publishes messages
     *  on the pubPort).
     *
     * @param pubPort: Port that backplane uses to republish messages
     * @param subPort: Port that backplane uses to receive message
     * @param backplaneName: Option to specify to print to console
     */

    constructor({subPort = '43124', pubPort = '43125', backplaneName = ""} = {}) {
        const ipAddr = ip.address();

        console.log('\n************************************************************');
        if (backplaneName === "") {
            console.log('Backplane IP Address: ' + ipAddr);
        }
        else {
            console.log(backplaneName + ' Backplane IP address: ' + ipAddr);
        }
        console.log('Subscriber Port = ' + subPort);
        console.log('Publisher  Port = ' + pubPort);
        console.log('************************************************************');

        const subSocket = zmq.socket('sub');

        // subscribe to all messages
        subSocket.subscribe('');

        subSocket.bind("tcp://" + ipAddr + ':' + pubPort);
        const pubSocket = zmq.socket('pub');
        pubSocket.bind("tcp://" + ipAddr + ':' + subPort);

        // receive messages on the subSocket and republish on the pubSocket
        subSocket.on('message', function () {
            //pass to back
            pubSocket.send(Array.prototype.slice.call(arguments));
        });
    }
}

const ArgumentParser = require('argparse').ArgumentParser;
const parser = new ArgumentParser({
    addHelp: true,
    description: 'Banyan Backplane'
});

parser.addArgument(
    "-n", {dest: "backplane_name", defaultValue: "", help: "Name of this backplane"}
);

parser.addArgument(
    "-p", {dest: "publisher_port", defaultValue: '43124', help: "Publisher IP port"}
);
parser.addArgument(
    "-s", {dest: "subscriber_port", defaultValue: '43125', help: "Subscriber IP port"}
);
const args = parser.parseArgs();
new BackPlane({
    'subPort': args.subscriber_port,
    'pubPort': args.publisher_port, 'backplaneName': args.backplane_name
});
