import {describe, it} from 'mocha';
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';

describe('Unit | Route | posts', function () {
    setupTest();

    it('calls suar unlock all when posts route is activated', function () {
        const route = this.owner.lookup('route:posts');
        const unlockAllStub = sinon.stub(route.suarLock, 'unlockAll').resolves();

        route.activate();

        expect(unlockAllStub.calledOnce).to.be.true;
    });

    it('does not call suar unlock all when pages route is activated', function () {
        const route = this.owner.lookup('route:pages');
        const unlockAllStub = sinon.stub(route.suarLock, 'unlockAll').resolves();

        route.activate();

        expect(unlockAllStub.called).to.be.false;
    });
});