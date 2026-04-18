import Model, {attr, belongsTo} from '@ember-data/model';

export default Model.extend({
    post: belongsTo('post', {async: false}),
    user: belongsTo('user', {async: false}),
    locked_at: attr('date')
});
