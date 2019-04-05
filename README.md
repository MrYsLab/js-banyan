# js-banyan


## This is a JavaScript compatible version of the [Python Banyan Framework](https://mryslab.github.io/python_banyan/).

### Install with: npm js-banyan -g

Banyan is a lightweight, reactive framework used to create flexible, non-blocking, 
event driven, asynchronous applications. It was designed primarily to 
implement physical computing applications for devices such as the 
Raspberry Pi and Arduino, but it is not limited to just the physical computing domain, 
and may be used to create applications in any domain.

Banyan applications are comprised of a set of components, each component being a seperate process. 
Components communicate with each other by publishing and subscribing to language independent protocol messages.
As a result, any component can communicate with any other component, regardless of computer language.
Each Banyan component connects to a common Banyan backplane that distributes published messages to all message
subscribers. The backplane is provided as a command line executable as part of this package and is invoked with

```$xslt
jsbackplane
```

__MAKE SURE YOU START THE BACKPLANE BEFORE STARTING ANY COMPONENT (INCLUDE THE MONITOR)__

In addition a monitor command line monitor utility is also provided to monitor all backplane traffic.

```$xslt
jsmonitor
```

All Banyan components are created by inheriting from a simple base class.

The base class for JavaScript is called banyan_base.js, and here is its api:

```
class BanyanBase {

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
                } = {})
                
    /**
         * This method subscribes to the specified topic.
         * You can subscribe to multiple topics by calling this method for
         each topic.
         * @param topic: Topic string.
         */
        set_subscriber_topic(topic)
        
    /**
         * This method will publish a banyan payload and its associated topic/
         * @param payload: A dictionary as a set of Name/value pairs
         * @param topic: Topic string associated with this payload
         */
    
        publish_payload(payload, topic)
        
    /**
         * This method receives incoming ZeroMQ messages for subscribed topics.
         * It processes these messages by calling the incoming_message_processing
         * method.
         */
        receive_loop()
        
    /**
         * General cleanup before shutting down.
         */
        clean_up()    
```

Examples: An echo server and echo client

The Server

```$xslt
const BanyanBase = require('js-banyan/lib/banyan_base');

class SimpleEchoServer extends BanyanBase {

    constructor() {

        super({ processName: 'SimpleEchoServer'
        });

        this.set_subscriber_topic('echo');
        this.receive_loop();
    }

    incoming_message_processing( topic, payload) {
        this.publish_payload(payload, 'reply');
    }
}
try {
    new SimpleEchoServer();
}
catch(err){
    process.exit()
}
```

The Client
```$xslt
const BanyanBase = require('js-banyan/lib/banyan_base');

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
```

