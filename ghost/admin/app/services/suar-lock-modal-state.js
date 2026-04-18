import Service from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class SuarLockModalStateService extends Service {
    @tracked lockedByUser = null;
    @tracked post = null;

    setLockData(lockedByUser, post = null) {
        this.lockedByUser = lockedByUser;
        this.post = post;
    }

    clearLockData() {
        this.lockedByUser = null;
        this.post = null;
    }

    getLockData() {
        return {
            lockedByUser: this.lockedByUser,
            post: this.post
        };
    }
}
