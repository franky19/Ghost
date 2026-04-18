import Component from '@glimmer/component';
import {inject as service} from '@ember/service';

export default class SuarLockModal extends Component {
    @service router;
    @service('suar-lock-modal-state') suarLockModalState;

    static modalOptions = {
        className: 'fullscreen-modal-total-overlay fullscreen-modal-suar-lock',
        backgroundBlur: true
    };

    constructor(owner, args) {
        super(owner, args);
    }

    get post() {
        return this.suarLockModalState?.post ?? null;
    }

    get lockedByUser() {
        // Source 1: From injected service (primary source)
        const serviceData = this.suarLockModalState?.lockedByUser;
        if (serviceData?.id) {
            return serviceData;
        }
        
        // Source 2: From @model argument
        if (this.args.model?.id && (this.args.model?.name || this.args.model?.email)) {
            return this.args.model;
        }
        
        return null;
    }

    get lockedByUserName() {
        return this.lockedByUser?.name ?? 'User lain';
    }

    get lockedByUserEmail() {
        return this.lockedByUser?.email ?? 'Email tidak tersedia';
    }

    get lockedByUserAvatar() {
        return this.lockedByUser?.profile_image ?? null;
    }

    get hasLockedByUserAvatar() {
        return Boolean(this.lockedByUserAvatar);
    }

    get debugServiceState() {
        return this.serializeDebugValue({
            lockedByUser: this.suarLockModalState?.lockedByUser,
            postId: this.post?.id ?? null,
            postTitle: this.post?.title ?? null,
            postLockUser: this.post?.suarLock?.user ?? null
        });
    }

    get debugServiceLockedByUser() {
        return this.serializeDebugValue(this.suarLockModalState?.lockedByUser);
    }

    get debugServicePost() {
        return this.serializeDebugValue({
            id: this.post?.id ?? null,
            title: this.post?.title ?? null,
            suarLock: this.post?.suarLock ?? null
        });
    }

    get debugServicePostLockUser() {
        return this.serializeDebugValue(this.post?.suarLock?.user);
    }

    get debugLockedByUser() {
        return this.serializeDebugValue(this.lockedByUser);
    }

    get debugVisibleUserFields() {
        return this.serializeDebugValue({
            name: this.lockedByUserName,
            email: this.lockedByUserEmail,
            avatar: this.lockedByUserAvatar
        });
    }

    serializeDebugValue(value) {
        if (value === undefined) {
            return 'undefined';
        }

        if (value === null) {
            return 'null';
        }

        try {
            return JSON.stringify(value, null, 2);
        } catch (error) {
            return `[unserializable: ${error.message}]`;
        }
    }
}
