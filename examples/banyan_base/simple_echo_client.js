#!/usr/bin/env node


/**
 Copyright (c) 2017, 2018 Alan Yorinks All right reserved.

 Python Banyan is free software; you can redistribute it and/or
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
 */
const BanyanBase = require('../../lib/banyan_base.js');

class SimpleEchoClient extends BanyanBase {

    constructor({number_of_messages = 1000} = {}) {

        super({
            processName: 'SimpleEchoClient'
        });

        this.set_subscriber_topic('reply');

        //sequence number of messages
        this.message_number = number_of_messages;
        this.number_of_messages = number_of_messages;

        //send the first message - make sure that the server is already started
        this.publish_payload({'message_number': this.message_number}, 'echo');
        this.message_number -= 1;

        //get the reply messages
        this.receive_loop();
    } // end of constructor

    incoming_message_processing(topic, payload) {

        if (payload['message_number'] === 0) {

            console.log(this.number_of_messages + ' messages sent and received');
            process.exit(0);
        }
        else {
            this.message_number -= 1;
            if (this.message_number >= 0) {
                this.publish_payload({'message_number': this.message_number}, 'echo');
            }
        }
    }
}

try {
    m = new SimpleEchoClient();
}
catch (err) {
    process.exit()
}