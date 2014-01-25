'use strict';

var _ = require('underscore'),
    Backbone = require('backbone'),
    BackboneListener = function() {},
    BackboneMixin;

_.extend(BackboneListener.prototype, Backbone.Events);

BackboneMixin = {
  /* Internal: Register for change events on subscribable objects in props
   *
   * props - the props object to give to subscribable objects. Generaly
   *         this.props or nextProps in willReceiveProps
   *
   * Returns nothing
   *
   * Examples:
   *
   * this._backboneSubscribeObjects(this.props);
   *
   */
  _backboneSubscribeObjects: function(props) {
    this.props._subscribableObjects(props).forEach( function(obj) {
      if( obj instanceof Backbone.Model ) {
        this.props._backboneListener.listenTo(
          obj,
          'change',
          this.props._modelUpdate,
          this
        );
      }
      else if( obj instanceof Backbone.Collection ) {
        this.props._backboneListener.listenTo(
          obj,
          'add remove reset sort change destroy',
          this.props._collectionUpdate,
          this
        );
      }
    }.bind(this));
  },

  /* React lifecycle: create a listener object for subscriptions and an
   * implementation for setting subscribables.
   *
   * Returns
   *
   * _backboneListener    - an object that will wire change events to state
   *                        callbacks
   * _subscribableObjects - a function that takes a props object and returns
   *                        the objects to subscribe to
   *
   */
  getDefaultProps: function() {
    return {
      _backboneListener: new BackboneListener(),
      _subscribableObjects: function(props) {
        return _.compact([props.model, props.collection]);
      },
      _backboneCollectionUpdate: function() { this.forceUpdate(); },
      _backboneModelUpdate: function() { this.forceUpdate(); }
    };
  },

  /* React lifecycle: Remove any listeners we've subscribed
   */
  componentWillUnmount: function() {
    this.props._backboneListener.stopListening();
  },

  /* React lifecycle: Register listeners to subscribable objects
   */
  componentDidMount: function() {
    this._backboneSubscribeObjects(this.props);
  },

  /* React lifecycle: Remove existing listeners, register listeners to new props
   */
  componentWillReceiveProps: function(nextProps) {
    this._backboneListener.stopListening();
    this._backboneSubscribeObjects(nextProps);
  },

};

module.exports = BackboneMixin;
