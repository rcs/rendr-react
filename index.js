module.exports = {
  getMainView: function(views) {
    var contentNode = this.appView.$content.get(0);
    return _.find(views, function(view) {
      var viewNode;
      if( typeof view.getDOMNode === 'function' ) {
        viewNode = view.getDOMNode().parentNode;
      } else {
        viewNode = view.$el.parent().get(0);
      }
      return viewNode === contentNode;
    });
  },
  View: require('./view')
};
