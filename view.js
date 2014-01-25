'use strict';
var BaseView = require('rendr/shared/base/view');
var _ = require('underscore');

var React = require('react/addons');

var Backbone = require('backbone');
var BackboneMixin = require('./mixins/backbone');
var BackboneStateMixin = require('./mixins/backbone_state');

function attachNewInstance($el, parentView, baseOptions, callback) {
  /*jshint camelcase: false,  validthis: true, maxlen: 150 */
  var options = _.omit(baseOptions,'reactid','reactChecksum'),
      fetchSummary = options.fetch_summary,
      _this = this;

  if (!_.isEmpty(fetchSummary)) {
    options.app.fetcher.hydrate(fetchSummary, { app: options.app }, function(err, results) {
      _.extend(options, results || {});

      if (options.model != null) {
        if (!(options.model instanceof Backbone.Model) && options.model_name) {
          options.model = options.app.modelUtils.getModel(options.model_name, options.model, {
            parse: true
          });
        }
        options.model_name = options.model_name || options.app.modelUtils.modelName(options.model.constructor);
        options.model_id = options.model.id;
      }

      if (options.collection != null) {
        options.collection_name = options.collection_name || options.app.modelUtils.modelName(options.collection.constructor);
        options.collection_params = options.collection.params;
      }

      var view = _this(_.extend(options,results));
      view.attach($el.get(0),parentView);
      callback(null, view);

    });
  }
  else {
    var view = _this(options);
    view.attach($el.get(0),parentView);
    callback(null, view);
  }
}


var ReactView = function(spec) {
  var baseSpec = {
    // Rendr interface adapter
    mixins: [BackboneMixin,BackboneStateMixin],
    getDefaultProps: function() {
      var defaults = {},
          node = this,
          app;

      while( !(app = node.props.app) && node.props.__owner__ ) {
        node = node.props.__owner__;
      }
      defaults['app'] = app;

      return defaults;
    },

    /* Functions used by rendr ViewAdapter and viewEngine */
    attach: function(element, parentView) {
      React.renderComponent(this, element.parentNode);
    },

    // Rendr interface adapter - called for server rending
    getHtml: function(callback) {
      React.renderComponentToString(this,function(html) {
        callback(html);
      });
    },

    // Rendr interface adapter - called when a view is switched out
    remove: function() {
      React.unmountComponentAtNode(this.getDOMNode().parentNode);
    },

    getRootAttributes: function() {
      var context = {
        app: this.props.app,
        attributes: this.props.attributes,
        id: this.props.id,
        className: this.props.className,
        name: this.name,
        options: this.props
      };

      return BaseView.prototype.getAttributes.call(context);
    },

    _rendrDecorate: function( node ) {
      var newInstance = new node.constructor();
      var attributes = this.getRootAttributes.apply(this);
      attributes.displayName = this.displayName;
      newInstance.construct(_.defaults(node.props,
          _.omit(this.props,'view','tagName'),
          _.omit(attributes,'data-model_name','data-model_id','data-collection_name', 'data-collection_params')
          ));
      return newInstance;
    },
  };

  if( typeof spec.render !== 'function' ) {
    throw new Error('ReactRendr: Class spec must implement a render function');
  }

  spec.render = _.compose( function(node) {
    return this._rendrDecorate(node);
  }, spec.render);

  var reactClass = React.createClass(_.defaults({},spec,baseSpec));
  // TODO When a new react version gets cut, turn this into a method on the `statics` property of the spec
  reactClass.attachNewInstance = attachNewInstance;
  return reactClass;
};

// TODO Any good way to get a private instance of React.DOM to add this to?
ReactView.DOM = React.DOM;
ReactView.addons = React.addons;
ReactView.React = React;

module.exports = ReactView;
