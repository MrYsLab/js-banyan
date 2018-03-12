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

 banyan_base.js
 */

/**
 * This is the base class for all JavaScript Banyan components. It encapsulates zeromq and message pack
 functionality. Its methods may be overridden by the user in the derived class to meet the needs of the component.

 * To derive a new class based on this class, place the following at the top of the new classes definition:
 *
 * const BanyanBase = require('./banyan_base.js');
 *
 * Adjust the path as necessary
 */
const msgpack = require("msgpack-lite");
const zmq = require('zeromq');
const ip = require('ip');

module.exports = class BanyanBase {

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


        // make all parameters available within this class
        this.subscriberPort = subscriberPort;
        this.publisherPort = publisherPort;
        this.processName = processName;
        this.buffer = undefined;

        // if backplane address is specified, use that address,
        // otherwise, use the address of the local computer.
        if (backplaneIpAddress) {
            this.backplaneIpAddress = backplaneIpAddress
        }
        else {
            this.backplaneIpAddress = ip.address();
        }

        // print a header to the console
        console.log('\n************************************************************');
        console.log(processName + ' using Back Plane IP address: ' + this.backplaneIpAddress);
        console.log('Subscriber Port = ' + this.subscriberPort);
        console.log('Publisher  Port = ' + this.publisherPort);
        console.log('************************************************************');

        // Setup and connect to the subscriber socket on the backplane.
        this.subscriber = zmq.socket('sub');
        this.subscriber.connect("tcp://" + this.backplaneIpAddress + ':' + this.subscriberPort);

        // Setup and connect to the subscriber socket on the backplane.
        this.publisher = zmq.socket('pub');
        this.publisher.connect("tcp://" + this.backplaneIpAddress + ':' + this.publisherPort);
    }

    /**
     * This method subscribes to the specified topic.
     * You can subscribe to multiple topics by calling this method for
     each topic.
     * @param topic: Topic string.
     */
    set_subscriber_topic(topic) {
        if (typeof topic === 'string' || topic instanceof String) {
            this.subscriber.subscribe(topic);
        }
        else {
            //Throw an exception
            throw Error('Topic must be of string type');
        }
    }


    //noinspection JSUnusedGlobalSymbols
    /**
     * This method will publish a banyan payload and its associated topic/
     * @param payload: A dictionary as a set of Name/value pairs
     * @param topic: Topic string associated with this payload
     */

    publish_payload(payload, topic) {
        if (typeof topic === 'string' || topic instanceof String) {
            this.buffer = msgpack.encode(payload);
            this.publisher.send([topic, this.buffer]);
        }
        else {
            throw new Error('Publisher topic must be a string');
        }
    }

    /**
     * This method receives incoming ZeroMQ messages for subscribed topics.
     * It processes these messages by calling the incoming_message_processing
     * method.
     */
    receive_loop() {
        this.subscriber.on('message', (topic, message) => {
            this.incoming_message_processing(topic.toString(), msgpack.decode(message));
        });
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Override this method with a custom handler for received subscribed messages/
     * @param topic: Topic string.
     * @param payload: Message payload in the form of one or more name/value pairs
     */
    incoming_message_processing(topic, payload) {
        console.log('received a message related to:', topic, 'containing payload:', payload);

    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * General cleanup before shutting down.
     */
    clean_up() {
        this.subscriber = null;
        this.publisher = null;
        //noinspection ES6ModulesDependencies,ES6ModulesDependencies
        process.exit(0)
    }

};

module.exports = BanyanBase;


/**
 * This is a sample of adding a command line parser to a JavaScript Banyan component.
 * If your run: node banyan_base.js -h, you would see this appear on the console:
 *
 usage: banyan_base.js [-h] [-b BACKPLANE_ADDRESS] [-n BACKPLANE_NAME]
 [-p PUBLISHER_PORT] [-s SUBSCRIBER_PORT]


 Banyan Backplane

 Optional arguments:
 -h, --help            Show this help message and exit.
 -b BACKPLANE_ADDRESS  Backplane Address
 -n BACKPLANE_NAME     Name of this backplane
 -p PUBLISHER_PORT     Publisher IP port
 -s SUBSCRIBER_PORT    Subscriber IP port



 const ArgumentParser = require('argparse').ArgumentParser;
 const parser = new ArgumentParser({
    addHelp:true,
    description: 'Banyan Backplane'
});

 parser.addArgument(
 "-b", {dest:"backplane_address", defaultValue:undefined, help:"Backplane Address"}
 );

 parser.addArgument(
 "-n", {dest:"backplane_name", defaultValue:'GIVE_ME_A_NAME', help:"Name of this backplane"}
 );

 parser.addArgument(
 "-p", {dest: "publisher_port", defaultValue: '43124', help: "Publisher IP port"}
 );
 parser.addArgument(
 "-s", {dest: "subscriber_port", defaultValue: '43125', help: "Subscriber IP port"}

 );
 const args = parser.parseArgs();


 new BanyanBase({'backplaneIpAddress': args.backplane_address, 'subscriberPort': args.subscriber_port,
    'publisherPort': args.publisher_port, 'processName': args.backplane_name});

 */