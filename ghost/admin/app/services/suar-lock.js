import Service from '@ember/service';
import {inject as service} from '@ember/service';

export default class SuarLockService extends Service {
    @service ajax;
    @service ghostPaths;
    @service session;

    async lock(postId) {
        const url = this.ghostPaths.url.api(`posts/${postId}/suar-lock/`);

        // eslint-disable-next-line no-useless-catch
        try {
            await this.ajax.put(url, {
                headers: this.session.headers
            });
        } catch (error) {
            // Re-throw error agar bisa di-handle di route
            throw error;
        }
    }

    async unlock(postId) {
        const url = this.ghostPaths.url.api(`posts/${postId}/suar-unlock/`);

        // eslint-disable-next-line no-useless-catch
        try {
            await this.ajax.put(url, {
                headers: this.session.headers
            });
        } catch (error) {
            throw error;
        }
    }

    async unlockAll() {
        const url = this.ghostPaths.url.api('posts/suar-unlock-all/');

        // eslint-disable-next-line no-useless-catch
        try {
            const result = await this.ajax.put(url, {
                headers: this.session.headers
            });
            return result;
        } catch (error) {
            throw error;
        }
    }
}
