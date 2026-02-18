/* eslint-disable camelcase */
import AuthenticatedRoute from 'ghost-admin/routes/authenticated';
import {ALL_POST_INCLUDES} from '../../adapters/post';
import {NotFoundError} from 'ember-ajax/errors';
import {pluralize} from 'ember-inflector';
import {inject as service} from '@ember/service';

export default class EditRoute extends AuthenticatedRoute {
    @service feature;
    @service suarLock;
    @service store;
    @service session;
    @service('suar-lock-modal-state') suarLockModalState;

    lockInfo = null;
    hasLock = false;

    getLockedByUser(post) {
        if (this.hasLock) {
            return null;
        }

        const lockedByUser = this.lockInfo?.locked_by ?? post.suarLock?.user ?? null;
        return lockedByUser;
    }

    async beforeModel(transition) {
        await super.beforeModel(...arguments);

        this.lockInfo = null;
        this.hasLock = false;

        const post_id = transition.to?.params?.post_id;

        if (post_id) {
            try {
                // 🔒 Attempt to lock post
                await this.suarLock.lock(post_id);
                this.hasLock = true;
            } catch (err) {
                // Try multiple paths to find locked_by info
                let lockedByInfo = null;

                // Path 1: Direct context (from ConflictError in backend)
                if (err.context?.locked_by) {
                    lockedByInfo = err.context;
                } else if (err.payload?.errors?.[0]?.context?.locked_by) {
                    // Path 2: errors array (if wrapped by HTTP adapter)
                    lockedByInfo = err.payload.errors[0].context;
                } else if (err.payload?.context?.locked_by) {
                    // Path 3: direct context property on payload
                    lockedByInfo = err.payload.context;
                } else if (err.payload?.locked_by) {
                    // Path 4: Check raw payload data
                    lockedByInfo = err.payload;
                }

                if (lockedByInfo && lockedByInfo.locked_by) {
                    this.lockInfo = lockedByInfo;
                } else if (lockedByInfo && lockedByInfo.id) {
                    // Last resort: try to set lockedByInfo directly if it has user data
                    this.lockInfo = {locked_by: lockedByInfo};
                }
            }
        }

        // reset editor state
        if (transition.urlMethod !== 'replace') {
            let editor = this.controllerFor('lexical-editor');
            editor.set('post', null);
            editor.reset();
        }
    }

    async model(params) {
        // eslint-disable-next-line camelcase
        let {type: modelName, post_id} = params;

        if (!['post', 'page'].includes(modelName)) {
            throw new NotFoundError();
        }

        let query = {
            id: post_id,
            include: ALL_POST_INCLUDES
        };

        const records = await this.store.query(modelName, query);
        let post = records.firstObject;

        // CASE: Post is in mobiledoc — convert to lexical
        if (post.mobiledoc) {
            post = await post.save({adapterOptions: {convertToLexical: 1}});
        }

        return post;
    }

    afterModel(post) {
        super.afterModel(...arguments);

        const user = this.session.user;
        const returnRoute = pluralize(post.constructor.modelName);

        // permission check
        if (user.isAuthorOrContributor && !post.isAuthoredByUser(user)) {
            return this.replaceWith(returnRoute);
        }
        
        // If the post is not a draft and user is contributor, redirect to index
        if (user.isContributor && !post.isDraft) {
            return this.replaceWith(returnRoute);
        }

        if (this.hasLock && post.suarLock) {
            post.set('suarLock', null);
        }
    }

    serialize(model) {
        return {
            type: model.constructor.modelName,
            post_id: model.id
        };
    }

    setupController(controller, post) {
        // For nested routes, we need to explicitly get the parent lexical-editor controller
        // The controller parameter is for the edit route, but we need to set on the parent
        super.setupController(controller, post);

        const lexicalEditorController = this.controllerFor('lexical-editor');
        const lockedByUser = this.getLockedByUser(post);

        // IMPORTANT: Call setPost FIRST - it calls reset() which might clear properties
        lexicalEditorController.setPost(post);

        // THEN set lockedByUser AFTER setPost to prevent it being reset
        lexicalEditorController.set('lockedByUser', lockedByUser);
        lexicalEditorController.set('showSuarLockModal', Boolean(lockedByUser));

        // ALSO set in the modal state service so modal component can access it
        this.suarLockModalState.setLockData(lockedByUser, post);
    }

    deactivate() {
        const editor = this.controllerFor('lexical-editor');
        const post = editor.post;

        if (post && this.hasLock) {
            this.suarLock.unlock(post.id);
        }

        // Clear the service data when leaving the route
        this.suarLockModalState.clearLockData();

        this.lockInfo = null;
        this.hasLock = false;
    }
}