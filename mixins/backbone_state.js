'use strict';

var _ = require('underscore');

var BackboneStateMixin = {
  _backboneStateGetTemplateData: function() {
    if( typeof this.getTemplateData === 'function' ) {
      return this.getTemplateData.call(this);
    }

    if( this.props.model ) {
      return this.props.model.toJSON();
    }
    else if( this.props.collection ) {
      return {
        models: this.props.collection.toJSON(),
        meta: this.props.collection.meta,
        params: this.props.collection.params
      };
    }
    else {
      return _.clone(this.props);
    }
  },

  decorateTemplateData: function(data) {
    if( this.props.app ) {
      data._app = this.props.app;
    }
    if( this.props.model ) {
      data._model = this.props.model;
    }
    if( this.props.collection ) {
      data._collection = this.props.collection;
    }

    data._view = this;

    return data;
  },

  getInitialState: function() {
    return this.decorateTemplateData(
      this._backboneStateGetTemplateData()
    );
  },

  updateFromModelOrCollection: function() {
    var data = this.decorateTemplateData(
      this._backboneStateGetTemplateData()
    );
    this.setState(data);
  },
};

module.exports = BackboneStateMixin;
