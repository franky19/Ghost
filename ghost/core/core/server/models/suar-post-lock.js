const ghostBookshelf = require('./base');

const SuarPostLock = ghostBookshelf.Model.extend({
    tableName: 'suar_post_lock',

    relationships: ['post', 'user'],

    post: function post() {
        return this.belongsTo('Post', 'post_id');
    },

    user: function user() {
        return this.belongsTo('User', 'user_id');
    }
}, {
    isLocked: async function isLocked(postId) {
        const lock = await this.where({post_id: postId}).fetch({require: false});
        return !!lock;
    },

    getLock: async function getLock(postId) {
        return await this.where({post_id: postId}).fetch({require: false});
    }
});

module.exports = {
    SuarPostLock: ghostBookshelf.model('SuarPostLock', SuarPostLock)
};
