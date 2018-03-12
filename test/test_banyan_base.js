/**
 * Created by afy on 5/27/17.
 */
const chai = require('chai');
const path = require('path');
const ip = require('ip');


// Tell chai that we'll be using the "should" style assertions.
chai.should();

const BanyanBase = require(path.join(__dirname, '../lib', 'banyan_base'));


describe('BanyanBase', () => {
    describe('#constructor', () => {
        let b; // banyan_base instance

        it('No parameters, backplane address set to ip of this computer', () => {
            b = new BanyanBase();
            const currentIpAddress = ip.address();
            b.backplaneIpAddress.should.equal(currentIpAddress);

        });

        it('Backplane IP specified', () => {
            b = new BanyanBase({'backplaneIpAddress': '111.222.333.444'});
            b.backplaneIpAddress.should.equal('111.222.333.444');
        });
    });

    describe('#set_subscriber_topic', () => {
        let b;

        it('Topic is valid string', () => {
            b = new BanyanBase();
            chai.expect(() => b.set_subscriber_topic('3')).to.not.throw('Topic must be of string type')
        });

        it('Topic is non-string', () => {
            b = new BanyanBase();
            chai.expect(() => b.set_subscriber_topic(3)).to.throw('Topic must be of string type')
        });
    });

    describe('#publish_payload', () => {
        let b;

        it('Topic is valid string', () => {

            b = new BanyanBase();
            chai.expect(() => b.publish_payload({'payload': 3}, "Topic").to.not.throw('Publisher topic must be a string'));
        });

        it('Topic is invalid string', () => {
            b = new BanyanBase();
            chai.expect(() => b.publish_payload({'payload': 3}, "Topic").to.throw('Publisher topic must be a string'));
        });
    });
});
