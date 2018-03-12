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

 monitor.js
 */

const BanyanBase = require('js-banyan/lib/banyan_base');

class Monitor extends BanyanBase {

    /**
     * The constructor sets up all the ZeroMQ "plumbing"
     * @param backplaneIpAddress: IP address of the machine running the
     *                            backplane. If not specified, the address
     *                            of the local machine will be used.
     * @param subscriberPort: banyan_base back plane subscriber port.
     This must match that of the banyan_base backplane.
     * @param publisherPort: banyan_base back plane publisher port. T
     *                        his must match that of the banyan_base backplane
     * @param processName: Component identifier.
     */
    constructor({
                    backplaneIpAddress = undefined, subscriberPort = '43125',
                    publisherPort = '43124', processName = 'GIVE_ME_A_NAME'
                } = {}) {

        // Initialize the parent class
        super({
            backplaneIpAddress: backplaneIpAddress, subscriberPort: subscriberPort,
            publisherPort: publisherPort, processName: processName
        });

        // accept all messages
        this.set_subscriber_topic('');

        // start the receive loop - it is in BanyanBase
        this.receive_loop();

    }

    /**
     * This method overrides the base class method to allow all messages
     * to be printed to the console
     * @param topic: Message topic.
     * @param payload: Message payload.
     */

    incoming_message_processing(topic, payload) {
        console.log(topic, payload);
    }
}

const ArgumentParser = require('argparse').ArgumentParser;
const parser = new ArgumentParser({
    addHelp: true,
    description: 'Banyan Monitor'
});

parser.addArgument(
    "-b", {dest: "backplane_address", defaultValue: undefined, help: "Backplane Address"}
);

parser.addArgument(
    "-n", {dest: "backplane_name", defaultValue: 'Monitor', help: "Name of this backplane"}
);

parser.addArgument(
    "-p", {dest: "publisher_port", defaultValue: '43124', help: "Publisher IP port"}
);
parser.addArgument(
    "-s", {dest: "subscriber_port", defaultValue: '43125', help: "Subscriber IP port"}
);
const args = parser.parseArgs();


new Monitor({
    'backplaneIpAddress': args.backplane_address, 'subscriberPort': args.subscriber_port,
    'publisherPort': args.publisher_port, 'processName': args.backplane_name
});